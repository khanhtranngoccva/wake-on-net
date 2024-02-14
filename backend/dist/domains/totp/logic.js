import prisma from "@/helpers/prisma.js";
import * as crypto from "crypto";
import { TOTP } from "totp-generator";
import { InvalidCredentialsError } from "@/helpers/errors.js";
import base32Encode from "base32-encode";
export async function createTotp() {
    return prisma.totp.create({
        data: {
            digits: 8,
            secret: crypto.randomBytes(32).toString("hex"),
            algorithm: "SHA256",
            interval: 60,
        }
    });
}
const algorithmTranslation = {
    SHA1: "SHA-1",
    SHA224: "SHA-224",
    SHA256: "SHA-256",
    SHA384: "SHA-384",
    SHA512: "SHA-512",
    SHA3224: "SHA3-224",
    SHA3256: "SHA3-256",
    SHA3384: "SHA3-384",
    SHA3512: "SHA3-512",
};
export async function verifyTotp(input, totpConfigOrId) {
    let totpConfig;
    if (typeof totpConfigOrId === "string") {
        totpConfig = await prisma.totp.findUniqueOrThrow({
            where: {
                id: totpConfigOrId,
            }
        });
    }
    else {
        totpConfig = totpConfigOrId;
    }
    const totpDebug = [];
    let originalTime = Date.now();
    for (let i = 0; i < 2; i++) {
        let timestamp = originalTime - totpConfig.interval * i * 1000;
        let totpGenerationParams = {
            ...totpConfig,
            timestamp: timestamp
        };
        let serverTotp = generateTotp(totpGenerationParams).otp;
        totpDebug.push({
            timestamp: new Date(timestamp),
            otp: serverTotp
        });
        if (serverTotp === input) {
            return true;
        }
    }
    return false;
}
export async function verifyTotpOrThrow(input, totpConfigOrId) {
    if (!await verifyTotp(input, totpConfigOrId)) {
        throw new InvalidCredentialsError();
    }
}
function hexToBase32(hex) {
    const secretBuffer = Buffer.from(hex, "hex");
    return base32Encode(secretBuffer, "RFC3548", {
        padding: false
    });
}
export function generateTotp(params) {
    return TOTP.generate(hexToBase32(params.secret), {
        digits: params.digits,
        algorithm: algorithmTranslation[params.algorithm],
        timestamp: params.timestamp,
        period: params.interval,
    });
}
