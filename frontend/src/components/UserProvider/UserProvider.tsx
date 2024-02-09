"use client";

import * as React from 'react';
import useMemoizedObject from "@/hooks/useMemoizedObject";
import {clientApi} from "@/helpers/api";

interface UserContext {
  user: Application.User | null;
  loaded: boolean;
}

export const UserContext = React.createContext<UserContext>({
  user: null,
  loaded: false,
});

function UserProvider(props: {
  children?: React.ReactNode
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [user, setUser] = React.useState<Application.User | null>(null);

  React.useEffect(() => {
    async function getUser() {
      console.log("Updating user.");
      const user = (await clientApi.get<Api.Response<Application.User>>("/web/auth/current-user")).data.data;
      setUser(user);
      setLoaded(true);
    }
    getUser().then();
  }, []);

  return <UserContext.Provider value={useMemoizedObject({
    loaded, user
  })}>
    {props.children}
  </UserContext.Provider>;
}

export default UserProvider;
