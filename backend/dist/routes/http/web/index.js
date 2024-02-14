import express from "express";
import webAuthRouter from "../../../routes/http/web/auth.js";
import webNodesRouter from "../../../routes/http/web/node.js";
import webDevicesRouter from "../../../routes/http/web/devices.js";
const webRouter = express.Router();
webRouter.use("/auth", webAuthRouter);
webRouter.use("/nodes", webNodesRouter);
webRouter.use("/devices", webDevicesRouter);
export default webRouter;
