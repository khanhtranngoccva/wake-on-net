import express, {Express} from "express";
import session from "express-session";
import {z} from "zod";
import {PrismaSessionStore} from "@quixo3/prisma-session-store";
import prisma from "@/helpers/prisma.js";
import passport from "passport";
import envHelper from "@/helpers/env-helper.js";
import google from "@/config/passport/google.js";
import {wrapExpressMiddleware} from "@/middleware/websocket.js";
import {Namespace, Server} from "socket.io";

export const SESSION_COOKIE_NAME = "connect.sid";
let secret = z.string().min(8).parse(envHelper.get("SESSION_SECRET"));

// Sessions that handle two different domains - one on the frontend and one for direct access for auth.
let frontendSessionMiddleware = session({
  saveUninitialized: false,
  secret: secret,
  resave: false,
  cookie: {
    sameSite: "strict",
    domain: new URL(envHelper.get("FRONTEND_URL")).hostname,
  },
  name: SESSION_COOKIE_NAME,
  store: new PrismaSessionStore(prisma, {})
});
let httpSessionMiddleware = session({
  saveUninitialized: false,
  secret: secret,
  resave: false,
  cookie: {
    sameSite: "strict",
  },
  name: SESSION_COOKIE_NAME,
  store: new PrismaSessionStore(prisma, {})
});

const initializeUserField = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.user = null;
  next();
}

export default function enablePassportAuth(app: Express) {
  app.use(frontendSessionMiddleware);
  app.use(httpSessionMiddleware);
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

export function enableWebsocketAuth(ns: Namespace | Server) {
  ns.use(wrapExpressMiddleware(httpSessionMiddleware));
  ns.use(wrapExpressMiddleware(frontendSessionMiddleware));
  ns.use(wrapExpressMiddleware(initializeUserField));
  ns.use(wrapExpressMiddleware(passport.initialize()));
  ns.use(wrapExpressMiddleware(passport.session()));
}
