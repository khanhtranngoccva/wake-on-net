import express from "express";
import DeviceController from "@/domains/device/controllers.js";


const webDevicesRouter = express.Router();
webDevicesRouter.get("/:id", DeviceController.http.getDevice);
webDevicesRouter.patch("/:id", DeviceController.http.patchDevice);
webDevicesRouter.delete("/:id", DeviceController.http.deleteDevice);
webDevicesRouter.post("/:id/wake", DeviceController.http.wakeDevice);

export default webDevicesRouter;
