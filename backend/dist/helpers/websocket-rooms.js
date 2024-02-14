import { getIdOfEntity } from "@/helpers/db-entity.js";
export function getNodeRoom(nodeOrId) {
    return `node_${getIdOfEntity(nodeOrId)}`;
}
export function getUserRoom(userOrId) {
    return `user_${getIdOfEntity(userOrId)}`;
}
