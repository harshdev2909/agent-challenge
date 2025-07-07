import dotenv from "dotenv";
dotenv.config();
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchContractData } from "./utils/etherscan";
import { analyzeContractRisk } from "./detection/heuristics";
import { summarizeAuditReport } from "./detection/summaryAI";
import { sendDiscordAlert } from "./utils/discord";
import { uploadToPinata } from "./utils/ipfs";

export const deepwatchTool = createTool({
	id: "analyze-contract",
	description: "Analyze a smart contract for security risks and suspicious patterns",
	inputSchema: z.object({
		contractAddress: z.string().describe("Ethereum contract address (0x format)"),
		chain: z.enum(["ethereum", "polygon", "bsc", "arbitrum"]).optional().default("ethereum").describe("Blockchain network to analyze"),
	}),
	outputSchema: z.object({
		contractAddress: z.string(),
		riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
		riskScore: z.number().min(0).max(100),
		findings: z.array(z.object({
			type: z.string(),
			severity: z.enum(["Low", "Medium", "High", "Critical"]),
			description: z.string(),
			recommendation: z.string(),
		})),
		summary: z.string(),
		recommendations: z.array(z.string()),
		aiSummary: z.string().optional(),
		wallets: z.array(z.object({
			address: z.string(),
			score: z.number(),
			flags: z.array(z.string()),
		})).optional(),
		contractType: z.string().optional(),
		ipfsHash: z.string().optional(),
	}),
	execute: async ({ context }) => {
		const { contractAddress, chain } = context;
		const riskAnalysis = await analyzeContractRisk(await fetchContractData(contractAddress, chain));
		const aiSummary = await summarizeAuditReport(riskAnalysis);
		let ipfsHash = undefined;
		try {
			const pinataResult = await uploadToPinata({
				...riskAnalysis,
				aiSummary,
				contractAddress,
				chain,
				timestamp: new Date().toISOString(),
			});
			ipfsHash = pinataResult.IpfsHash;
		} catch (e) {
			ipfsHash = undefined;
		}
		if (riskAnalysis.riskLevel === "High" || riskAnalysis.riskLevel === "Critical") {
			const alertMsg = `🚨 DeepWatch Alert: ${riskAnalysis.riskLevel} risk contract detected!\nAddress: ${contractAddress}\nChain: ${chain}\nSummary: ${riskAnalysis.summary}`;
			sendDiscordAlert(alertMsg);
		}
		return {
			contractAddress,
			riskLevel: riskAnalysis.riskLevel,
			riskScore: riskAnalysis.riskScore,
			findings: riskAnalysis.findings,
			summary: riskAnalysis.summary,
			recommendations: riskAnalysis.recommendations,
			// aiSummary,
			ipfsHash,
			wallets: riskAnalysis.wallets,
			contractType: riskAnalysis.contractType,
		};
	},
});

const analyzeContract = async (contractAddress: string, chain: string = "ethereum") => {
	try {
		// Validate contract address format
		if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
			throw new Error("Invalid contract address format. Must be 0x followed by 40 hex characters.");
		}

		// Fetch contract data from blockchain explorer
		const contractData = await fetchContractData(contractAddress, chain);
		
		// Analyze for risks using heuristics
		const riskAnalysis = await analyzeContractRisk(contractData);
		
		return {
			contractAddress,
			riskLevel: riskAnalysis.riskLevel,
			riskScore: riskAnalysis.riskScore,
			findings: riskAnalysis.findings,
			summary: riskAnalysis.summary,
			recommendations: riskAnalysis.recommendations,
		};
	} catch (error) {
		throw new Error(`Failed to analyze contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}; 