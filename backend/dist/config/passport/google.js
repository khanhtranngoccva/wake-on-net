import { Strategy } from "passport-google-oauth20";
import envHelper from "../../helpers/env-helper.js";
import prisma from "../../helpers/prisma.js";
async function callback(accessToken, refreshToken, params, profile, done) {
    try {
        const email = profile.emails[0]?.value;
        if (!email) {
            return done(new Error("This Google account does not have an email."), null);
        }
        const user = await prisma.user.upsert({
            where: {
                email,
            },
            create: {
                email,
                profilePicture: profile.profileUrl,
                displayName: profile.displayName,
            },
            update: {}
        });
        done(null, user);
    }
    catch (e) {
        done(e, null);
    }
}
const strategy = new Strategy({
    clientID: envHelper.get("GOOGLE_CLIENT_ID"),
    clientSecret: envHelper.get("GOOGLE_CLIENT_SECRET"),
    callbackURL: "/web/auth/google/callback",
    scope: ["email", "profile"]
}, callback);
export default strategy;
