import io from "@/config/server/websocket.js";
import { getNodeRoom, getUserRoom } from "@/helpers/websocket-rooms.js";
export function emitDeviceAdd(userOrId, device) {
    io.of("/web").to(getUserRoom(userOrId)).emit("device:add", device);
}
export function emitDeviceUpdate(userOrId, device) {
    io.of("/web").to(getUserRoom(userOrId)).emit("device:update", device);
}
export function emitDeviceDelete(userOrId, deviceId) {
    io.of("/web").to(getUserRoom(userOrId)).emit("device:delete", deviceId);
}
export function emitDeviceStatus(userOrId, status) {
    io.of("/web").to(getUserRoom(userOrId)).emit("device:status", status);
}
export function emitDeviceWake(nodeOrId, deviceId) {
    io.of("/node").to(getNodeRoom(nodeOrId)).emit("device:wake", deviceId);
}
