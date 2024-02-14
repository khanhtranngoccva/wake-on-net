import app from "@/config/server/app.js";
import server from "@/config/server/http.js";
import io from "@/config/server/websocket.js";
import enableErrorHandling from "@/middleware/errors.js";
import webRouter from "@/routes/http/web/index.js";
import envHelper from "@/helpers/env-helper.js";
import {z} from "zod";
import nodeRouter from "@/routes/http/node/index.js";
import console from "console";
import websocketNodeRoutes from "@/routes/websocket/node.js";
import websocketWebRoutes from "@/routes/websocket/web.js";

// Express HTTP logic.
app.use("/web", webRouter);
app.use("/node", nodeRouter);
enableErrorHandling(app);

// Websocket logic.
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




