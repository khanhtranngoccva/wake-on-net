import express from "express";
import NodeController from "@/domains/node/controllers.js";

const nodeRouter = express.Router();

nodeRouter.post("/register", NodeController.http.registerNode);
nodeRouter.get("/current-node", NodeController.http.getCurrentNode);

export default nodeRouter;
