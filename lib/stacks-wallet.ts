import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network"
import {
  makeContractDeploy,
  broadcastTransaction,
  getAddressFromPrivateKey,
  privateKeyToHex,
  StacksTransactionWire,
  TxBroadcastResult,
  StacksNetwork
} from "@stacks/transactions"
import { fetchNonce, fetchFeeEstimate } from "@stacks/transactions/dist/esm/fetch"
import { handleTransactionError, formatErrorForConsole } from "./transaction-error-handler"

// Helper function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    const stacksNetwork: StacksNetwork = network === "testnet" ? STACKS_TESTNET : STACKS_MAINNET

    // Ensure contractName is valid
    const cleanContractName = contractName?.replace(/[^a-zA-Z0-9-]/g, "-")?.toLowerCase() || "contract"

    console.log("[v0] Deploying contract:", cleanContractName, "to", network)

    // Get the current nonce for the sender with improved handling
    let nonce: bigint = BigInt(0)
    let fee: bigint = BigInt(1000000)
    
    try {
      // Retry logic for getting nonce with exponential backoff
      let attempts = 0
      const maxAttempts = 5
      let success = false
      
      while (attempts < maxAttempts && !success) {
        try {
          nonce = await fetchNonce({ address: senderAddress, network: stacksNetwork })
          console.log("[v0] Retrieved nonce:", nonce.toString())
          success = true
        } catch (nonceError) {
          attempts++
          console.warn(`[v0] Failed to get nonce (attempt ${attempts}/${maxAttempts}):`, nonceError)
          if (attempts < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s, 8s
            await delay(Math.pow(2, attempts) * 1000)
          } else {
            console.warn("[v0] Failed to get nonce after all attempts, using default nonce")
            nonce = BigInt(0)
          }
        }
      }
      
      // Estimate the fee for the contract deployment
      try {
        fee = await fetchFeeEstimate({
          transaction: {
            contractName: cleanContractName,
            codeBody: codeBody || "",
            senderKey: privateKey,
            network: stacksNetwork,
          } as any
        })
        console.log("[v0] Estimated fee:", fee.toString())
      } catch (feeError) {
        console.warn("[v0] Failed to estimate fee, using default:", feeError)
      }
    } catch (estimationError) {
      console.warn("[v0] Could not estimate fee/nonce, using defaults:", estimationError)
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

    // Broadcast the transaction with retry logic for BadNonce errors
    let broadcastAttempts = 0
    const maxBroadcastAttempts = 3
    let result: TxBroadcastResult
    
    while (broadcastAttempts < maxBroadcastAttempts) {
      result = await broadcastTransaction({
        transaction: transaction,
        network: stacksNetwork
      })
      
      console.log("[v0] Broadcast result (attempt", broadcastAttempts + 1, "):", result)
      
      // If successful or if it's not a BadNonce error, break the loop
      if (!('error' in result) || result.reason !== 'BadNonce') {
        break
      }
      
      // If it's a BadNonce error, increment nonce and retry
      broadcastAttempts++
      if (broadcastAttempts < maxBroadcastAttempts) {
        console.log("[v0] BadNonce error, incrementing nonce and retrying...")
        nonce = nonce + BigInt(1)
        transaction.setNonce(nonce)
        // Add a small delay before retrying
        await delay(2000)
      }
    }
    
    // Check if result is successful or has error
    if ('error' in result!) {
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
      } else if (result.reason === 'BadNonce') {
        throw new Error(`Transaction nonce mismatch after multiple attempts. This can happen if you have pending transactions or network congestion. Please wait for pending transactions to complete and try again.`)
      } else {
        throw new Error(`Transaction broadcast failed: ${result.reason} - ${result.error}`)
      }
    }
    
    if (!result!.txid) {
      const errorInfo = handleTransactionError(new Error("No transaction ID returned from broadcast"))
      if (onDetailedError) {
        onDetailedError(formatErrorForConsole(errorInfo))
      }
      throw new Error("No transaction ID returned from broadcast")
    }

    onSuccess(result!.txid)
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