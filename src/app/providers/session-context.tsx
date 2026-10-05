"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Whether an agent session cookie exists, read by the root layout on the
 * server. Lets the first render pick the right feed and header without
 * waiting for `GET agent/me`. Updated by `router.refresh()` after login and
 * logout, which re-runs the layout.
 */
const SessionContext = createContext({ isAuthenticated: false });

export function SessionProvider({
  isAuthenticated,
  children,
}: Readonly<{ isAuthenticated: boolean; children: ReactNode }>) {
  return (
    <SessionContext.Provider value={{ isAuthenticated }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
