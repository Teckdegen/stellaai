import { AppConfig, UserSession, showConnect, openContractDeploy } from "@stacks/connect"
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network"

const appConfig = new AppConfig(["store_write", "publish_data"])
export const userSession = new UserSession({ appConfig })

// Initialize userSession if not already initialized
if (typeof window !== 'undefined') {
  try {
    userSession.loadUserData()
  } catch (error) {
    console.log("[v0] User session not initialized yet")
  }
}

export interface WalletData {
  address: string
  network: "testnet" | "mainnet"
}

export function connectWallet(onFinish: (data: WalletData) => void, onCancel: () => void) {
  console.log("[v0] Initiating wallet connection...")

  try {
    showConnect({
      appDetails: {
        name: "Stella AI - Clarity Smart Contract Editor",
        icon: typeof window !== "undefined" ? window.location.origin + "/stella-icon.png" : "",
      },
      onFinish: (payload: any) => {
        console.log("[v0] Wallet connected successfully", payload)
        try {
          const userData = userSession.loadUserData()
          // Determine the appropriate network based on the user data
          const testnetAddress = userData?.profile?.stxAddress?.testnet
          const mainnetAddress = userData?.profile?.stxAddress?.mainnet
          const address = testnetAddress || mainnetAddress || ""
          // Default to testnet, but this should be determined by the project context
          onFinish({
            address,
            network: "testnet", // This will be updated by the project page
          })
          if (typeof window !== "undefined") {
            localStorage.setItem("walletConnected", "true")
            localStorage.setItem("walletAddress", address)
          }
        } catch (error) {
          console.error("[v0] Error processing wallet connection:", error)
          onCancel()
        }
      },
      onCancel: () => {
        console.log("[v0] Wallet connection cancelled")
        onCancel()
      },
      userSession,
    })
  } catch (error) {
    console.error("[v0] Error initiating wallet connection:", error)
    onCancel()
  }
}

export function disconnectWallet() {
  console.log("[v0] Disconnecting wallet...")
  try {
    userSession.signUserOut()
  } catch (error) {
    console.error("[v0] Error during sign out:", error)
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    window.location.reload()
  }
}

export function isWalletConnected(): boolean {
  try {
    // Check if userSession exists and has the isUserSignedIn method
    const sessionConnected = userSession && typeof userSession.isUserSignedIn === 'function' ? userSession.isUserSignedIn() : false
    const localStorageConnected = typeof window !== "undefined" && localStorage.getItem("walletConnected") === "true"
    return sessionConnected || localStorageConnected
  } catch (error) {
    console.error("[v0] Error checking wallet connection:", error)
    return false
  }
}

export function getWalletAddress(): string | null {
  if (!isWalletConnected()) return null

  try {
    const userData = userSession.loadUserData()
    // Check if userData and profile exist
    if (!userData || !userData.profile) {
      throw new Error("User data not available")
    }
    return userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet || null
  } catch (error) {
    console.error("[v0] Error getting wallet address:", error)
    if (typeof window !== "undefined") {
      return localStorage.getItem("walletAddress")
    }
    return null
  }
}

export async function deployContract(
  contractName: string,
  codeBody: string,
  network: "testnet" | "mainnet",
  onSuccess: (txId: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    console.log("[v0] Starting deployment process...")

    if (!isWalletConnected()) {
      throw new Error("Wallet not connected")
    }

    const userData = userSession.loadUserData()
    
    // Check if userData and profile exist
    if (!userData || !userData.profile || !userData.profile.stxAddress) {
      throw new Error("User data not available")
    }
    
    const senderAddress =
      network === "testnet" ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet

    console.log("[v0] Sender address:", senderAddress)

    const stacksNetwork =
      network === "testnet"
        ? STACKS_TESTNET
        : STACKS_MAINNET

    // Ensure contractName is valid
    const cleanContractName = contractName?.replace(/[^a-zA-Z0-9-]/g, "-")?.toLowerCase() || "contract"

    console.log("[v0] Deploying contract:", cleanContractName, "to", network)

    // Use the wallet-based deployment approach with openContractDeploy
    openContractDeploy({
      contractName: cleanContractName,
      codeBody: codeBody || "",
      network: stacksNetwork,
      onFinish: (data: any) => {
        try {
          console.log("[v0] Deployment finished:", data)
          
          if (data?.txId) {
            onSuccess(data.txId)
          } else {
            throw new Error("No transaction ID returned")
          }
        } catch (error) {
          console.error("[v0] Deployment success handling error:", error)
          onError(error instanceof Error ? error.message : "Failed to process deployment result")
        }
      },
      onCancel: () => {
        console.log("[v0] Deployment cancelled by user")
        onError("Deployment cancelled")
      },
    })
  } catch (error) {
    console.error("[v0] Deployment error:", error)
    onError(error instanceof Error ? error.message : "Unknown deployment error")
  }
}