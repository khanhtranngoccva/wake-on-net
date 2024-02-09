import * as React from 'react';
import ReactFocusLock from "react-focus-lock";
import IconButton from "@/components/IconButton";
import {FaXmark} from "react-icons/fa6";
import {useRouter} from "next/navigation";

interface ModularFormProps extends React.ComponentProps<"form"> {
  heading?: React.ReactNode
  children?: React.ReactNode
}

function ModularForm(props: ModularFormProps) {
  const router = useRouter();

  const {heading, ...delegated} = props;

  return <ReactFocusLock className={"w-full h-full flex justify-center items-center"}>
    <div className={"flex flex-col gap-2 px-[8px] py-[8px] max-w-full max-h-full bg-background-1 rounded-[12px]"}>
      <div className={"flex gap-4 items-center flex-none"}>
        <IconButton icon={FaXmark} className={"flex-none opacity-0 pointer-events-none aspect-square"}></IconButton>
        <h2 className={"flex-1 text-center"}>{props.heading}</h2>
        <IconButton icon={FaXmark} onClick={(e) => {
          router.push("..");
        }} className={"flex-none aspect-square"}></IconButton>
      </div>
      <form {...delegated} className={`flex flex-col gap-2 flex-1 ${props.className || ""}`}>
        {props.children}
      </form>
    </div>
  </ReactFocusLock>;
}

export default ModularForm;
