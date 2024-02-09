import express from "express";
import {createTotp, verifyTotpOrThrow} from "@/domains/totp/logic.ts";
import * as logic from "@/domains/node/logic.ts";
import {getNodeOnlineStatus, getUserNodes, loginNode} from "@/domains/node/logic.ts";
import {z} from "zod";
import {requireUserAuthenticationState} from "@/middleware/authenticate.ts";
import {BadRequestError, InvalidCredentialsError, ResourceUnboundError} from "@/helpers/errors.ts";
import {getNodeRoom, getUserRoom} from "@/helpers/websocket-rooms.ts";
import {WebsocketResponse} from "@/middleware/websocket.js";
import console from "console";
import io from "@/config/server/websocket.js";

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
    const user = req.user;
    const nodeId = z.string().cuid().parse(req.body.id);
    const inputOtp = z.string().parse(req.body.totp);
    const node = await logic.getNode(nodeId);
    if (node.userId) {
      throw new BadRequestError("This node has already been added to an account.");
    }
    await verifyTotpOrThrow(inputOtp, node.totp);
    await loginNode(user, node);
    res.jsonSuccess(node);
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
      console.error(e);
      return next(new InvalidCredentialsError("Invalid login credentials"));
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
    // Inform the user's web clients that the node is online.
    io.of("/web").to(getUserRoom(socket.data.node.userId)).emit("node:online_status", [{
      id: socket.data.node.id,
      online: true,
    }]);
  }

  static async handleNodeWSLeave(socket: Application.NodeWS) {
    const online = await getNodeOnlineStatus(socket.data.node);
    // Inform the user's web clients that the node is offline.
    io.of("/web").to(getUserRoom(socket.data.node.userId)).emit("node:online_status", [{
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
    const onlineStatus = await Promise.all(nodes.map(async node => {
      return {
        id: node.id,
        online: await getNodeOnlineStatus(node),
      };
    }));
    io.of("/web").to(getUserRoom(socket.request.user)).emit("node:online_status", onlineStatus);
  }
}

export default class NodeController {
  static http = HTTPController;
  static websocket = WebsocketController;
}
