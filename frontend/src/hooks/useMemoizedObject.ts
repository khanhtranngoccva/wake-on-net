import React from "react";

export default function useMemoizedObject<T extends {}>(obj: T): T {
  return React.useMemo(() => {
    return obj;
  }, Object.values(obj));
}
