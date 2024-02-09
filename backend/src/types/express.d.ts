import * as Prisma from "@prisma/client";

interface PrismaUser extends Prisma.User {
}

declare global {
  namespace Express {
    interface User extends PrismaUser {
    }
  }
}

declare module "express" {
  export interface Request {
    user: Express.User | null;
  }

  export interface Response<
    ResBody = any,
    LocalsObj extends Record<string, any> = Record<string, any>,
    StatusCode extends number = number,
  > {
    jsonSuccess: (data?: ResBody) => void,
  }
}


export {};
