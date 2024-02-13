"use client";

import React from "react";
import FullScreenOverlay from "@/components/FullScreenOverlay";
import ModularForm from "@/components/ModularForm";
import FormLabel from "@/components/FormLabel";
import FormInput from "@/components/FormInput";
import IconButton from "@/components/IconButton";
import {FaPencil} from "react-icons/fa6";
import {formToJSON} from "axios";
import {useRouter} from "next/navigation";
import {clientApi} from "@/helpers/api";

export default function RenameNodePage(props: {
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
      await clientApi.patch(`/web/nodes/${props.params.nodeId}`, formRaw);
      router.back();
    } catch (e) {
      // Error handling here.
    }
  }

  return <FullScreenOverlay>
    <ModularForm heading={`Rename node`} onSubmit={handleSubmit}>
      <FormLabel htmlFor={`${formId}_name`}>New name</FormLabel>
      <FormInput id={`${formId}_name`} name={"name"}></FormInput>
      <IconButton icon={FaPencil}>Rename node</IconButton>
    </ModularForm>
  </FullScreenOverlay>
}
