import express from "express";
import {AlreadySignedInError, NoCredentialsError} from "@/helpers/errors.ts";

type ExpressController = (req: express.Request, res: express.Response, next?: express.NextFunction) => any;

export const requireUserAuthenticationState = function (param: boolean) {
  return function decorator(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<ExpressController>) {
    let method = descriptor.value;

    descriptor.value = function (req, res, next) {
      const authenticated = req.isAuthenticated();
      if (!authenticated && param) {
        throw new NoCredentialsError();
      } else if (authenticated && !param) {
        throw new AlreadySignedInError();
      }
      return method.call(this, req, res, next);
    };
  }
};
