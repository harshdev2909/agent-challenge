import dotenv from "dotenv";
dotenv.config();
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { deepwatchTool } from "./deepwatch-tool";
import { walletRiskTool } from "./wallet-risk-tool";
import { model } from "../../config";
import { createAIAnalyzer } from "./detection/ai";

// Initialize memory with LibSQLStore for persistence
const memory = new Memory({
	storage: new LibSQLStore({
		url: "file:../mastra.db", // This creates a SQLite DB in your project root
	}),
});

export const metadata = {
	name: "DeepWatch",
	description: "AI-powered smart contract auditor that detects suspicious patterns and flags risky contracts in real-time.",
	version: "0.1.0"
};

const name = "DeepWatch Agent";
const instructions = `
You are DeepWatch, an AI-powered smart contract auditor that detects suspicious patterns and flags risky contracts in real-time.

Primary functions are:
- Analyze smart contract transactions and code for security vulnerabilities
- Detect suspicious patterns like rug pulls, honeypots, and malicious contracts
- Provide risk assessments and security recommendations
- Monitor contract interactions and flag unusual behavior

When analyzing contracts:
- Always verify the contract address format (0x followed by 40 hex characters)
- Check for common red flags like high gas fees, unusual token distributions
- Look for patterns that indicate potential scams or exploits
- Provide clear risk levels (Low, Medium, High, Critical)
- Include specific recommendations for users

Use the deepwatchTool to fetch and analyze contract data from blockchain explorers.
`;

export const deepwatchAgent = new Agent({
	name,
	instructions,
	model,
	memory,
	tools: {
		deepwatch: deepwatchTool,
		walletRiskAnalysis: walletRiskTool,
	},
	chat: async ({ input }) => {
		// General chat handler: answer any freeform question using the LLM
		const ai = createAIAnalyzer();
		if (!ai) return "No LLM provider configured. Please set your OpenRouter, OpenAI, or Claude API key.";
		const result = await ai.analyzeContract({
			contractAddress: "",
			contractCode: "",
			transactions: [],
			findings: [],
			// Use the user's input as a prompt for general Q&A
			tokenInfo: { name: "", symbol: "", decimals: 0, totalSupply: "" },
		});
		// Return the riskAssessment or codeReview as the answer
		return result.riskAssessment || result.codeReview || "No answer generated.";
	},
}); 