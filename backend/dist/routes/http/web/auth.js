import express from "express";
import passport from "passport";
import envHelper from "../../../helpers/env-helper.js";
import AuthController from "../../../domains/auth/controllers.js";
const webAuthRouter = express.Router();
webAuthRouter.get("/google", passport.authenticate("google"));
webAuthRouter.get("/google/callback", passport.authenticate("google", {
    successRedirect: envHelper.get("FRONTEND_URL")
}));
webAuthRouter.get("/logout", AuthController.http.signOut);
webAuthRouter.get("/current-user", AuthController.http.getCurrentUser);
export default webAuthRouter;
