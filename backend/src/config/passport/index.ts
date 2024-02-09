import express, {Express} from "express";
import session from "express-session";
import {z} from "zod";
import {PrismaSessionStore} from "@quixo3/prisma-session-store";
import prisma from "@/helpers/prisma.ts";
import passport from "passport";
import envHelper from "@/helpers/env-helper.ts";
import google from "@/config/passport/google.ts";
import {wrapExpressMiddleware} from "@/middleware/websocket.js";
import {Namespace, Server} from "socket.io";


let secret = z.string().min(8).parse(envHelper.get("SESSION_SECRET"));
let sessionMiddleware = session({
  saveUninitialized: false,
  secret: secret,
  resave: false,
  cookie: {
    sameSite: "strict",
  },
  store: new PrismaSessionStore(prisma, {})
});
const initializeUserField = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.user = null;
  next();
}

export default function enablePassportAuth(app: Express) {
  app.use(sessionMiddleware);
  app.use(initializeUserField);
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(google);
  passport.serializeUser(async (user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    const user = await prisma.user.findUnique({
      where: {id: id},
    });
    if (!user) done(null, null);
    else done(null, user);
  });
}

export function enableWebsocketAuth(ns: Namespace|Server) {
  ns.use(wrapExpressMiddleware(sessionMiddleware));
  ns.use(wrapExpressMiddleware(initializeUserField));
  ns.use(wrapExpressMiddleware(passport.initialize()));
  ns.use(wrapExpressMiddleware(passport.session()));
}
