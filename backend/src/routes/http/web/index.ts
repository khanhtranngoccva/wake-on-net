import express from "express";
import passport from "passport";
import envHelper from "@/helpers/env-helper.ts";
import webAuthRouter from "@/routes/http/web/auth.ts";
import webNodesRouter from "@/routes/http/web/node.ts";

const webRouter = express.Router();

webRouter.use("/auth", webAuthRouter);
webRouter.use("/nodes", webNodesRouter);


export default webRouter;
