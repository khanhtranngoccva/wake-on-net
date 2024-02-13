import express from "express";
import {createTotp, verifyTotpOrThrow} from "@/domains/totp/logic.ts";
import * as logic from "@/domains/node/model.ts";
import {
  getNodeOnlineStatus,
  getUserNodes,
  loginNode,
  updateDeviceList,
  verifyNodeOwnerOrThrow
} from "@/domains/node/model.ts";
import {z} from "zod";
import {requireUserAuthenticationState} from "@/middleware/authenticate.ts";
import {BadRequestError, ResourceUnboundError} from "@/helpers/errors.ts";
import {getNodeRoom, getUserRoom} from "@/helpers/websocket-rooms.ts";
import {WebsocketResponse} from "@/middleware/websocket.js";
import {emitNodeAdd, emitNodeDelete, emitNodeStatuses, emitNodeUpdate} from "@/domains/node/events.js";
import {emitDeviceAdd} from "@/domains/device/events.js";

class HTTPController {
  static async registerNode(req: express.Request, res: express.Response) {
    const totp = await createTotp();
    const node = await logic.registerNode({
      totpOrId: totp,
    });
    res.jsonSuccess(node);
  }

  @requireUserAuthenticationState(true)
  static async getAllNodes(req: express.Request, res: express.Response) {
    const nodes = await logic.getUserNodes(req.user, {
      name: z.string().optional().parse(req.query.name),
    });
    res.jsonSuccess(nodes);
  };

  @requireUserAuthenticationState(true)
  static async addNode(req: express.Request<any, {
    otp: string,
    id: string,
  }>, res: express.Response) {
    // Log in process.
    const user = req.user;
    const nodeId = z.string().cuid().parse(req.body.id);
    const inputOtp = z.string().parse(req.body.totp);
    const node = await logic.getNode(nodeId);
    if (node.userId) {
      throw new BadRequestError("This node has already been added to an account.");
    }
    await verifyTotpOrThrow(inputOtp, node.totp);
    const loggedInNode = await loginNode(user, node);

    // Extended query so that the imported node's devices can be updated in real-time.
    const fullNode = await logic.getNodeWithDevices(nodeId);
    emitNodeAdd(req.user, loggedInNode);
    for (let importedDevice of fullNode.devices) {
      emitDeviceAdd(req.user, importedDevice);
    }
    res.jsonSuccess(loggedInNode);
  }

  @requireUserAuthenticationState(true)
  static async patchNode(req: express.Request<{
    id: string;
  }, {
    name?: string
  }>, res: express.Response) {
    const nodeId = z.string().cuid().parse(req.params.id);
    const node = await logic.getNode(nodeId);
    await verifyNodeOwnerOrThrow(req.user, node);
    const newNode = await logic.patchNode(node, {
      name: z.string().optional().parse(req.body.name)
    });
    emitNodeUpdate(req.user, newNode);
    res.jsonSuccess(newNode);
  }

  @requireUserAuthenticationState(true)
  static async deleteNode(req: express.Request<{
    id: string;
  }>, res: express.Response) {
    const nodeId = z.string().cuid().parse(req.params.id);
    const node = await logic.getNode(nodeId);
    await verifyNodeOwnerOrThrow(req.user, node);
    await logic.deleteNode(node);
    emitNodeDelete(req.user, nodeId);
    res.jsonSuccess();
  }

  static async getCurrentNode(req: express.Request, res: express.Response) {
    const authenticationData = JSON.parse(Buffer.from(req.headers.authorization, "base64").toString("utf-8"));
    const nodeId = z.string().cuid().parse(authenticationData.nodeId);
    const inputOtp = z.string().parse(authenticationData.totp);
    const node = await logic.getNode(nodeId);
    await verifyTotpOrThrow(inputOtp, node.totp);
    res.jsonSuccess(node);
  }
}

class WebsocketController {
  static async authenticateNode(socket: Application.NodeWS, next: (err?: Error) => void) {
    const auth = socket.handshake.auth;
    let node: Awaited<ReturnType<typeof logic.getNode>>;
    try {
      let nodeId = z.string().cuid().parse(auth.nodeId);
      let inputTotp = z.string().regex(/^[0-9]{6,10}$/).parse(auth.totp);
      node = await logic.getNode(nodeId);
      await verifyTotpOrThrow(inputTotp, node.totp);
    } catch (e) {
      return next(e);
    }
    if (!node.userId) {
      return next(new ResourceUnboundError("This node must be bound to an user first!"));
    }
    socket.data.node = node;
    next();
  }

  static async nodeWSJoinRooms(socket: Application.NodeWS) {
    // This allows the websocket to be identifiable using the node ID.
    const nodeId = socket.data.node.id;
    await socket.join(getNodeRoom(nodeId));
  }

  static async handleNodeWSJoin(socket: Application.NodeWS) {
    // Update the node's lists.
    await updateDeviceList(socket.data.node);
    // Inform the user's web clients that the node is online.
    emitNodeStatuses(socket.data.node.userId, [{
      id: socket.data.node.id,
      online: true,
    }]);
  }

  static async handleNodeWSLeave(socket: Application.NodeWS) {
    const online = await getNodeOnlineStatus(socket.data.node);
    // Inform the user's web clients that the node is offline.
    emitNodeStatuses(socket.data.node.userId, [{
      id: socket.data.node.id,
      online: online,
    }]);
  }

  static async webWSJoinRooms(socket: Application.WebWS) {
    await socket.join(getUserRoom(socket.request.user));
  }

  static async getAllNodes(socket: Application.WebWS, response: WebsocketResponse, params?: {
    name?: string;
  }) {
    params ??= {};
    return getUserNodes(socket.request.user, {
      name: z.string().optional().parse(params.name),
    });
  }

  static async requestAllNodeStatus(socket: Application.WebWS) {
    const nodes = await getUserNodes(socket.request.user, {});
    const onlineStatuses = await Promise.all(nodes.map(async node => {
      return {
        id: node.id,
        online: await getNodeOnlineStatus(node),
      };
    }));
    emitNodeStatuses(socket.request.user, onlineStatuses);
  }
}

export default class NodeController {
  static http = HTTPController;
  static websocket = WebsocketController;
}
