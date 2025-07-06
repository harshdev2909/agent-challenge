# Agent Challenge: DeepWatch

DeepWatch is an AI-powered smart contract auditing agent built with the Mastra framework. It analyzes EVM smart contracts for suspicious patterns, security risks, and provides both heuristic and AI-enhanced analysis. The project includes both a Mastra backend (with auto-generated UI at `localhost:8080`) and a custom Next.js frontend for a modern user experience.

## Features

- **Heuristic and AI-powered contract analysis**
- **AI-generated summary** in every report
- **Risk scoring and findings** for each contract
- **Wallet risk scoring** for top interacting wallets
- **Discord webhook alerts** for high/critical risk contracts
- **Multi-chain support** (Ethereum, Polygon, BSC, Arbitrum)
- **Improved timeouts and error handling** for reliability
- **Testable via Mastra UI or custom Next.js frontend**

## Usage

### 1. Mastra UI (localhost:8080)
- Start the Mastra backend and visit [http://localhost:8080](http://localhost:8080)
- Use the DeepWatch agent's `analyze-contract` tool to analyze any EVM contract
- Output includes risk level, findings, recommendations, and an AI summary

### 2. Custom Next.js Frontend
- Start the frontend in `/frontend` for a modern, user-friendly interface
- Enter a contract address and chain, view results as cards, tables, and Markdown-rendered AI summary

## Quickstart

1. Clone the repo and install dependencies in both `agent-challenge` and `frontend`
2. Set up your `.env` file(s) with required API keys (see agent README)
3. Start the Mastra backend: `npm start` or `pnpm start` in `agent-challenge`
4. (Optional) Start the frontend: `npm run dev` in `frontend`

## Troubleshooting

- **504 Gateway Timeout**: The backend and server timeouts have been increased (20s fetch, 30s server). If you still see timeouts, check your network/API keys.
- **AI summary missing**: Ensure your AI provider API key is set and valid.
- **API errors**: Double-check all required API keys in your `.env` file.

## Customization

- To improve the Mastra UI output, ensure your tool returns clear, structured fields (see agent README).
- For a fully custom experience, use or extend the Next.js frontend.

## License

This project is part of the Mastra framework and follows the same licensing terms.
