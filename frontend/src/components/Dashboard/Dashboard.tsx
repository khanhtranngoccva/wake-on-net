import * as React from 'react';
import NodeViewer from "@/components/NodeViewer";

function Dashboard() {
  return <div className={"flex overflow-clip flex-1"}>
    <NodeViewer></NodeViewer>
  </div>;
}

export default Dashboard;
