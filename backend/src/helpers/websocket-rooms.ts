import {Prisma} from "@/helpers/prisma.js";
import {getIdOfEntity} from "@/helpers/db-entity.js";

export function getNodeRoom(nodeOrId: Prisma.Node | string) {
  return `node_${getIdOfEntity(nodeOrId)}`;
}

export function getUserRoom(userOrId: Express.User | string) {
  return `user_${getIdOfEntity(userOrId)}`;
}
