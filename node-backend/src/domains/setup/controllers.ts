import express from "express";
import {getNode} from "@/application/setup.js";
import {loadedConfig} from "@/application/configuration.js";
import {generateTotp} from "@/helpers/totp.js";
import {AlreadySignedInError, UnavailableError} from "@/helpers/errors.js";


export default class SetupController {
  static async getSetupConfig(req: express.Request, res: express.Response) {
    if (!loadedConfig) {
      throw new UnavailableError();
    }
    const currentOtp = generateTotp({
      ...loadedConfig.totp,
      timestamp: Math.floor(Date.now()),
    }).otp;
    const node = await getNode({
      nodeId: loadedConfig.id,
      totp: currentOtp,
    });
    if (node.userId) {
      throw new AlreadySignedInError("Node has already been assigned. Please deactivate the node first.");
    }
    res.jsonSuccess({
      nodeId: loadedConfig.id,
      totp: currentOtp,
    });
  }
}
