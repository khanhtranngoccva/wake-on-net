"use client";

import {FaGoogle} from "react-icons/fa6";
import IconLink from "@/components/IconLink";


const LINKS = [
  {
    desc: "Sign in with Google",
    icon: FaGoogle,
    href: new URL("/web/auth/google", process.env.NEXT_PUBLIC_BACKEND_URL).toString(),
  },
];

export default function Login() {
  return <ul className={"flex flex-col px-[8px] py-[4px] gap-2"}>
    {
      LINKS.map((link, index) => {
        return <li key={index}>
          <IconLink href={link.href} icon={link.icon}>{link.desc}</IconLink>
        </li>;
      })
    }
  </ul>
}
