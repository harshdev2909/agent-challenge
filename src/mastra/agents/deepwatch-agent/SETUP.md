# DeepWatch Agent Setup Guide

## 🔑 Required API Keys

### 1. Etherscan API Key (Ethereum)
**Get it here**: https://etherscan.io/apis
**Steps**:
1. Visit https://etherscan.io/apis
2. Click "Sign Up" or "Login"
3. Go to Profile → API Keys
4. Click "Add" → Name it "DeepWatch"
5. Copy the API key

### 2. PolygonScan API Key (Polygon)
**Get it here**: https://polygonscan.com/apis
**Steps**:
1. Visit https://polygonscan.com/apis
2. Click "Sign Up" or "Login"
3. Go to Profile → API Keys
4. Click "Add" → Name it "DeepWatch"
5. Copy the API key

### 3. BSCScan API Key (Binance Smart Chain)
**Get it here**: https://bscscan.com/apis
**Steps**:
1. Visit https://bscscan.com/apis
2. Click "Sign Up" or "Login"
3. Go to Profile → API Keys
4. Click "Add" → Name it "DeepWatch"
5. Copy the API key

### 4. Arbiscan API Key (Arbitrum)
**Get it here**: https://arbiscan.io/apis
**Steps**:
1. Visit https://arbiscan.io/apis
2. Click "Sign Up" or "Login"
3. Go to Profile → API Keys
4. Click "Add" → Name it "DeepWatch"
5. Copy the API key

## 🤖 Optional AI API Keys

### 5. OpenAI API Key (Enhanced Analysis)
**Get it here**: https://platform.openai.com/api-keys
**Steps**:
1. Visit https://platform.openai.com/api-keys
2. Sign up/Login to OpenAI
3. Click "Create new secret key"
4. Name it "DeepWatch AI"
5. Copy the key (starts with `sk-`)

### 6. Claude API Key (Alternative AI)
**Get it here**: https://console.anthropic.com/
**Steps**:
1. Visit https://console.anthropic.com/
2. Sign up/Login to Anthropic
3. Go to "API Keys"
4. Click "Create Key"
5. Name it "DeepWatch Claude"
6. Copy the key (starts with `sk-ant-`)

## 📝 Environment Setup

Create a `.env` file in your project root with:

```bash
# Required: Blockchain APIs
ETHERSCAN_API_KEY=your_etherscan_key_here
POLYGONSCAN_API_KEY=your_polygonscan_key_here
BSCSCAN_API_KEY=your_bscscan_key_here
ARBISCAN_API_KEY=your_arbiscan_key_here

# Optional: AI APIs
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4
CLAUDE_API_KEY=your_claude_key_here
CLAUDE_MODEL=claude-3-sonnet-20240229
```

## 💰 Cost Information

### Blockchain APIs
- **All free**: Etherscan, PolygonScan, BSCScan, Arbiscan
- **Rate limits**: 5 calls/second, 100,000 calls/day (free tier)

### AI APIs (Optional)
- **OpenAI**: ~$0.03 per 1K tokens (GPT-4)
- **Claude**: ~$0.015 per 1K tokens (Claude-3)

## 🚀 Quick Start

1. Get at least one blockchain API key (Etherscan recommended)
2. Add it to your `.env` file
3. Test with a contract address:
   ```
   Analyze: 0x1234567890123456789012345678901234567890
   ```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and private
- Monitor your API usage to avoid rate limits
- Consider upgrading to paid tiers for higher usage 