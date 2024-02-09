import * as React from 'react';
import {WebsocketContext} from "@/components/WebsocketProvider";
import {useStateWithDeps} from "use-state-with-deps";
import {LuRouter} from "react-icons/lu";
import {FaPencil} from "react-icons/fa6";
import IconLink from "@/components/IconLink";

function NodeEntry(node: Application.NodeWithDevices) {
  const [nodeStatus, setNodeStatus] = useStateWithDeps<Application.NodeOnlineStatus | undefined>(undefined, [node.id]);
  const socket = React.useContext(WebsocketContext);

  React.useEffect(() => {
    if (!socket.connected) return;

    function updateNodeStatus(data: Application.NodeOnlineStatus[]) {
      for (let status of data) {
        if (status.id === node.id) {
          setNodeStatus(status);
          return;
        }
      }
    }

    socket.socket.on("node:online_status", updateNodeStatus);
    return () => {
      socket.socket.off("node:online_status", updateNodeStatus);
    }
  }, [socket, node]);

  let color: string;
  if (!nodeStatus) {
    color = "#ffae00";
  } else {
    color = nodeStatus.online ? "#009b00" : "#ff0000";
  }

  return <li
    className={"rounded-[4px] border-[1px] border-border-1 bg-background-2 w-full max-w-lg flex items-center gap-2 px-[8px] py-[4px]"}>
    <div className={"h-12 aspect-square p-2"}>
      <LuRouter className={"w-full h-full"} color={color}></LuRouter>
    </div>
    <div className={"flex flex-col flex-1"}>
      <h2>{node.name}</h2>
    </div>
    <IconLink href={`/rename-node/${node.id}`} icon={FaPencil} className={"aspect-square"} title={"Edit name"}></IconLink>
  </li>;
}

export default NodeEntry;
