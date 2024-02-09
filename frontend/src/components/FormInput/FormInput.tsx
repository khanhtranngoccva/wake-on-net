import * as React from 'react';
import {ComponentPropsWithoutRef} from "react";

function FormInput(props: ComponentPropsWithoutRef<"input">, ref: React.ForwardedRef<HTMLInputElement>) {
  return <input {...props} ref={ref} className={`px-[4px] py-[2px] rounded-[4px] border-[1px] border-border-1 ${props.className || ""}`}></input>;
}

export default React.memo(React.forwardRef(FormInput));
