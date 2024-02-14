import { CustomError } from "@/helpers/errors.js";
import console from "console";
import { ZodError } from "zod";
export class WebsocketResponse {
    #callback;
    #responded = false;
    get responded() {
        return this.#responded;
    }
    constructor(callback) {
        this.#callback = callback;
    }
    success(data) {
        if (this.responded) {
            throw new Error("Response has already been sent.");
        }
        this.#callback({
            success: true,
            data: data,
        });
    }
    fail(error) {
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
// Middleware error handling.
export default function enableWebsocketErrorHandling(server) {
    server.use(async (socket, next) => {
        try {
            await next();
        }
        catch (e) {
            if (e instanceof CustomError) {
                next(e);
            }
            else {
                next(new Error("Unspecified Websocket server error."));
            }
        }
    });
}
export const wrapExpressMiddleware = (middleware) => {
    return (socket, next) => {
        try {
            middleware(socket.request, {}, next);
        }
        catch (e) {
            console.error(e);
        }
    };
};
// Controller response and error handling.
export function createWSControllerWrapper(socket) {
    return function wrapController(controller) {
        const func = async function (...args) {
            // The last item in the argument is always a callback.
            const callback = args.pop();
            if (typeof callback !== "function") {
                // Shut down the socket if it is non-compliant.
                socket.disconnect(true);
            }
            // Construct response object.
            const responseObject = new WebsocketResponse(callback);
            try {
                const result = await controller(socket, responseObject, ...args);
                // Implicit response.
                if (!responseObject.responded) {
                    responseObject.success(result);
                }
            }
            catch (e) {
                // Custom errors and validation errors.
                if (e instanceof CustomError || e instanceof ZodError) {
                    responseObject.fail(e);
                }
                else {
                    console.error(e);
                    responseObject.fail(new Error("Unspecified server error."));
                }
            }
        };
        return func;
    };
}
