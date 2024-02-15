import express from "express";
import {requireUserAuthenticationState} from "@/middleware/authenticate.js";
import {SESSION_COOKIE_NAME} from "@/config/passport/index.js";
import envHelper from "@/helpers/env-helper.js";

class HTTPController {
  @requireUserAuthenticationState(true)
  static async signOut(req: express.Request, res: express.Response) {
    req.logout(() => {
      req.session.destroy(() => {
        res.jsonSuccess();
      });
    });
  }

  static async getCurrentUser(req: express.Request, res: express.Response) {
    res.jsonSuccess(req.user);
  }

  @requireUserAuthenticationState(true)
  static async webLogin(req: express.Request, res: express.Response) {
    const frontendURL = envHelper.get("FRONTEND_URL");
    // Tunnel cookie to frontend website
    res.cookie(SESSION_COOKIE_NAME, req.session.id, {
      ...req.session.cookie,
      secure: req.session.cookie.secure === "auto" ? req.secure : req.session.cookie.secure,
      domain: new URL(frontendURL).hostname,
    });
    res.redirect(frontendURL);
  }
}

export default class AuthController {
  static http = HTTPController;
}
