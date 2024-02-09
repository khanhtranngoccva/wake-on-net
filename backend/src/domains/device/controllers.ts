import {requireUserAuthenticationState} from "@/middleware/authenticate.ts";
import * as logic from "./logic.ts";
import {updateDeviceList, verifyNodeOwnerOrThrow} from "@/domains/node/logic.ts";
import express from "express";
import {z} from "zod";
import {verifyDeviceOwnerOrThrow, wakeDevice} from "./logic.ts";
import {getUserRoom} from "@/helpers/websocket-rooms.ts";
import {WebsocketResponse} from "@/middleware/websocket.js";

export default class DeviceController {
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
    res.jsonSuccess(device);
  }

  @requireUserAuthenticationState(true)
  static async wakeDevice(req: express.Request<any, {
    deviceId: string,
  }>, res: express.Response) {
    const deviceId = z.string().cuid().parse(req.body.deviceId);
    const device = await logic.getDevice(deviceId);
    await verifyDeviceOwnerOrThrow(req.user, device);
    await wakeDevice(device);
  }

  static async receiveDevicePing(socket: Application.NodeWS, response: WebsocketResponse<void>, parameters: {
    deviceId: string,
    success: boolean,
    delay: number,
  }) {
    socket.to(getUserRoom(socket.data.node.userId)).emit("device:ping", parameters);
  }
}
