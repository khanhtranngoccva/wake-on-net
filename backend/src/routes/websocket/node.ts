import {Namespace, Server} from "socket.io";
import NodeController from "@/domains/node/controllers.js";
import DeviceController from "@/domains/device/controllers.js";
import {createWSControllerWrapper, createWSMiddlewareWrapper} from "@/middleware/websocket.js";

export default function websocketNodeRoutes(io: Server) {
  let namespace: Namespace;

  namespace = io.of("/node");
  namespace.use(createWSMiddlewareWrapper(NodeController.websocket.authenticateNode));
  namespace.on("connect", async socket => {
    const wrapper = createWSControllerWrapper(socket);
    await NodeController.websocket.nodeWSJoinRooms(socket);
    await NodeController.websocket.handleNodeWSJoin(socket);
    socket.on("device:ping", wrapper(DeviceController.websocket.receiveDevicePing));
    socket.on("disconnect", () => {
      NodeController.websocket.handleNodeWSLeave(socket);
    });
  });
}
