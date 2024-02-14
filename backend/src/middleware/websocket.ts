import {Server, Socket} from "socket.io";
import {CustomError} from "@/helpers/errors.js";
import express from "express";
import console from "console";
import {ZodError} from "zod";

interface WebsocketSuccessResponse<ResponseType> {
  success: true,
  data: ResponseType,
}

interface WebsocketFailureResponse {
  success: false,
  error: {
    type: string,
    message: string,
  }
}

type WebsocketCallback<ResponseType = any> = (data: WebsocketSuccessResponse<ResponseType> | WebsocketFailureResponse) => void;

export class WebsocketResponse<ResponseType = any> {
  readonly #callback: WebsocketCallback<ResponseType>
  #responded = false;

  get responded() {
    return this.#responded;
  }

  constructor(callback: WebsocketCallback<ResponseType>) {
    this.#callback = callback;
  }

  success(data: ResponseType) {
    if (this.responded) {
      throw new Error("Response has already been sent.");
    }
    this.#callback({
      success: true,
      data: data,
    });
  }

  fail(error: Error) {
    if (this.responded) {
      throw new Error("Response has already been sent.");
    }
    this.#callback({
      success: false,
      error: {
        type: error.name,
        message: error.message,
      }
    });
  }
}

type ExpressController = (req: express.Request, res: express.Response, next?: express.NextFunction) => any;
type WebsocketController<ResponseType = any> = (
  socket: Socket,
  response: WebsocketResponse<ResponseType>,
  ...args: any[]) => ResponseType | Promise<ResponseType>;


// Middleware error handling.
export default function enableWebsocketErrorHandling(server: Server) {
  server.use(async (socket, next: (err?: Error) => void | Promise<void>) => {
    try {
      await next();
    } catch (e) {
      if (e instanceof CustomError) {
        next(e);
      } else {
        next(new Error("Unspecified Websocket server error."));
      }
    }
  });
}

export const wrapExpressMiddleware = (middleware: ExpressController) => {
  return (socket: Socket, next: () => void) => {
    try {
      middleware(socket.request as express.Request, {} as express.Response, next);
    } catch (e) {
      console.error(e);
    }
  }
}

// Controller response and error handling.
export function createWSControllerWrapper(socket: Socket) {
  return function wrapController<ResponseType = any>(controller: WebsocketController<ResponseType>) {
    const func = async function (...args: any[]) {
      // The last item in the argument is always a callback.
      const callback: WebsocketCallback<ResponseType> = args.pop();
      if (typeof callback !== "function") {
        // Shut down the socket if it is non-compliant.
        socket.disconnect(true);
      }
      // Construct response object.
      const responseObject = new WebsocketResponse(callback);
      try {
        const result: ResponseType = await controller(socket, responseObject, ...args);
        // Implicit response.
        if (!responseObject.responded) {
          responseObject.success(result);
        }
      } catch (e) {
        // Custom errors and validation errors.
        if (e instanceof CustomError || e instanceof ZodError) {
          responseObject.fail(e);
        } else {
          console.error(e);
          responseObject.fail(new Error("Unspecified server error."));
        }
      }
    }
    return func;
  }
}
