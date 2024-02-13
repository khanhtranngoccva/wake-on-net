import "@/application/configuration.js";
import app from "@/config/server/app.ts";
import enableErrorHandling from "@/middleware/errors.ts";
import {z} from "zod";
import envHelper from "@/helpers/env-helper.ts";
import setupRouter from "@/routes/index.ts";
import * as console from "console";
import * as http from "http";

// Express HTTP logic.
app.use("/setup", setupRouter);
enableErrorHandling(app);
const server = http.createServer(app);

// Zod library - ensures data is valid.
const port = z.coerce.number().positive().parse(envHelper.get("PORT"));

process.on("SIGTERM", () => {
  console.log("Server is shutting down!");
  server.close();
  process.exit(0);
});
console.log("Server can now exit gracefully.");

server.listen(port, () => {
  console.log(`Successfully bound to port ${port}`);
});
