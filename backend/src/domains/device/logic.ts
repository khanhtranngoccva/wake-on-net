import prisma, {Prisma} from "@/helpers/prisma.ts";
import {getIdOfEntity} from "@/helpers/db-entity.ts";
import {AuthorizationError} from "@/helpers/errors.ts";
import io from "@/config/server/websocket.ts";
import {getNodeRoom} from "@/helpers/websocket-rooms.ts";

export async function createDevice(nodeOrId: Prisma.Node | string, params: {
  name?: string,
  ipAddress: string,
  macAddress: string,
}) {
  return prisma.device.create({
    data: {
      name: params.name,
      nodeId: getIdOfEntity(nodeOrId),
      ipAddress: params.ipAddress,
      macAddress: params.macAddress,
    }
  });
}

export async function getDevice(deviceId: string): Promise<Prisma.Device> {
  return prisma.device.findUniqueOrThrow({
    where: {
      id: deviceId,
    }
  });
}

export async function verifyDeviceOwnerOrThrow(userOrId: Express.User | string, deviceOrId: Prisma.Device | string) {
  let device = await prisma.device.findUniqueOrThrow({
    where: {
      id: getIdOfEntity(deviceOrId)
    },
    include: {
      node: true,
    }
  });
  if (device.node.userId !== getIdOfEntity(userOrId)) {
    throw new AuthorizationError();
  }
}

export async function wakeDevice(deviceOrId: Prisma.Device | string) {
  let device: Prisma.Device;
  if (typeof deviceOrId === 'string') {
    device = await prisma.device.findUniqueOrThrow({
      where: {
        id: deviceOrId
      }
    });
  } else {
    device = deviceOrId;
  }
  const nodeId = device.nodeId;
  // Wake the device up
  io.of("/node").to(getNodeRoom(nodeId)).emit("device:wake_request", {
    ipAddress: device.ipAddress,
    macAddress: device.macAddress,
  });
}
