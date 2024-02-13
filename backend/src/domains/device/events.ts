import {Prisma} from "@/helpers/prisma.js";
import io from "@/config/server/websocket.js";
import {getNodeRoom, getUserRoom} from "@/helpers/websocket-rooms.js";

interface DeviceStatus {
  id: string,
  online: boolean
}

export function emitDeviceAdd(userOrId: Express.User | string, device: Prisma.Device) {
  io.of("/web").to(getUserRoom(userOrId)).emit("device:add", device);
}

export function emitDeviceUpdate(userOrId: Express.User | string, device: Prisma.Device) {
  io.of("/web").to(getUserRoom(userOrId)).emit("device:update", device);
}

export function emitDeviceDelete(userOrId: Express.User | string, deviceId: string) {
  io.of("/web").to(getUserRoom(userOrId)).emit("device:delete", deviceId);
}

export function emitDeviceStatus(userOrId: Express.User | string, status: DeviceStatus) {
  io.of("/web").to(getUserRoom(userOrId)).emit("device:status", status);
}

export function emitDeviceWake(nodeOrId: Prisma.Node | string, deviceId: string) {
  io.of("/node").to(getNodeRoom(nodeOrId)).emit("device:wake", deviceId);
}