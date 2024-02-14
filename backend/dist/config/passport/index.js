import session from "express-session";
import { z } from "zod";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "../../helpers/prisma.js";
import passport from "passport";
import envHelper from "../../helpers/env-helper.js";
import google from "../../config/passport/google.js";
import { wrapExpressMiddleware } from "../../middleware/websocket.js";
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
const initializeUserField = (req, res, next) => {
    req.user = null;
    next();
};
export default function enablePassportAuth(app) {
    app.use(sessionMiddleware);
    app.use(initializeUserField);
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(google);
    passport.serializeUser(async (user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });
        if (!user)
            done(null, null);
        else
            done(null, user);
    });
}
export function enableWebsocketAuth(ns) {
    ns.use(wrapExpressMiddleware(sessionMiddleware));
    ns.use(wrapExpressMiddleware(initializeUserField));
    ns.use(wrapExpressMiddleware(passport.initialize()));
    ns.use(wrapExpressMiddleware(passport.session()));
}
