import io from "../../config/server/websocket.js";
import { getUserRoom } from "../../helpers/websocket-rooms.js";
export function emitNodeUpdate(userOrId, node) {
    io.of("/web").to(getUserRoom(userOrId)).emit("node:update", node);
}
export function emitNodeAdd(userOrId, node) {
    io.of("/web").to(getUserRoom(userOrId)).emit("node:add", node);
}
export function emitNodeStatus(userOrId, status) {
    io.of("/web").to(getUserRoom(userOrId)).emit("node:status", status);
}
export function emitNodeStatuses(userOrId, statuses) {
    for (let status of statuses) {
        emitNodeStatus(userOrId, status);
    }
}
export function emitNodeDelete(userOrId, nodeId) {
    io.of("/web").to(getUserRoom(userOrId)).emit("node:delete", nodeId);
}
