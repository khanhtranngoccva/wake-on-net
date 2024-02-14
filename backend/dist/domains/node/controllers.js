var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import express from "express";
import { createTotp, verifyTotpOrThrow } from "../../domains/totp/logic.js";
import * as logic from "../../domains/node/model.js";
import { getNodeOnlineStatus, getUserNodes, loginNode, updateDeviceList, verifyNodeOwnerOrThrow } from "../../domains/node/model.js";
import { z } from "zod";
import { requireUserAuthenticationState } from "../../middleware/authenticate.js";
import { BadRequestError, ResourceUnboundError } from "../../helpers/errors.js";
import { getNodeRoom, getUserRoom } from "../../helpers/websocket-rooms.js";
import { emitNodeAdd, emitNodeDelete, emitNodeStatuses, emitNodeUpdate } from "../../domains/node/events.js";
import { emitDeviceAdd } from "../../domains/device/events.js";
class HTTPController {
    static async registerNode(req, res) {
        const totp = await createTotp();
        const node = await logic.registerNode({
            totpOrId: totp,
        });
        res.jsonSuccess(node);
    }
    static async getAllNodes(req, res) {
        const nodes = await logic.getUserNodes(req.user, {
            name: z.string().optional().parse(req.query.name),
        });
        res.jsonSuccess(nodes);
    }
    ;
    static async addNode(req, res) {
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
    static async patchNode(req, res) {
        const nodeId = z.string().cuid().parse(req.params.id);
        const node = await logic.getNode(nodeId);
        await verifyNodeOwnerOrThrow(req.user, node);
        const newNode = await logic.patchNode(node, {
            name: z.string().optional().parse(req.body.name)
        });
        emitNodeUpdate(req.user, newNode);
        res.jsonSuccess(newNode);
    }
    static async deleteNode(req, res) {
        const nodeId = z.string().cuid().parse(req.params.id);
        const node = await logic.getNode(nodeId);
        await verifyNodeOwnerOrThrow(req.user, node);
        await logic.deleteNode(node);
        emitNodeDelete(req.user, nodeId);
        res.jsonSuccess();
    }
    static async getCurrentNode(req, res) {
        const authenticationData = JSON.parse(Buffer.from(req.headers.authorization, "base64").toString("utf-8"));
        const nodeId = z.string().cuid().parse(authenticationData.nodeId);
        const inputOtp = z.string().parse(authenticationData.totp);
        const node = await logic.getNode(nodeId);
        await verifyTotpOrThrow(inputOtp, node.totp);
        res.jsonSuccess(node);
    }
}
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "getAllNodes", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "addNode", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "patchNode", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "deleteNode", null);
class WebsocketController {
    static async authenticateNode(socket, next) {
        const auth = socket.handshake.auth;
        let node;
        try {
            let nodeId = z.string().cuid().parse(auth.nodeId);
            let inputTotp = z.string().regex(/^[0-9]{6,10}$/).parse(auth.totp);
            node = await logic.getNode(nodeId);
            await verifyTotpOrThrow(inputTotp, node.totp);
        }
        catch (e) {
            return next(e);
        }
        if (!node.userId) {
            return next(new ResourceUnboundError("This node must be bound to an user first!"));
        }
        socket.data.node = node;
        next();
    }
    static async nodeWSJoinRooms(socket) {
        // This allows the websocket to be identifiable using the node ID.
        const nodeId = socket.data.node.id;
        await socket.join(getNodeRoom(nodeId));
    }
    static async handleNodeWSJoin(socket) {
        // Update the node's lists.
        await updateDeviceList(socket.data.node);
        // Inform the user's web clients that the node is online.
        emitNodeStatuses(socket.data.node.userId, [{
                id: socket.data.node.id,
                online: true,
            }]);
    }
    static async handleNodeWSLeave(socket) {
        const online = await getNodeOnlineStatus(socket.data.node);
        // Inform the user's web clients that the node is offline.
        emitNodeStatuses(socket.data.node.userId, [{
                id: socket.data.node.id,
                online: online,
            }]);
    }
    static async webWSJoinRooms(socket) {
        await socket.join(getUserRoom(socket.request.user));
    }
    static async getAllNodes(socket, response, params) {
        params ??= {};
        return getUserNodes(socket.request.user, {
            name: z.string().optional().parse(params.name),
        });
    }
    static async requestAllNodeStatus(socket) {
        const nodes = await getUserNodes(socket.request.user, {});
        const onlineStatuses = await Promise.all(nodes.map(async (node) => {
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
