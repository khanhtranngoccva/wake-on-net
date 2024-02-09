"use client";

import * as React from 'react';
import {WebsocketContext} from "@/components/WebsocketProvider";
import {abortablePromise} from "@/helpers/abort";
import {produce} from "immer";
import {useReducer} from "react";
import NodeEntry from "@/components/NodeEntry";


interface ReloadNodes {
  type: "reload-nodes",
  data: Application.NodeWithDevices[],
}

interface AddNode {
  type: "add-node",
  data: Application.NodeWithDevices,
}

interface RemoveNode {
  type: "remove-node",
  data: Application.NodeWithDevices,
}

type NodeAction = ReloadNodes | AddNode | RemoveNode;

function nodeReducer(state: Map<string, Application.NodeWithDevices>, action: NodeAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "add-node":
        draft.set(action.data.id, action.data);
        break;
      case "remove-node":
        draft.delete(action.data.id);
        break;
      case "reload-nodes":
        draft.clear();
        for (let node of action.data) {
          draft.set(node.id, node);
        }
    }
  });
}

function NodeViewer() {
  const [nodes, manageNodes] = useReducer(nodeReducer, new Map());
  const socket = React.useContext(WebsocketContext);

  React.useEffect(() => {
    if (!socket.connected) return;

    const abortable = abortablePromise(socket.emit<Application.NodeWithDevices[]>("node:get_all", {
      name: "node"
    }));

    abortable.promise.then(async (nodes) => {
      manageNodes({
        type: 'reload-nodes',
        data: nodes,
      });
      setTimeout(async () => {
        await socket.emit("node:request_status_all");
      }, 0);
    });

    return () => {
      abortable.abort();
    }
  }, [socket]);

  return <ul className={"flex flex-1 flex-col gap-2 items-center py-4 px-[12px]"}>
    {Array.from(nodes.entries()).map(([id, node]) => {
      return <NodeEntry {...node} key={id}></NodeEntry>
    })}
  </ul>;
}

export default NodeViewer;
