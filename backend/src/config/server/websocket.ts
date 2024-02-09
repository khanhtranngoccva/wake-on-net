import httpServer from "@/config/server/http.ts";
import {Server} from "socket.io";

const io = new Server(httpServer, {
  transports: ["websocket"],
});

export default io;
