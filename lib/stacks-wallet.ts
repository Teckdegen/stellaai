import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network"
import {
  makeContractDeploy,
  broadcastTransaction,
  getAddressFromPrivateKey,
  privateKeyToHex,
  StacksTransactionWire,
  TxBroadcastResult
} from "@stacks/transactions"

export interface WalletData {
  address: string
  network: "testnet" | "mainnet"
}

// Remove wallet connect functions and implement private key-based deployment
export async function deployContractWithPrivateKey(
  contractName: string,
  codeBody: string,
  network: "testnet" | "mainnet",
  privateKey: string,
  onSuccess: (txId: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    console.log("[v0] Starting deployment process with private key...")

    // Validate private key by trying to get an address from it
    let senderAddress: string
    try {
      senderAddress = getAddressFromPrivateKey(privateKey, network === "testnet" ? STACKS_TESTNET : STACKS_MAINNET)
    } catch (error) {
      throw new Error("Invalid private key provided")
    }

    const stacksNetwork = network === "testnet" ? STACKS_TESTNET : STACKS_MAINNET

    // Ensure contractName is valid
    const cleanContractName = contractName?.replace(/[^a-zA-Z0-9-]/g, "-")?.toLowerCase() || "contract"

    console.log("[v0] Deploying contract:", cleanContractName, "to", network)

    // Create the contract deployment transaction
    const transaction: StacksTransactionWire = await makeContractDeploy({
      contractName: cleanContractName,
      codeBody: codeBody || "",
      senderKey: privateKey,
      network: stacksNetwork,
    })

    // Broadcast the transaction
    const result: TxBroadcastResult = await broadcastTransaction({
      transaction: transaction,
      network: stacksNetwork
    })
    
    // Check if result is successful or has error
    if ('error' in result) {
      throw new Error(`Transaction broadcast failed: ${result.reason} - ${result.error}`)
    }
    
    if (!result.txid) {
      throw new Error("No transaction ID returned from broadcast")
    }

    onSuccess(result.txid)
  } catch (error) {
    console.error("[v0] Deployment error:", error)
    onError(error instanceof Error ? error.message : "Unknown deployment error")
  }
}