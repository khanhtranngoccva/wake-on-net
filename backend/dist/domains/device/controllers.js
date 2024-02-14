var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { requireUserAuthenticationState } from "../../middleware/authenticate.js";
import * as logic from "./model.js";
import { updateDeviceList, verifyNodeOwnerOrThrow } from "../../domains/node/model.js";
import express from "express";
import { z } from "zod";
import { emitDeviceAdd, emitDeviceDelete, emitDeviceStatus, emitDeviceUpdate } from "../../domains/device/events.js";
import { verifyDeviceOwnerOrThrow, wakeDevice } from "./model.js";
class HTTPController {
    static async createDevice(req, res) {
        const nodeId = z.string().cuid().parse(req.body.nodeId);
        await verifyNodeOwnerOrThrow(req.user, nodeId);
        const device = await logic.createDevice(nodeId, {
            name: z.string().parse(req.body.name),
            macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).parse(req.body.macAddress),
            ipAddress: z.string().regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/).parse(req.body.ipAddress),
        });
        await updateDeviceList(nodeId);
        emitDeviceAdd(req.user, device);
        res.jsonSuccess(device);
    }
    static async patchDevice(req, res) {
        const deviceId = z.string().cuid().parse(req.params.id);
        await verifyDeviceOwnerOrThrow(req.user, deviceId);
        const device = await logic.patchDevice(deviceId, {
            name: z.string().optional().parse(req.body.name),
            macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).optional().parse(req.body.macAddress),
            ipAddress: z.string().regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/).optional().parse(req.body.ipAddress),
        });
        await updateDeviceList(device.nodeId);
        emitDeviceUpdate(req.user, device);
        res.jsonSuccess(device);
    }
    static async deleteDevice(req, res) {
        const deviceId = z.string().cuid().parse(req.params.id);
        const device = await logic.getDevice(deviceId);
        await verifyDeviceOwnerOrThrow(req.user, device);
        await logic.deleteDevice(deviceId);
        await updateDeviceList(device.nodeId);
        emitDeviceDelete(req.user, device.id);
        res.jsonSuccess();
    }
    static async getDevice(req, res) {
        const deviceId = z.string().cuid().parse(req.params.id);
        const device = await logic.getDevice(deviceId);
        await verifyDeviceOwnerOrThrow(req.user, device);
        res.jsonSuccess(device);
    }
    static async wakeDevice(req, res) {
        const deviceId = z.string().cuid().parse(req.params.id);
        const device = await logic.getDevice(deviceId);
        await verifyDeviceOwnerOrThrow(req.user, device);
        await wakeDevice(device);
    }
}
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "createDevice", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "patchDevice", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "deleteDevice", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "getDevice", null);
__decorate([
    requireUserAuthenticationState(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HTTPController, "wakeDevice", null);
class WebsocketController {
    static async receiveDevicePing(socket, response, parameters) {
        emitDeviceStatus(socket.data.node.userId, {
            id: z.string().cuid().parse(parameters.id),
            online: z.boolean().parse(parameters.online),
        });
    }
}
export default class DeviceController {
    static http = HTTPController;
    static websocket = WebsocketController;
}
