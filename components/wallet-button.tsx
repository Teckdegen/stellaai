"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { connectWallet, disconnectWallet, isWalletConnected, getWalletAddress, userSession } from "@/lib/stacks-wallet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Initialize the user session
if (typeof window !== 'undefined') {
  try {
    userSession.loadUserData()
  } catch (error) {
    console.log("[v0] User session not initialized yet")
  }
}

export function WalletButton() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const checkConnection = () => {
      try {
        const isConnected = isWalletConnected()
        setConnected(isConnected)
        if (isConnected) {
          setAddress(getWalletAddress())
        }
      } catch (error) {
        console.error("[v0] Error checking connection:", error)
        setConnected(false)
        setAddress(null)
      }
    }
    checkConnection()

    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      connectWallet(
        (data) => {
          console.log("[v0] Wallet connected with data:", data)
          setConnected(true)
          setAddress(data.address || null)
          setIsConnecting(false)
        },
        () => {
          console.log("[v0] Connection cancelled")
          setIsConnecting(false)
        },
      )
    } catch (error) {
      console.error("[v0] Connection error:", error)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    try {
      disconnectWallet()
      setConnected(false)
      setAddress(null)
    } catch (error) {
      console.error("[v0] Error during disconnect:", error)
      setConnected(false)
      setAddress(null)
    }
  }

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Connected"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!connected) {
    return (
      <Button variant="outline" size="sm" onClick={handleConnect} disabled={isConnecting}>
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}