"use client";

import * as React from 'react';
import {useContext} from "react";
import {UserContext} from "@/components/UserProvider";
import {usePathname, useRouter} from "next/navigation";

const LOGIN_URL = "/login";

function PrivateRoute(props: React.PropsWithChildren) {
  const {loaded, user} = useContext(UserContext);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (loaded && !user && pathname !== LOGIN_URL) {
      router.push(LOGIN_URL);
    }
  }, [loaded, user, pathname, router]);

  if (loaded && user) {
    return props.children;
  }
  // Requires loading overlay here in a full-blown app.
  return null;
}

export default React.memo(PrivateRoute);
