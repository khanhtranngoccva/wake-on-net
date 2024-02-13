"use client";

import React from "react";
import FullScreenOverlay from "@/components/FullScreenOverlay";
import ModularForm from "@/components/ModularForm";
import FormLabel from "@/components/FormLabel";
import FormInput from "@/components/FormInput";
import IconButton from "@/components/IconButton";
import {FaPencil, FaPlus} from "react-icons/fa6";
import {formToJSON} from "axios";
import {useRouter} from "next/navigation";
import {clientApi} from "@/helpers/api";

export default function AddDevicePage(props: {
  params: {
    nodeId: string;
  }
}) {
  const formId = React.useId();
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formRaw = formToJSON(form);
    try {
      await clientApi.post(`/web/nodes/${props.params.nodeId}/devices`, {
        ...formRaw,
        nodeId: props.params.nodeId,
      });
      router.back();
    } catch (e) {
    }
  }

  return <FullScreenOverlay>
    <ModularForm heading={`Add new device`} onSubmit={handleSubmit}>
      <FormLabel htmlFor={`${formId}_name`}>New name</FormLabel>
      <FormInput id={`${formId}_name`} name={"name"}></FormInput>
      <FormLabel htmlFor={`${formId}_ipAddress`}>IP Address</FormLabel>
      <FormInput id={`${formId}_ipAddress`} name={"ipAddress"}></FormInput>
      <FormLabel htmlFor={`${formId}_mac`}>MAC address</FormLabel>
      <FormInput id={`${formId}_macAddress`} name={"macAddress"} ></FormInput>
      <IconButton icon={FaPlus}>Add device</IconButton>
    </ModularForm>
  </FullScreenOverlay>
}
