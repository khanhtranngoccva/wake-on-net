import express from "express";
import SetupController from "@/domains/setup/controllers.ts";

const setupRouter = express.Router();
setupRouter.get("/config", SetupController.getSetupConfig);

export default setupRouter;
