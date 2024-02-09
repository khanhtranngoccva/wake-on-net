import * as React from 'react';
import {IconType} from "react-icons";
import Link, {LinkProps} from "next/link";

interface IconLinkProps extends LinkProps, React.ComponentPropsWithoutRef<"a"> {
  href: string,
  icon: IconType
}


function IconLink(props: IconLinkProps) {
  const {icon, ...delegated} = props;

  return <Link {...delegated} className={`flex justify-center items-center rounded-[8px] px-[8px] py-[4px] gap-2 bg-accent-1 ${props.className || ""}`}>
    <props.icon className={"w-4 h-4"}></props.icon>
    {props.children}
  </Link>;
}

export default IconLink;
