import io, {Socket} from "socket.io-client";
import envHelper from "@/helpers/env-helper.js";
import {generateTotp} from "@/helpers/totp.js";
import * as console from "console";
import {SocketIOError} from "@/helpers/errors.js";
import {delay} from "@/helpers/timing.js";
import {regenerateConfig} from "@/application/configuration.js";

const WEBSOCKET_NODE_API_URL = new URL("/node", envHelper.get("BACKEND_WS_URL")).toString();

class NodeSocket {
  #params: Application.NodeConfig;
  #socket: Socket;
  #hasDumpedAuthParams = false;
  #connectSuccess = false;
  #disconnected = false;
  #invalidCredentialsTimes = 0;

  constructor(params: Application.NodeConfig) {
    const clonedParams = structuredClone(params);
    this.#params = clonedParams;
    const totpCode = generateTotp({
      ...clonedParams.totp,
      timestamp: Math.floor(Date.now()),
    }).otp;
    this.#socket = io(WEBSOCKET_NODE_API_URL, {
      transports: ["websocket"],
      auth: {
        nodeId: clonedParams.id,
        totp: totpCode,
      }
    });
    this.#socket.connect();
    this.#socket.on("connect_error", (e: SocketIOError) => {
      if (e.data?.type === "ResourceUnboundError") {
        // Tries to reconnect to the server with a delay, then dump results.
        this.#reconnect().then();
        this.dumpAuthenticationParams().then();
      } else if (e.data?.type === "InvalidCredentialsError") {
        // In case of clock drift, the system needs to retry a few times.
        this.#invalidCredentialsTimes++;
        if (this.#invalidCredentialsTimes >= 3) {
          regenerateConfig().then();
          this.disconnect();
          console.error("The system failed to authenticate you 3 times.");
          console.error("It is possible that this node has been deleted. We have regenerated another configuration for your convenience.");
          console.error("In case the node remains intact on our servers, go to your dashboard and click on the restore button next to your node entry.");
        } else {
          this.#reconnect().then();
        }
      } else {
        throw e;
      }
    });
    this.#socket.on("connect", () => {
      this.#connectSuccess = true;
    });
    this.#socket.on("disconnect", async () => {
      await this.#reconnect();
    });
  }

  async #reconnect() {
    await delay(5);
    if (!this.#disconnected) {
      this.#socket.connect();
    }
  }

  disconnect() {
    socket.disconnect();
    this.#disconnected = true;
  }

  async dumpAuthenticationParams() {
    if (this.#hasDumpedAuthParams) {
      return;
    }
    this.#hasDumpedAuthParams = true;
    let prevTotp: string | null = null;
    while (!this.#connectSuccess && !this.#disconnected) {
      let currentTotp = generateTotp({
        ...this.#params.totp,
        timestamp: Date.now(),
      }).otp;
      if (currentTotp !== prevTotp) {
        if (prevTotp) {
          console.log("TOTP parameters are refreshing.");
        } else {
          console.log("This node needs to connect to your account. Please enter the node's ID and OTP in the addition screen.");
          console.log(`Note that the node's OTP resets every ${this.#params.totp.interval} seconds.`);
        }
        console.log(`Node ID: ${this.#params.id}`);
        console.log(`Node OTP: ${currentTotp}`);
      }
      prevTotp = currentTotp;
      await delay(this.#params.totp.interval / 10);
    }
  }
}

let socket: NodeSocket | null;

export function attemptConnection(params: Application.NodeConfig) {
  socket?.disconnect();
  console.log("Setting up socket");
  socket = new NodeSocket(params);
}
