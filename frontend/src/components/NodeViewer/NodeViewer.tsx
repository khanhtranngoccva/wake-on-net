"use client";

import * as React from 'react';
import {WebsocketContext} from "@/components/WebsocketProvider";
import {abortablePromise, AbortError} from "@/helpers/abort";
import {produce} from "immer";
import {useReducer} from "react";
import NodeEntry from "@/components/NodeEntry";
import {objectEntries} from "@/helpers/dataType";

interface ReloadNodes {
  type: "reload-nodes",
  data: Application.Node[],
}

interface AddNode {
  type: "add-node",
  data: Application.Node,
}

interface DeleteNode {
  type: "delete-node",
  data: string,
}

interface UpdateNode {
  type: "update-node",
  data: Application.Node,
}

interface AddDevice {
  type: "add-device",
  data: Application.Device
}

interface ReloadDevices {
  type: "reload-devices",
  data: Application.Device[],
}

interface UpdateDevice {
  type: "update-device",
  data: Application.Device,
}

interface DeleteDevice {
  type: "delete-device",
  data: string,
}

interface OnlineAction {
  id: string;
  online: boolean;
}

type NodeAction = ReloadNodes | AddNode | DeleteNode | UpdateNode;
type DeviceAction = ReloadDevices | AddDevice | DeleteDevice | UpdateDevice;

function nodeReducer(state: Map<string, Application.Node>, action: NodeAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "add-node":
        draft.set(action.data.id, action.data);
        break;
      case "delete-node":
        draft.delete(action.data);
        break;
      case "reload-nodes":
        draft.clear();
        for (let node of action.data) {
          draft.set(node.id, node);
        }
        break;
      case "update-node":
        const current = draft.get(action.data.id);
        if (!current) break;
        for (let [key, value] of objectEntries(action.data)) {
          if (value !== undefined) {
            current[key] = value as any;
          }
        }
        break;
    }
  });
}

function deviceReducer(state: Map<string, Application.Device>, action: DeviceAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "add-device":
        draft.set(action.data.id, action.data);
        break;
      case "delete-device":
        draft.delete(action.data);
        break;
      case "reload-devices":
        draft.clear();
        for (let node of action.data) {
          draft.set(node.id, node);
        }
        break;
      case "update-device":
        const current = draft.get(action.data.id);
        if (!current) break;
        for (let [key, value] of objectEntries<Application.Device>(action.data)) {
          if (value !== undefined) {
            current[key] = value as any;
          }
        }
        break;
    }
  });
}

function onlineReducer(state: Map<string, boolean>, action: OnlineAction) {
  return produce(state, draft => {
    draft.set(action.id, action.online);
  });
}

function NodeViewer() {
  const [nodes, manageNodes] = useReducer(nodeReducer, new Map());
  const [devices, manageDevices] = useReducer(deviceReducer, new Map());
  const [nodeOnlineMap, updateNodeOnlineMap] = useReducer(onlineReducer, new Map());
  const [deviceOnlineMap, updateDeviceOnlineMap] = useReducer(onlineReducer, new Map());
  const socket = React.useContext(WebsocketContext);

  // Reload event.
  React.useEffect(() => {
    if (!socket.connected) return;

    const abortable = abortablePromise(socket.emit<Application.NodeWithDevices[]>("node:get_all", {}));

    abortable.promise.then(async (nodes) => {
      const devices = nodes.flatMap(node => node.devices);
      manageNodes({
        type: 'reload-nodes',
        data: nodes,
      });
      manageDevices({
        type: 'reload-devices',
        data: devices,
      });
      setTimeout(async () => {
        await socket.emit("node:request_status_all");
      });
    }).catch(e => {
      if (e instanceof AbortError) {
      } else throw e;
    });

    return () => {
      abortable.abort();
    }
  }, [socket]);
  // Node event.
  React.useEffect(() => {
    if (!socket.connected) return;

    function updateNodeStatus(status: Application.NodeStatus) {
      updateNodeOnlineMap({
        id: status.id,
        online: status.online,
      });
    }

    socket.socket.on("node:status", updateNodeStatus);
    return () => {
      socket.socket.off("node:status", updateNodeStatus);
    }
  }, [socket]);
  React.useEffect(() => {
    function updateNode(data: Application.Node) {
      manageNodes({
        type: "update-node",
        data: data
      });
    }

    socket.socket.on("node:update", updateNode);
    return () => {
      socket.socket.off("node:update", updateNode);
    }
  }, [socket]);
  React.useEffect(() => {
    function addNode(data: Application.NodeWithDevices) {
      manageNodes({
        type: "add-node",
        data: data
      });
    }

    socket.socket.on("node:add", addNode);
    return () => {
      socket.socket.off("node:add", addNode);
    }
  }, [socket]);
  React.useEffect(() => {
    function deleteNode(data: string) {
      manageNodes({
        type: "delete-node",
        data: data
      });
    }

    socket.socket.on("node:delete", deleteNode);
    return () => {
      socket.socket.off("node:delete", deleteNode);
    }
  }, [socket]);
  // Device event.
  React.useEffect(() => {
    if (!socket.connected) return;

    function updateDeviceStatus(status: Application.NodeStatus) {
      updateDeviceOnlineMap({
        id: status.id,
        online: status.online,
      });
    }

    socket.socket.on("device:status", updateDeviceStatus);
    return () => {
      socket.socket.off("device:status", updateDeviceStatus);
    }
  }, [socket]);
  React.useEffect(() => {
    function updateDevice(data: Application.Device) {
      manageDevices({
        type: "update-device",
        data: data
      });
    }

    socket.socket.on("device:update", updateDevice);
    return () => {
      socket.socket.off("device:update", updateDevice);
    }
  }, [socket]);
  React.useEffect(() => {
    function addDevice(data: Application.Device) {
      manageDevices({
        type: "add-device",
        data: data
      });
    }

    socket.socket.on("device:add", addDevice);
    return () => {
      socket.socket.off("device:add", addDevice);
    }
  }, [socket]);
  React.useEffect(() => {
    function deleteDevice(data: string) {
      manageDevices({
        type: "delete-device",
        data: data
      });
    }

    socket.socket.on("device:delete", deleteDevice);
    return () => {
      socket.socket.off("device:delete", deleteDevice);
    }
  }, [socket]);

  // Denormalizing the data structure.
  const transformed = React.useMemo(() => {
    const transformed = new Map<string, Application.Node & {
      devices: Map<string, Application.Device & {
        online?: boolean
      }>
      online?: boolean,
    }>();
    // Node-level
    for (let [key, value] of nodes.entries()) {
      transformed.set(key, {
        ...value,
        devices: new Map(),
        online: nodeOnlineMap.get(key),
      });
    }
    // Device-level
    for (let [key, value] of devices.entries()) {
      const parentNode = transformed.get(value.nodeId);
      if (!parentNode) continue;
      parentNode.devices.set(key, {
        ...value,
        online: deviceOnlineMap.get(key)
      });
    }
    return transformed;
  }, [nodes, devices, nodeOnlineMap, deviceOnlineMap]);

  return <ul className={"flex flex-1 flex-col gap-4 items-center py-4 px-[12px]"}>
    {[...transformed.entries()].map(([id, node]) => {
      return <NodeEntry {...node} key={id}></NodeEntry>
    })}
  </ul>;
}

export default NodeViewer;
