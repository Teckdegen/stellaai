import { AppConfig, UserSession, showConnect, openContractDeploy } from "@stacks/connect"
import { StacksTestnet, StacksMainnet } from "@stacks/network"

const appConfig = new AppConfig(["store_write", "publish_data"])
export const userSession = new UserSession({ appConfig })

export interface WalletData {
  address: string
  network: "testnet" | "mainnet"
}

export function connectWallet(onFinish: (data: WalletData) => void, onCancel: () => void) {
  console.log("[v0] Initiating wallet connection...")

  showConnect({
    appDetails: {
      name: "Stella AI - Clarity Smart Contract Editor",
      icon: typeof window !== "undefined" ? window.location.origin + "/stella-icon.png" : "",
    },
    onFinish: (payload: any) => {
      console.log("[v0] Wallet connected successfully", payload)
      try {
        const userData = userSession.loadUserData()
        const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet || ""
        onFinish({
          address,
          network: "testnet",
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
    const sessionConnected = userSession?.isUserSignedIn ? userSession.isUserSignedIn() : false
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
    return userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet || null
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
    const senderAddress =
      network === "testnet" ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet

    console.log("[v0] Sender address:", senderAddress)

    const stacksNetwork =
      network === "testnet"
        ? new StacksTestnet({
            url: "https://api.testnet.hiro.so",
          })
        : new StacksMainnet({
            url: "https://api.mainnet.hiro.so",
          })

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