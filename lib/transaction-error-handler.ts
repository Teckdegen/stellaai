import { TxBroadcastResult } from "@stacks/transactions";

export interface TransactionErrorInfo {
  title: string;
  description: string;
  causes: string[];
  solutions: string[];
  severity: "error" | "warning" | "info";
}

/**
 * Enhanced transaction error handler that provides detailed information about deployment failures
 */
export function handleTransactionError(error: any, result?: TxBroadcastResult): TransactionErrorInfo {
  // Handle TxBroadcastResult errors
  if (result && 'error' in result) {
    switch (result.reason) {
      case 'NotEnoughFunds':
        return {
          title: "Insufficient Funds",
          description: "Your wallet doesn't have enough STX to cover transaction fees.",
          causes: [
            "Wallet balance is lower than the required transaction fee",
            "Network congestion causing higher than expected fees",
            "Multiple pending transactions depleting your balance"
          ],
          solutions: [
            "Add more STX to your wallet",
            "For testnet, use the Stacks faucet to get more tokens",
            "Wait for pending transactions to complete",
            "Try deploying again with a higher fee"
          ],
          severity: "error"
        };

      case 'ContractAlreadyExists':
        return {
          title: "Contract Name Conflict",
          description: "A contract with this name already exists for your address.",
          causes: [
            "You've previously deployed a contract with the same name",
            "The contract name is already taken by another developer"
          ],
          solutions: [
            "Change your contract name in the project settings",
            "Use a more unique contract name with versioning (e.g., 'my-contract-v2')",
            "Check if you intended to update rather than deploy a new contract"
          ],
          severity: "error"
        };

      case 'FeeTooLow':
        return {
          title: "Transaction Fee Too Low",
          description: "The transaction fee is below the network minimum requirements.",
          causes: [
            "Network congestion requiring higher fees",
            "Automatic fee calculation resulted in an insufficient amount"
          ],
          solutions: [
            "Increase the transaction fee manually",
            "Try deploying again (the system may auto-adjust the fee)",
            "Deploy during off-peak hours when fees are lower"
          ],
          severity: "error"
        };

      case 'BadNonce':
        return {
          title: "Nonce Mismatch",
          description: "Transaction nonce doesn't match expected value for your address.",
          causes: [
            "Multiple transactions sent simultaneously",
            "Previous transaction is still pending",
            "Nonce synchronization issue with the network"
          ],
          solutions: [
            "Wait for pending transactions to complete (check Stacks explorer)",
            "Refresh your wallet to sync the latest nonce",
            "Wait 10-15 minutes and try again",
            "Use a different wallet if the issue persists"
          ],
          severity: "error"
        };

      default:
        return {
          title: "Transaction Failed",
          description: `Transaction broadcast failed: ${result.reason} - ${result.error}`,
          causes: [
            "Contract code contains errors that prevent deployment",
            "Transaction violates Stacks protocol rules",
            "Network issues or temporary service disruption"
          ],
          solutions: [
            "Review your contract code for syntax and logical errors",
            "Check the Stacks explorer for detailed error information",
            "Validate your code thoroughly before deployment",
            "Try again later if it appears to be a network issue"
          ],
          severity: "error"
        };
    }
  }

  // Handle execution errors (transaction included but failed during execution)
  if (error && typeof error === 'string' && error.includes('aborted during execution')) {
    return {
      title: "Transaction Aborted During Execution",
      description: "The transaction was included in a block but failed during execution.",
      causes: [
        "Contract code contains runtime errors",
        "Insufficient funds detected during execution",
        "Contract logic violates protocol constraints",
        "Stack overflow or other execution limits exceeded"
      ],
      solutions: [
        "Review your contract code for logical errors",
        "Ensure your wallet has sufficient STX for the entire transaction",
        "Check the transaction details on the Stacks explorer for specific error information",
        "Simplify complex functions or reduce contract size",
        "Test thoroughly on testnet before mainnet deployment"
      ],
      severity: "error"
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    if (error.message.includes('Invalid private key')) {
      return {
        title: "Invalid Private Key",
        description: "The private key you provided is invalid or malformed.",
        causes: [
          "Private key format is incorrect",
          "Key contains extra characters or spaces",
          "Using a public key instead of private key"
        ],
        solutions: [
          "Verify you're using the correct private key format",
          "Ensure there are no extra spaces or characters",
          "Double-check that you're using your private key, not public key",
          "Try exporting your key again from your wallet"
        ],
        severity: "error"
      };
    }

    return {
      title: "Deployment Error",
      description: error.message || "An unknown error occurred during deployment.",
      causes: [
        "Network connectivity issues",
        "Invalid contract code",
        "Wallet configuration problems",
        "Stacks network temporary issues"
      ],
      solutions: [
        "Check your internet connection",
        "Verify your contract code is valid",
        "Ensure your private key is correct",
        "Try again in a few minutes",
        "Check Stacks network status"
      ],
      severity: "error"
    };
  }

  // Fallback for unknown errors
  return {
    title: "Unknown Error",
    description: "An unexpected error occurred during deployment.",
    causes: [
      "Unexpected network conditions",
      "Software bug in the deployment tool",
      "Incompatible contract code"
    ],
    solutions: [
      "Try deploying again",
      "Check your contract code for issues",
      "Review the console logs for more details",
      "Report this issue to the development team"
    ],
    severity: "error"
  };
}

/**
 * Format error information for display in the console
 */
export function formatErrorForConsole(errorInfo: TransactionErrorInfo): string {
  let formatted = `❌ ${errorInfo.title}\n`;
  formatted += `${errorInfo.description}\n\n`;
  
  if (errorInfo.causes.length > 0) {
    formatted += "Potential Causes:\n";
    errorInfo.causes.forEach(cause => {
      formatted += `  • ${cause}\n`;
    });
    formatted += "\n";
  }
  
  if (errorInfo.solutions.length > 0) {
    formatted += "Suggested Solutions:\n";
    errorInfo.solutions.forEach(solution => {
      formatted += `  • ${solution}\n`;
    });
  }
  
  return formatted;
}