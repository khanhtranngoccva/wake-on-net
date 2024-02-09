import express from "express";
import NodeController from "@/domains/node/controllers.js";


const webNodesRouter = express.Router();
webNodesRouter.post("/", NodeController.http.addNode);

export default webNodesRouter;
