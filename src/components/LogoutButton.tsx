"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/src/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

interface LogoutButtonProps {
  variant?: "dropdown" | "button"
  className?: string
  onCloseMobileMenu?: () => void
}

export default function LogoutButton({ 
  variant = "dropdown", 
  className = "",
  onCloseMobileMenu 
}: LogoutButtonProps) {
  const { data: session } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      // Forzar la recarga de la página después del logout
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Error signing out:', error)
      // En caso de error, intentar recargar la página de todas formas
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!session) return null

  if (variant === "button") {
    return (
      <button
        onClick={handleSignOut}
        disabled={isLoggingOut}
        className={`${className} disabled:opacity-50`}
      >
        <LogOut className="inline mr-2 h-4 w-4" />
        {isLoggingOut ? "Signing out..." : "Log out"}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className={`${className} disabled:opacity-50`}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoggingOut ? "Signing out..." : "Log out"}
    </Button>
  )
}