"use client";

import * as React from 'react';
import IconLink from "@/components/IconLink";
import {FaPlus} from "react-icons/fa6";

function Navigation() {
  return <nav className={"flex gap-2 p-2 border-b-border-1 border-b-[1px]"}>
    <IconLink icon={FaPlus} href={"/add-node"}>Add node</IconLink>
    {/*<IconLink icon={FaPlus} href={"/add-device"}>Add device</IconLink>*/}
  </nav>;
}

export default Navigation;
