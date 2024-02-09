"use client";

import React from "react";
import FullScreenOverlay from "@/components/FullScreenOverlay";
import ModularForm from "@/components/ModularForm";
import FormLabel from "@/components/FormLabel";
import FormInput from "../../../../components/FormInput";
import IconButton from "@/components/IconButton";
import {FaPlus} from "react-icons/fa6";
import {formToJSON} from "axios";
import {z} from "zod";
import {useRouter} from "next/navigation";
import {clientApi} from "@/helpers/api";

export default function AddNodePage() {
  const formId = React.useId();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formRaw = formToJSON(form);
    try {
      await clientApi.post("/web/nodes", formRaw);
      router.push("..");
    } catch (e) {
      // Error handling here.
    }
  }

  return <FullScreenOverlay>
    <ModularForm heading={"Add a node"} onSubmit={handleSubmit}>
      <FormLabel htmlFor={`${formId}_id`}>Node ID</FormLabel>
      <FormInput id={`${formId}_id`} name={"id"} required={true}></FormInput>
      <FormLabel htmlFor={`${formId}_otp`}>Node one-time-password (resets every 30 seconds)</FormLabel>
      <FormInput id={`${formId}_otp`} name={"totp"} required={true}></FormInput>
      <IconButton icon={FaPlus}>Add node</IconButton>
    </ModularForm>
  </FullScreenOverlay>
}
