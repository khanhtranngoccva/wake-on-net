import * as React from 'react';
import {LuRouter} from "react-icons/lu";
import IconLink from "@/components/IconLink";
import {FaPencil, FaPlus, FaPowerOff, FaTrash} from "react-icons/fa6";
import IconButton from "@/components/IconButton";
import {getColorFromOnlineStatus} from "@/helpers/colors";
import {clientApi} from "@/helpers/api";
import {TbDeviceDesktop} from "react-icons/tb";

interface DeviceEntryProps extends Application.Device {
  online?: boolean,
}

function DeviceEntry(device: DeviceEntryProps) {
  async function deleteDevice() {
    await clientApi.delete(`/web/devices/${device.id}`);
  }

  async function powerOnDevice() {
    await clientApi.post(`/web/devices/${device.id}/wake`);
  }

  return <li className={"flex flex-col gap-2 w-full"}>
    <div
      className={"rounded-[4px] border-[1px] border-border-1 bg-background-2 flex items-center gap-2 px-[8px] py-[4px]"}>
      <div className={"h-12 aspect-square p-2"}>
        <TbDeviceDesktop className={"w-full h-full"} color={getColorFromOnlineStatus(device.online)}></TbDeviceDesktop>
      </div>
      <div className={"flex flex-col flex-1"}>
        <h3>{device.name}</h3>
      </div>
      <IconButton onClick={powerOnDevice} icon={FaPowerOff} className={"aspect-square"}
                  title={"Power on device"}></IconButton>
      <IconLink href={`/devices/${device.id}/rename`} icon={FaPencil} className={"aspect-square"}
                title={"Edit name"}></IconLink>
      <IconButton onClick={deleteDevice} icon={FaTrash} className={"aspect-square"}
                  title={"Delete"}></IconButton>
    </div>
  </li>;
}

export default DeviceEntry;
