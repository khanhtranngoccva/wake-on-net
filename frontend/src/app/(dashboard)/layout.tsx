import React from "react";
import Navigation from "@/components/Navigation";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";

export default function Layout(props: {
  children?: React.ReactNode,
  modal: React.ReactNode
}) {
  return <PrivateRoute>
    <div className={"flex flex-col flex-1"}>
      <Navigation></Navigation>
      {props.children}
      {props.modal}
    </div>
  </PrivateRoute>;
}
