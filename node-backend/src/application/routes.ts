import {Socket} from "socket.io-client";
import console from "console";
import ping from "ping";
import wol from "wake_on_lan";

export async function routes(socket: Socket) {
  let deviceList: Map<string, Application.Device> = new Map();
  let pingInterval: NodeJS.Timeout | null = null;

  function pingDevices() {
    for (let [id, device] of deviceList) {
      ping.promise.probe(device.ipAddress).then(res => {
        socket.emitWithAck("device:ping", {
          id: id,
          online: res.alive,
        }).catch(e => {
          console.error(e);
        });
      });
    }
  }

  socket.on("device:update_list", (devices: Application.Device[]) => {
    if (pingInterval) clearInterval(pingInterval);
    deviceList = new Map();
    for (let device of devices) {
      deviceList.set(device.id, device);
    }
    pingDevices();
    setInterval(pingDevices, 5000);
  });
  socket.on("device:wake", (id: string) => {
    if (!deviceList.has(id)) return;
    // Do wake-on-lan here.
    wol.wake(deviceList.get(id)!.macAddress, error => {
      pingDevices();
    });
  });
  socket.on("disconnect", () => {
    clearInterval(pingInterval);
  });
}