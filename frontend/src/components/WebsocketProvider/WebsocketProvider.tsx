"use client";

import * as React from 'react';
import {io, Socket} from "socket.io-client";
import useMemoizedObject from "@/hooks/useMemoizedObject";
import {UserContext} from "@/components/UserProvider";

export class WebsocketError extends Error {
  type: string;

  constructor(type: string, message: string) {
    super(message);
    this.type = type;
  }
}

interface WebsocketContext {
  socket: Socket;
  connected: boolean;

  emit<Response = any>(event: string, ...args: any[]): Promise<Response>;
}

export const WebsocketContext = React.createContext<WebsocketContext>({
  socket: {} as Socket,
  connected: false,
  async emit() {
    throw new Error("Context can only be used inside the provider!");
  },
});

function WebsocketProvider(props: {
  children?: React.ReactNode,
}) {
  const {user} = React.useContext(UserContext);
  const [connected, setConnected] = React.useState(false);
  const socket = React.useMemo(() => {
    return io(new URL("/web", process.env.NEXT_PUBLIC_BACKEND_WS_URL).toString(), {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
    });
  }, []);

  const emit: <Response = any>(event: string, ...args: any[]) => Promise<Response> = React.useCallback(function (event: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      socket.emit(event, ...args, (response: Api.Response<Response> | Api.FailResponse) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new WebsocketError(response.error.type, response.error.message));
        }
      });
    });
  }, [socket]);

  React.useEffect(() => {
    if (!user) return;
    socket.connect();
    return () => {
      socket.disconnect();
      setConnected(false);
    }
  }, [socket, user]);

  React.useEffect(() => {
    function connect_error(e: Error) {
      console.error(e);
    }
    function connect() {
      setConnected(true);
    }

    socket.on("connect_error", connect_error);
    socket.on("connect", connect);
    return () => {
      socket.off("connect_error", connect_error);
      socket.off("connect", connect);
    }
  }, [socket]);

  return <WebsocketContext.Provider value={useMemoizedObject({
    emit, socket, connected
  })}>
    {props.children}
  </WebsocketContext.Provider>
}

export default React.memo(WebsocketProvider);
