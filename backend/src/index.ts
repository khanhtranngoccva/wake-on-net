import app from "@/config/server/app.ts";
import server from "@/config/server/http.ts";
import io from "@/config/server/websocket.ts";
import enableErrorHandling from "@/middleware/errors.ts";
import webRouter from "@/routes/http/web/index.ts";
import envHelper from "@/helpers/env-helper.ts";
import {z} from "zod";
import enableWebsocketErrorHandling from "@/middleware/websocket.ts";
import nodeRouter from "@/routes/http/node/index.js";
import console from "console";
import websocketNodeRoutes from "@/routes/websocket/node.js";
import websocketWebRoutes from "@/routes/websocket/web.js";

// Express HTTP routes.
app.use("/web", webRouter);
app.use("/node", nodeRouter);
enableErrorHandling(app);

// Websocket routes.
enableWebsocketErrorHandling(io);
websocketNodeRoutes(io);
websocketWebRoutes(io);

// Zod library - ensures data is valid.
const port = z.coerce.number().positive().parse(envHelper.get("PORT"));

process.on("SIGTERM", () => {
  console.log("Server is shutting down!");
  server.close();
  process.exit(0);
});
console.log("Server can now exit gracefully.");

server.listen(port, () => {
  console.log(`Successfully listening to port ${port}`);
});




