import express from "express";
import NodeController from "../../../domains/node/controllers.js";
import DeviceController from "../../../domains/device/controllers.js";
const webNodesRouter = express.Router();
webNodesRouter.post("/", NodeController.http.addNode);
webNodesRouter.post("/:id/devices", DeviceController.http.createDevice);
webNodesRouter.patch("/:id", NodeController.http.patchNode);
webNodesRouter.delete("/:id", NodeController.http.deleteNode);
export default webNodesRouter;
