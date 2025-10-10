import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network"
import {
  makeContractDeploy,
  broadcastTransaction,
  getAddressFromPrivateKey,
  privateKeyToHex,
  StacksTransactionWire,
  TxBroadcastResult,
  estimateContractDeploy,
  getNonce
} from "@stacks/transactions"
import { handleTransactionError, formatErrorForConsole } from "./transaction-error-handler"

// Remove wallet connect functions and implement private key-based deployment
export async function deployContractWithPrivateKey(
  contractName: string,
  codeBody: string,
  network: "testnet" | "mainnet",
  privateKey: string,
  onSuccess: (txId: string) => void,
  onError: (error: string) => void,
  onDetailedError?: (errorInfo: string) => void,
): Promise<void> {
  try {
    console.log("[v0] Starting deployment process with private key...")

    // Validate private key by trying to get an address from it
    let senderAddress: string
    try {
      senderAddress = getAddressFromPrivateKey(privateKey, network === "testnet" ? STACKS_TESTNET : STACKS_MAINNET)
    } catch (error) {
      const errorInfo = handleTransactionError(new Error("Invalid private key provided"))
      if (onDetailedError) {
        onDetailedError(formatErrorForConsole(errorInfo))
      }
      throw new Error("Invalid private key provided")
    }

    const stacksNetwork = network === "testnet" ? STACKS_TESTNET : STACKS_MAINNET

    // Ensure contractName is valid
    const cleanContractName = contractName?.replace(/[^a-zA-Z0-9-]/g, "-")?.toLowerCase() || "contract"

    console.log("[v0] Deploying contract:", cleanContractName, "to", network)

    // Estimate transaction fees and nonce
    let fee: bigint
    let nonce: bigint
    
    try {
      // Estimate the fee for the contract deployment
      fee = await estimateContractDeploy({
        contractName: cleanContractName,
        codeBody: codeBody || "",
        senderKey: privateKey,
        network: stacksNetwork,
      })
      
      // Get the current nonce for the sender
      nonce = await getNonce(senderAddress, stacksNetwork)
    } catch (estimationError) {
      console.warn("[v0] Could not estimate fee/nonce, using defaults:", estimationError)
      fee = BigInt(1000000) // Default fee in microSTX
      nonce = BigInt(0) // Default nonce
    }

    // Create the contract deployment transaction with estimated fee and nonce
    const transaction: StacksTransactionWire = await makeContractDeploy({
      contractName: cleanContractName,
      codeBody: codeBody || "",
      senderKey: privateKey,
      network: stacksNetwork,
      fee: fee,
      nonce: nonce
    })

    console.log("[v0] Transaction created with fee:", fee.toString(), "and nonce:", nonce.toString())

    // Broadcast the transaction
    const result: TxBroadcastResult = await broadcastTransaction({
      transaction: transaction,
      network: stacksNetwork
    })
    
    console.log("[v0] Broadcast result:", result)
    
    // Check if result is successful or has error
    if ('error' in result) {
      const errorInfo = handleTransactionError(null, result)
      if (onDetailedError) {
        onDetailedError(formatErrorForConsole(errorInfo))
      }
      
      // Handle specific error types with better messages
      if (result.reason === 'NotEnoughFunds') {
        throw new Error(`Insufficient STX balance for deployment. Please ensure your wallet has enough STX for transaction fees.`)
      } else if (result.reason === 'ContractAlreadyExists') {
        throw new Error(`A contract with the name "${cleanContractName}" already exists for this address. Please use a different contract name.`)
      } else if (result.reason === 'FeeTooLow') {
        throw new Error(`Transaction fee is too low. Please try again with a higher fee.`)
      } else {
        throw new Error(`Transaction broadcast failed: ${result.reason} - ${result.error}`)
      }
    }
    
    if (!result.txid) {
      const errorInfo = handleTransactionError(new Error("No transaction ID returned from broadcast"))
      if (onDetailedError) {
        onDetailedError(formatErrorForConsole(errorInfo))
      }
      throw new Error("No transaction ID returned from broadcast")
    }

    onSuccess(result.txid)
  } catch (error) {
    console.error("[v0] Deployment error:", error)
    // If we haven't already provided detailed error info, do it now
    if (error instanceof Error) {
      const errorInfo = handleTransactionError(error)
      if (onDetailedError) {
        onDetailedError(formatErrorForConsole(errorInfo))
      }
    }
    onError(error instanceof Error ? error.message : "Unknown deployment error")
  }
}