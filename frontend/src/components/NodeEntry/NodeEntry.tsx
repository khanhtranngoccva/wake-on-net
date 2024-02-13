import * as React from 'react';
import {LuRouter} from "react-icons/lu";
import {FaPencil, FaPlus, FaTrash} from "react-icons/fa6";
import IconLink from "@/components/IconLink";
import IconButton from "@/components/IconButton";
import {clientApi} from "@/helpers/api";
import DeviceEntry from "@/components/DeviceEntry";
import deviceEntry from "@/components/DeviceEntry";
import {getColorFromOnlineStatus} from "@/helpers/colors";

type NodeEntryProps = Application.Node & {
  devices: Map<string, Application.Device & {
    online?: boolean
  }>
  online?: boolean,
}

function NodeEntry(node: NodeEntryProps) {
  async function deleteNode() {
    await clientApi.delete(`/web/nodes/${node.id}`);
  }

  return <li className={"flex flex-col gap-2 w-full max-w-lg"}>
    <div
      className={"rounded-[4px] border-[1px] border-border-1 bg-background-2 flex items-center gap-2 px-[8px] py-[4px]"}>
      <div className={"h-12 aspect-square p-2"}>
        <LuRouter className={"w-full h-full"} color={getColorFromOnlineStatus(node.online)}></LuRouter>
      </div>
      <div className={"flex flex-col flex-1"}>
        <h2>{node.name}</h2>
      </div>
      <IconLink href={`/nodes/${node.id}/devices/add`} icon={FaPlus} className={"aspect-square"}
                title={"Add device"}></IconLink>
      <IconLink href={`/nodes/${node.id}/rename`} icon={FaPencil} className={"aspect-square"}
                title={"Edit name"}></IconLink>
      <IconButton onClick={deleteNode} icon={FaTrash} className={"aspect-square"}
                  title={"Delete"}></IconButton>
    </div>
    <ul className={"flex flex-col w-full gap-1"}>
      {[...node.devices.entries()].map(([id, device]) => {
        return <DeviceEntry key={id} {...device}></DeviceEntry>
      })}
    </ul>
  </li>;
}

export default NodeEntry;
