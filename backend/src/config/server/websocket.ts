import httpServer from "@/config/server/http.js";
import {Server} from "socket.io";

const io: Server = new Server(httpServer, {
  transports: ["websocket"],
});

export default io;
