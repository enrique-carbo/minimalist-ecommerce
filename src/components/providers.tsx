"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
      sessionCallback={() => {
        // This callback can be used to handle session updates
      }}
    >
      {children}
    </SessionProvider>
  )
}