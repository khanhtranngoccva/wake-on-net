"use client";

import * as React from 'react';
import {createPortal} from "react-dom";

function FullScreenOverlay(props: {
  children?: React.ReactNode
}) {
  const [node, setNode] = React.useState<HTMLDivElement|null>(null);

  React.useEffect(() => {
    const node = document.createElement("div");
    document.body.append(node);
    setNode(node);
    return () => {
      node.remove();
    }
  }, []);

  return node && createPortal(<div className={"fixed w-full h-full top-0 left-0 bg-[#0003]"}>{props.children}</div>, node);
}

export default FullScreenOverlay;
