import {Socket} from "socket.io";
import {Prisma} from "@/helpers/prisma.ts";
import express from "express";

declare global {
  namespace Application {
    type WS = Socket<any, any, any, {}> & {
      request: express.Request & {
        user: Express.User | null;
      }
    }
    type NodeWS = Socket<any, any, any, {
      node: Prisma.Node;
    }>
    type WebWS = Socket<any, any, any, {}> & {
      request: Omit<express.Request, "user"> & {
        user: Express.User;
      }
    }
  }
}

export {};
