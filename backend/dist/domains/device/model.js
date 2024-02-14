import prisma from "@/helpers/prisma.js";
import { getIdOfEntity } from "@/helpers/db-entity.js";
import { AuthorizationError } from "@/helpers/errors.js";
import { emitDeviceWake } from "@/domains/device/events.js";
export async function createDevice(nodeOrId, params) {
    return prisma.device.create({
        data: {
            name: params.name,
            nodeId: getIdOfEntity(nodeOrId),
            ipAddress: params.ipAddress,
            macAddress: params.macAddress,
        }
    });
}
export async function getDevice(deviceId) {
    return prisma.device.findUniqueOrThrow({
        where: {
            id: deviceId,
        }
    });
}
export async function verifyDeviceOwnerOrThrow(userOrId, deviceOrId) {
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
export async function wakeDevice(deviceOrId) {
    let device;
    if (typeof deviceOrId === 'string') {
        device = await prisma.device.findUniqueOrThrow({
            where: {
                id: deviceOrId
            }
        });
    }
    else {
        device = deviceOrId;
    }
    const nodeId = device.nodeId;
    // Wake the device up
    emitDeviceWake(nodeId, getIdOfEntity(deviceOrId));
}
export async function patchDevice(deviceOrId, params) {
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
export async function deleteDevice(deviceOrId) {
    await prisma.device.delete({
        where: {
            id: getIdOfEntity(deviceOrId),
        },
    });
}
