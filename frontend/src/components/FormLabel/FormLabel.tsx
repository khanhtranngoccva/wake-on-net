import * as React from 'react';
import {ComponentProps} from "react";

function FormLabel(props: ComponentProps<"label">) {
  return <label {...props} className={`flex text-foreground-2 flex-col gap-1 ${props.className || ""}`}></label>;
}

export default FormLabel;
