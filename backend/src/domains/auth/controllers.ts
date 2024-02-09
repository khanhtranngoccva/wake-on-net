import express from "express";

class HTTPController {
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
}

export default class AuthController {
  static http = HTTPController;
}
