import "@/helpers/patches";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import UserProvider, {UserContext} from "@/components/UserProvider";
import React from "react";
import WebsocketProvider from "@/components/WebsocketProvider";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={"w-full h-full"}>
    <body className={`${inter.className} w-full h-full m-0 flex`}>
    <UserProvider>
      <WebsocketProvider>
        {children}
      </WebsocketProvider>
    </UserProvider>
    </body>
    </html>
  );
}