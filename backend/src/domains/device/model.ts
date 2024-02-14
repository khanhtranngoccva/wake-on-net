import prisma, {Prisma} from "@/helpers/prisma.js";
import {getIdOfEntity} from "@/helpers/db-entity.js";
import {AuthorizationError} from "@/helpers/errors.js";
import io from "@/config/server/websocket.js";
import {getNodeRoom} from "@/helpers/websocket-rooms.js";
import {emitDeviceWake} from "@/domains/device/events.js";

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
  emitDeviceWake(nodeId, getIdOfEntity(deviceOrId));
}

export async function patchDevice(deviceOrId: Prisma.Device | string, params: {
  name?: string,
  macAddress?: string,
  ipAddress?: string,
}) {
  return prisma.device.update({
    where: {
      id: getIdOfEntity(deviceOrId),
    },
    data: {
      name: params.name,
      macAddress: params.macAddress,
      ipAddress: params.ipAddress
    }
  });
}

export async function deleteDevice(deviceOrId: Prisma.Device | string) {
  await prisma.device.delete({
    where: {
      id: getIdOfEntity(deviceOrId),
    },
  });
}