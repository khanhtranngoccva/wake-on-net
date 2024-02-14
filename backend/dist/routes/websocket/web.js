import NodeController from "@/domains/node/controllers.js";
import { enableWebsocketAuth } from "@/config/passport/index.js";
import { AuthenticationError } from "@/helpers/errors.js";
import { createWSControllerWrapper } from "@/middleware/websocket.js";
export default function websocketWebRoutes(io) {
    let namespace;
    namespace = io.of("/web");
    enableWebsocketAuth(namespace);
    namespace.use((socket, next) => {
        if (!socket.request.user) {
            next(new AuthenticationError());
        }
        else {
            next();
        }
    });
    namespace.on("connect", async (socket) => {
        const wrapper = createWSControllerWrapper(socket);
        await NodeController.websocket.webWSJoinRooms(socket);
        socket.on("node:get_all", wrapper(NodeController.websocket.getAllNodes));
        socket.on("node:request_status_all", wrapper(NodeController.websocket.requestAllNodeStatus));
    });
}
