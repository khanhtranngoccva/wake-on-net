import * as React from 'react';
import {IconType} from "react-icons";

interface IconButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: IconType
}


function IconButton(props: IconButtonProps) {
  const {icon, ...delegated} = props;

  return <button {...delegated}
                 className={`flex justify-center items-center rounded-[8px] px-[8px] py-[4px] gap-2 bg-accent-1 ${props.className || ""}`}>
    <props.icon className={"w-4 h-4"}></props.icon>
    {props.children}
  </button>;
}

export default IconButton;
