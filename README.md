# Stella AI - Clarity Smart Contract Editor

Stella AI is the world's most advanced AI-powered development environment for creating Clarity smart contracts on the Stacks blockchain. Describe your contract requirements in natural language and let Stella generate production-ready, secure, and optimized Clarity code.

## How It Works

Stella AI follows a simple but powerful workflow:
1. **Describe** your contract requirements in plain English
2. **Generate** complete, standards-compliant Clarity code with AI
3. **Validate** the code with built-in security and best practice checks
4. **Deploy** directly to Stacks blockchain with wallet integration

The AI generates a **single Clarity file** (.clar) that contains your entire contract - no external dependencies, no complex setups. This single file is what gets deployed to the Stacks blockchain.

## Features

- 🤖 **AI-Powered Generation**: Describe your contract in plain English and let Stella generate Clarity code using the real Groq API
- ✅ **Built-in Validation**: Automatic syntax checking and error detection before deployment
- 🛠️ **AI-Assisted Fixes**: Get suggestions for fixing common Clarity code issues
- ⚡ **One-Click Deploy**: Deploy directly to Stacks blockchain with wallet integration
- 💾 **Local Storage**: Projects saved in your browser's local storage
- 🌐 **Testnet/Mainnet Support**: Deploy to either Stacks Testnet or Mainnet

## Prerequisites

- Node.js 18+ installed
- A Groq API key (get one at https://console.groq.com)
- A Stacks wallet (e.g., Hiro Wallet or Xverse Wallet)

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

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
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
   - Connect your Stacks wallet
   - Click the "Deploy" button
   - Confirm the transaction in your wallet

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/chat/          # AI chat API endpoint (real Groq API integration)
│   └── project/[id]/      # Project page
├── components/            # React components
├── lib/                   # Utility functions
│   ├── clarity-validator.ts # Clarity code validation
│   ├── project-storage.ts   # Project storage management
│   ├── stacks-wallet.ts     # Stacks wallet integration
│   └── groq-client.ts       # Groq API client
└── public/                # Static assets
```

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key for AI model access

## Deployment

This project can be deployed to Vercel with the environment variables configured in the Vercel dashboard.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Groq API](https://groq.com/) - AI inference (Llama 3.3 70b model)
- [Stacks.js](https://stacks.js.org/) - Stacks blockchain integration

## Troubleshooting

### Wallet Connection Issues
- Make sure you have a Stacks wallet installed (Hiro Wallet or Xverse)
- Ensure you're on the correct network (Testnet/Mainnet)
- Refresh the page if connection issues persist

### AI Generation Issues
- Check that your GROQ_API_KEY is correctly set
- Ensure you have internet connectivity
- Try rephrasing your request if the AI doesn't understand

### Code Validation Issues
- The AI can fix most syntax errors automatically
- Semantic issues will be highlighted with suggestions
- Invalid code will be blocked from deployment
- Warnings help improve code quality and security

### Deployment Issues
- Verify your wallet has sufficient STX for transaction fees
- Check that your contract name is unique
- Ensure your code passes validation before deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.