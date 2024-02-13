import express from "express";
import * as console from "console";
import {CustomError} from "@/helpers/errors.ts";
import {ZodError} from "zod";

export default function enableErrorHandling(app: express.Express) {
  app.use(async (err: unknown, req: express.Request, res: express.Response, next: () => void) => {
    if (err instanceof CustomError) {
      res.status(err.code).json({
        success: false,
        error: {
          type: err.constructor.name,
          message: err.message,
        }
      });
    } else if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          type: err.constructor.name,
          message: err.message,
        }
      });
    } else {
      // Forward the error to the log management software
      console.error(err);
      res.status(500).json({
        success: false,
        error: {
          type: "UnspecifiedError",
          message: "Unspecified server error."
        }
      });
    }
  });
}
