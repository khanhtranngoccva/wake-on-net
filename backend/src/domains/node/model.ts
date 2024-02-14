import prisma, {Prisma} from "@/helpers/prisma.js";
import {getIdOfEntity} from "@/helpers/db-entity.js";
import {AuthorizationError} from "@/helpers/errors.js";
import io from "@/config/server/websocket.js";
import {getNodeRoom} from "@/helpers/websocket-rooms.js";

export async function registerNode(params: {
  totpOrId: Prisma.Totp | string,
  name?: string,
}) {
  return prisma.node.create({
    data: {
      name: params.name ?? "New node",
      totpId: getIdOfEntity(params.totpOrId),
    },
    include: {
      totp: true,
    }
  });
}

export async function patchNode(nodeOrId: Prisma.Node | string, params: {
  name?: string
}): Promise<Prisma.Node> {
  const nodeId = getIdOfEntity(nodeOrId);
  return prisma.node.update({
    where: {
      id: nodeId,
    },
    data: {
      name: params.name,
    },

  });
}

export async function loginNode(userOrId: Express.User | string, nodeOrId: Prisma.Node | string): Promise<Prisma.Node> {
  return prisma.node.update({
    where: {
      id: getIdOfEntity(nodeOrId),
    },
    data: {
      userId: getIdOfEntity(userOrId),
    }
  });
}

export async function logoutNode(nodeOrId: Prisma.Node | string) {
  return prisma.node.update({
    where: {
      id: getIdOfEntity(nodeOrId),
    },
    data: {
      userId: null,
    }
  });
}

export async function getUserNodes(userOrId: Express.User | string, query: {
  name?: string
}) {
  return prisma.node.findMany({
    where: {
      userId: getIdOfEntity(userOrId),
      name: {
        mode: "insensitive",
        contains: query.name,
      }
    },
    include: {
      devices: true,
    }
  });
}

export async function deleteNode(nodeOrId: Prisma.Node | string) {
  await prisma.node.delete({
    where: {
      id: getIdOfEntity(nodeOrId)
    }
  });
}

export async function getNodeWithDevices(nodeId: string) {
  return prisma.node.findUniqueOrThrow({
    where: {
      id: nodeId,
    },
    include: {
      devices: true,
    }
  })
}

export async function verifyNodeOwnerOrThrow(userOrId: Express.User | string, nodeOrId: Prisma.Node | string) {
  let node: Prisma.Node;
  if (typeof nodeOrId === "string") {
    node = await prisma.node.findUniqueOrThrow({
      where: {
        id: nodeOrId,
      }
    });
  } else {
    node = nodeOrId;
  }
  if (node.userId !== getIdOfEntity(userOrId)) {
    throw new AuthorizationError();
  }
}

export async function getNode(nodeId: string) {
  return prisma.node.findUniqueOrThrow({
    where: {
      id: nodeId,
    },
    include: {
      totp: true,
    }
  })
}

export async function updateDeviceList(nodeOrId: Prisma.Node | string) {
  const nodeId = getIdOfEntity(nodeOrId);
  const devices = await prisma.device.findMany({
    where: {
      nodeId: nodeId,
    }
  }).then(res => {
    return res.map(t => {
      return {
        id: t.id,
        ipAddress: t.ipAddress,
        macAddress: t.macAddress,
      };
    });
  });
  io.of("/node").to(getNodeRoom(nodeId)).emit("device:update_list", devices);
}

export async function getNodeOnlineStatus(nodeOrId: Prisma.Node | string) {
  const sockets = await io.of("/node").in(getNodeRoom(nodeOrId)).fetchSockets();
  return sockets.length > 0;
}
