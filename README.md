# Stella AI - Clarity Smart Contract Editor

Stella AI is the world's most advanced AI-powered development environment for creating Clarity smart contracts on the Stacks blockchain. Describe your contract requirements in natural language and let Stella generate production-ready, secure, and optimized Clarity code.

## 🔧 API KEY SETUP

This project requires a Groq API key to function. You need to add your API key directly to the source code:

1. Get your free Groq API key at https://console.groq.com
2. Add it to this file:
   - `app/api/chat/route.ts`

Look for the line `const GROQ_API_KEY = "your-groq-api-key-here";` and replace it with your actual key.

## How It Works

Stella AI follows a simple but powerful workflow:
1. **Describe** your contract requirements in plain English
2. **Generate** complete, standards-compliant Clarity code with AI
3. **Validate** the code with built-in security and best practice checks
4. **Deploy** directly to Stacks blockchain with private key

The AI generates a **single Clarity file** (.clar) that contains your entire contract - no external dependencies, no complex setups. This single file is what gets deployed to the Stacks blockchain.

## Features

- 🤖 **AI-Powered Generation**: Describe your contract in plain English and let Stella generate Clarity code using the real Groq API
- ✅ **Built-in Validation**: Automatic syntax checking and error detection before deployment
- 🛠️ **AI-Assisted Fixes**: Get suggestions for fixing common Clarity code issues
- ⚡ **One-Click Deploy**: Deploy directly to Stacks blockchain with private key
- 💾 **Local Storage**: Projects saved in your browser's local storage
- 🌐 **Testnet/Mainnet Support**: Deploy to either Stacks Testnet or Mainnet
- 🚨 **Enhanced Error Handling**: Detailed error messages with causes and solutions for deployment issues

## Prerequisites

- Node.js 18+ installed
- A Groq API key (get one at https://console.groq.com)
- A Stacks private key for deployment

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd clarity-ide
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to start using Stella AI.

## Usage

1. **Create a Project:**
   - Enter a contract name
   - Select Testnet or Mainnet
   - Click "Create Project"

2. **Interact with Stella AI:**
   - Use the chat panel on the left to describe what you want to build
   - Examples:
     - "Create an NFT contract with minting"
     - "Add staking functionality"
     - "Create a marketplace with royalties"

3. **Edit Code:**
   - The generated code appears in the editor
   - You can manually edit the code if needed

4. **Deploy Contract:**
   - Click the "Deploy Contract" button
   - Enter your Stacks private key when prompted
   - Confirm deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/chat/          # AI chat API endpoint (real Groq API integration)
│   └── project/[id]/      # Project page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── clarity-validator.ts # Clarity code validation
│   ├── project-storage.ts   # Project storage management
│   ├── stacks-wallet.ts     # Stacks private key deployment
│   └── transaction-error-handler.ts # Enhanced error handling
└── public/                # Static assets
```

## API Key Setup

This project no longer uses environment variables for the Groq API key. Instead, you need to add your API key directly to the source code as described in the API Key Setup section above.

## Deployment

### Vercel Deployment
This project is configured for easy deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Add your Groq API key directly to the source code before deploying
3. Deploy!

See [Vercel Deployment Guide](docs/vercel-deployment.md) for detailed instructions.

### Manual Deployment
You can also deploy manually:
```bash
npm run build
npm start
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Groq API](https://groq.com/) - AI inference (Llama 3.3 70b model)
- [Stacks.js](https://stacks.js.org/) - Stacks blockchain integration

## Troubleshooting

### AI Generation Issues
- Ensure you have internet connectivity
- Try rephrasing your request if the AI doesn't understand

### Code Validation Issues
- The AI can fix most syntax errors automatically
- Semantic issues will be highlighted with suggestions
- Invalid code will be blocked from deployment
- Warnings help improve code quality and security

### Deployment Issues
- Verify your private key is valid and has sufficient STX for transaction fees
- Check that your contract name is unique
- Ensure your code passes validation before deployment
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting

Common deployment errors and their solutions:
- **"NotEnoughFunds"**: Your wallet doesn't have enough STX for transaction fees
- **"ContractAlreadyExists"**: A contract with that name already exists for your address
- **"Transaction aborted during execution"**: The transaction failed during execution; check your code and wallet balance
- **"FeeTooLow"**: Transaction fee is below network requirements
- **"BadNonce"**: Transaction nonce doesn't match expected value

The IDE now provides enhanced error handling with detailed causes and solutions for all deployment issues.

## Security

Since you're adding the API key directly to the source code, make sure to:
1. Never commit your actual API key to version control
2. Add the files containing your API key to `.gitignore` if you're pushing to a public repository
3. Use a separate branch or fork for development that isn't publicly accessible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.