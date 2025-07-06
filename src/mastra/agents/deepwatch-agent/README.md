# DeepWatch Agent

AI-powered smart contract auditor that detects suspicious patterns and flags risky contracts in real-time.

## Overview

DeepWatch is a comprehensive smart contract security analysis agent that combines blockchain data analysis with AI-powered insights to identify potential risks in smart contracts. It now includes:
- **AI-generated summary** in every analysis output
- Increased backend and API timeouts for reliability
- Improved error handling and troubleshooting guidance
- Integration tips for both Mastra UI and custom frontends

## Features

- **Real-time Contract Analysis**: Fetches and analyzes contract data from multiple blockchain networks
- **Risk Detection**: Identifies honeypots, rug pulls, and other malicious patterns
- **Code Vulnerability Scanning**: Detects common smart contract vulnerabilities
- **AI-Enhanced Analysis**: Integration with OpenAI, Claude, or local LLMs for advanced insights
- **Multi-Chain Support**: Works with Ethereum, Polygon, BSC, and Arbitrum
- **Wallet Risk Scoring**: Analyzes top interacting wallets for suspicious behavior
- **Discord Alerts**: Sends alerts for high/critical risk contracts

## File Structure

```
deepwatch-agent/
├── index.ts                 # Main agent configuration and metadata
├── deepwatch-tool.ts        # Primary tool for contract analysis
├── utils/
│   └── etherscan.ts         # Blockchain data fetching utilities
├── detection/
│   ├── heuristics.ts        # Risk detection rules and patterns
│   ├── ai.ts                # AI-powered analysis (optional)
│   └── summaryAI.ts         # AI summary generation
└── README.md                # This file
```

## Setup

### Environment Variables

Add the following API keys to your `.env` file:

```bash
# Required for blockchain data
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key

# Optional for AI-enhanced analysis
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### API Keys Setup

1. **Etherscan**: Get free API key from [etherscan.io](https://etherscan.io/apis)
2. **PolygonScan**: Get free API key from [polygonscan.com](https://polygonscan.com/apis)
3. **BSCScan**: Get free API key from [bscscan.com](https://bscscan.com/apis)
4. **Arbiscan**: Get free API key from [arbiscan.io](https://arbiscan.io/apis)

## Usage

The DeepWatch agent can analyze any smart contract by providing its address. The output now includes an `aiSummary` field for a plain-language explanation of the findings.

```
Analyze contract: 0x1234567890123456789012345678901234567890
```

### Output Example

```
{
  "contractAddress": "0x...",
  "riskLevel": "Medium",
  "riskScore": 30,
  "findings": [...],
  "summary": "HIGH RISK: ...",
  "recommendations": [...],
  "aiSummary": "This contract is medium risk. 1 high severity issue detected...",
  "contractType": "ERC20"
}
```

## Customizing Output for Mastra UI

- The Mastra UI at `localhost:8080` displays the output as JSON. To improve readability:
  - Use clear field names (`aiSummary`, `riskLevel`, `findings`, etc.)
  - Return structured arrays for findings and recommendations
  - Include a plain-language summary in `aiSummary`
- For a fully custom UI, use the `/frontend` app to render results as cards, tables, etc.

## Troubleshooting

- **504 Gateway Timeout**: Increase the Mastra server timeout in `src/mastra/index.ts` (default now 30s). Also, backend fetches use a 20s timeout.
- **API Key Errors**: Ensure all required API keys are set in your `.env` file.
- **Slow Analysis**: The agent fetches contract code, transactions, and token info. Network/API slowness can affect response time.
- **AI Summary Missing**: Check that your AI provider API key is set and valid.

## Risk Detection Capabilities

### Honeypot Detection
- Buy-only transaction patterns
- Blacklist function detection
- Sell prevention mechanisms

### Rug Pull Indicators
- High ownership concentration
- Suspicious transfer patterns
- Creator wallet analysis

### Code Vulnerabilities
- Reentrancy vulnerabilities
- Integer overflow/underflow
- Unrestricted access controls
- Missing SafeMath protection

### Transaction Analysis
- High gas fee patterns
- Rapid trading detection
- Unusual transaction volumes

## Risk Levels

- **Low (0-29)**: Minimal risk, standard due diligence recommended
- **Medium (30-59)**: Moderate risk, proceed with caution
- **High (60-79)**: High risk, exercise extreme caution
- **Critical (80-100)**: Critical risk, avoid interaction

## Integration

The agent can be integrated into your Mastra workflow by importing:

```typescript
import { deepwatchAgent } from "./deepwatch-agent";
```

## Contributing

To add new detection patterns:
1. Add new detection functions in `detection/heuristics.ts`
2. Update the risk scoring algorithm
3. Test with known malicious and legitimate contracts

## License

This agent is part of the Mastra framework and follows the same licensing terms. 