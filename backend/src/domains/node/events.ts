import {Prisma} from "@/helpers/prisma.js";
import io from "@/config/server/websocket.js";
import {getUserRoom} from "@/helpers/websocket-rooms.js";

interface NodeStatus {
  id: string,
  online: boolean
}

export function emitNodeUpdate(userOrId: Express.User | string, node: Prisma.Node) {
  io.of("/web").to(getUserRoom(userOrId)).emit("node:update", node);
}

export function emitNodeAdd(userOrId: Express.User | string, node: Prisma.Node) {
  io.of("/web").to(getUserRoom(userOrId)).emit("node:add", node);
}

export function emitNodeStatus(userOrId: Express.User | string, status: NodeStatus) {
  io.of("/web").to(getUserRoom(userOrId)).emit("node:status", status);
}

export function emitNodeStatuses(userOrId: Express.User | string, statuses: NodeStatus[]) {
  for (let status of statuses) {
    emitNodeStatus(userOrId, status);
  }
}

export function emitNodeDelete(userOrId: Express.User | string, nodeId: string) {
  io.of("/web").to(getUserRoom(userOrId)).emit("node:delete", nodeId);
}