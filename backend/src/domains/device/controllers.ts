import {requireUserAuthenticationState} from "@/middleware/authenticate.js";
import * as logic from "./model.js";
import {updateDeviceList, verifyNodeOwnerOrThrow} from "@/domains/node/model.js";
import express from "express";
import {z} from "zod";
import {getUserRoom} from "@/helpers/websocket-rooms.js";
import {WebsocketResponse} from "@/middleware/websocket.js";
import {emitDeviceAdd, emitDeviceDelete, emitDeviceStatus, emitDeviceUpdate} from "@/domains/device/events.js";
import {verifyDeviceOwnerOrThrow, wakeDevice} from "./model.js";

class HTTPController {
  @requireUserAuthenticationState(true)
  static async createDevice(req: express.Request<any, {
    nodeId: string,
    name: string,
    ipAddress: string,
    macAddress: string,
  }>, res: express.Response) {
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

  @requireUserAuthenticationState(true)
  static async patchDevice(req: express.Request<{
    id: string;
  }, {
    name?: string,
    ipAddress?: string,
    macAddress?: string,
  }>, res: express.Response) {
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

  @requireUserAuthenticationState(true)
  static async deleteDevice(req: express.Request<{
    id: string;
  }, {}>, res: express.Response) {
    const deviceId = z.string().cuid().parse(req.params.id);
    const device = await logic.getDevice(deviceId);
    await verifyDeviceOwnerOrThrow(req.user, device);
    await logic.deleteDevice(deviceId);
    await updateDeviceList(device.nodeId);
    emitDeviceDelete(req.user, device.id);
    res.jsonSuccess();
  }

  @requireUserAuthenticationState(true)
  static async getDevice(req: express.Request<{
    id: string;
  }, {}>, res: express.Response) {
    const deviceId = z.string().cuid().parse(req.params.id);
    const device = await logic.getDevice(deviceId);
    await verifyDeviceOwnerOrThrow(req.user, device);
    res.jsonSuccess(device);
  }

  @requireUserAuthenticationState(true)
  static async wakeDevice(req: express.Request<{
    id: string
  }>, res: express.Response) {
    const deviceId = z.string().cuid().parse(req.params.id);
    const device = await logic.getDevice(deviceId);
    await verifyDeviceOwnerOrThrow(req.user, device);
    await wakeDevice(device);
  }
}

class WebsocketController {
  static async receiveDevicePing(socket: Application.NodeWS, response: WebsocketResponse<void>, parameters: {
    id: string,
    online: boolean,
  }) {
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
