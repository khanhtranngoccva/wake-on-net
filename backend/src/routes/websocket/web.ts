import {Namespace, Server} from "socket.io";
import NodeController from "@/domains/node/controllers.ts";
import DeviceController from "@/domains/device/controllers.ts";
import {enableWebsocketAuth} from "@/config/passport/index.js";
import {AuthenticationError} from "@/helpers/errors.js";
import {createWSControllerWrapper} from "@/middleware/websocket.js";
import App from "@/config/server/app.js";

export default function websocketWebRoutes(io: Server) {
  let namespace: Namespace;
  namespace = io.of("/web");
  enableWebsocketAuth(namespace);
  namespace.use((socket: Application.WS, next) => {
    if (!socket.request.user) {
      next(new AuthenticationError());
    } else {
      next();
    }
  })
  namespace.on("connect", async (socket: Application.WebWS) => {
    const wrapper = createWSControllerWrapper(socket);
    await NodeController.websocket.webWSJoinRooms(socket);
    socket.on("node:get_all", wrapper(NodeController.websocket.getAllNodes));
    socket.on("node:request_status_all", wrapper(NodeController.websocket.requestAllNodeStatus));
  });
}
