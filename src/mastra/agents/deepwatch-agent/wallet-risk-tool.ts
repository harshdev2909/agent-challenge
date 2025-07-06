import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchContractData } from "./utils/etherscan";
import { analyzeWalletRisks } from "./detection/walletRisk";

export const walletRiskTool = createTool({
	id: "walletRiskAnalysis",
	description: "Analyze the risk profile of top wallet addresses that interacted with a smart contract",
	inputSchema: z.object({
		address: z.string().describe("The contract address to analyze wallet interactions for"),
		chain: z.enum(["ethereum", "polygon", "bsc", "arbitrum"]).describe("The blockchain network"),
		topN: z.number().min(1).max(20).default(5).describe("Number of top wallets to analyze (1-20)")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		contractAddress: z.string().optional(),
		chain: z.string().optional(),
		analysis: z.object({
			totalWalletsAnalyzed: z.number(),
			highRiskWallets: z.number(),
			averageRiskScore: z.number(),
			wallets: z.array(z.object({
				address: z.string(),
				riskScore: z.number(),
				flags: z.array(z.string()),
				riskLevel: z.string(),
			}))
		}).optional(),
		summary: z.string().optional(),
		error: z.string().optional(),
	}),
	execute: async ({ context }) => {
		try {
			const { address, chain, topN } = context;
			console.log(`[DeepWatch] Starting wallet risk analysis for ${address} (${chain}), topN=${topN}`);
			const contractData = await fetchContractData(address, chain);
			console.log(`[DeepWatch] Contract data fetched, running analyzeWalletRisks...`);
			const walletRisks = await analyzeWalletRisks(contractData.transactions, topN);
			console.log(`[DeepWatch] Wallet risk analysis complete, found ${walletRisks.length} wallets.`);
			const totalWallets = walletRisks.length;
			const highRiskWallets = walletRisks.filter(w => w.score >= 30).length;
			const avgRiskScore = walletRisks.reduce((sum, w) => sum + w.score, 0) / totalWallets;
			return {
				success: true,
				contractAddress: address,
				chain,
				analysis: {
					totalWalletsAnalyzed: totalWallets,
					highRiskWallets,
					averageRiskScore: Math.round(avgRiskScore * 100) / 100,
					wallets: walletRisks.map(w => ({
						address: w.address,
						riskScore: w.score,
						flags: w.flags,
						riskLevel: w.score >= 50 ? "Critical" : w.score >= 30 ? "High" : w.score >= 15 ? "Medium" : "Low"
					}))
				},
				summary: `Analyzed ${totalWallets} top wallets. ${highRiskWallets} high-risk wallets detected with average risk score of ${Math.round(avgRiskScore * 100) / 100}.`
			};
		} catch (error) {
			console.error("[DeepWatch] Wallet risk analysis error:", error);
			return {
				success: false,
				error: `Failed to analyze wallet risks: ${error instanceof Error ? error.message : "Unknown error"}`
			};
		}
	},
}); 