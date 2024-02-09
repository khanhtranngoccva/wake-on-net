import prisma, {Prisma} from "@/helpers/prisma.ts";
import * as crypto from "crypto";
import {TOTP} from "totp-generator";
import {InvalidCredentialsError} from "@/helpers/errors.ts";
import base32Encode from "base32-encode";
import console from "console";

export async function createTotp() {
  return prisma.totp.create({
    data: {
      digits: 8,
      secret: crypto.randomBytes(32).toString("hex"),
      algorithm: "SHA256",
      interval: 30,
    }
  });
}

type TotpGenerationAlgorithm = Parameters<typeof TOTP.generate>[1]["algorithm"]
const algorithmTranslation: Record<Prisma.Totp["algorithm"], TotpGenerationAlgorithm> = {
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
type TotpGenerationParams = Prisma.Totp & {
  timestamp: number,
}

export async function verifyTotp(input: string, totpConfigOrId: Prisma.Totp | string) {
  let totpConfig: Prisma.Totp;
  if (typeof totpConfigOrId === "string") {
    totpConfig = await prisma.totp.findUniqueOrThrow({
      where: {
        id: totpConfigOrId,
      }
    });
  } else {
    totpConfig = totpConfigOrId;
  }
  let originalTime = Date.now();
  for (let i = 0; i < 2; i++) {
    let timestamp = originalTime - totpConfig.interval * i * 1000;
    let totpGenerationParams: TotpGenerationParams = {
      ...totpConfig,
      timestamp: timestamp
    };
    let serverTotp = generateTotp(totpGenerationParams).otp;
    if (serverTotp === input) {
      return true;
    }
  }
  return false;
}

export async function verifyTotpOrThrow(input: string, totpConfigOrId: Prisma.Totp | string) {
  if (!await verifyTotp(input, totpConfigOrId)) {
    throw new InvalidCredentialsError();
  }
}

function hexToBase32(hex: string) {
  const secretBuffer = Buffer.from(hex, "hex");
  return base32Encode(secretBuffer, "RFC3548", {
    padding: false
  });
}

export function generateTotp(params: TotpGenerationParams) {
  return TOTP.generate(hexToBase32(params.secret), {
    digits: params.digits,
    algorithm: algorithmTranslation[params.algorithm],
    timestamp: params.timestamp,
    period: params.interval,
  });
}
