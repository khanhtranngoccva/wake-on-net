import {TOTP} from "totp-generator";
import base32Encode from "base32-encode";
import crypto from "crypto";
import console from "console";

type TotpGenerationAlgorithm = Parameters<typeof TOTP.generate>[1]["algorithm"]
const algorithmTranslation: Record<Application.Totp["algorithm"], TotpGenerationAlgorithm> = {
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
type TotpGenerationParams = Application.Totp & {
  timestamp: number,
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
