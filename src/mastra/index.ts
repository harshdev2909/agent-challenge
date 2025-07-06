import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { weatherAgent } from "./agents/weather-agent/weather-agent"; // This can be deleted later
import { weatherWorkflow } from "./agents/weather-agent/weather-workflow"; // This can be deleted later
import { yourAgent } from "./agents/your-agent/your-agent"; // Build your agent here
import { fetchContractData } from "./agents/deepwatch-agent/utils/etherscan";
import { analyzeContractRisk } from "./agents/deepwatch-agent/detection/heuristics";
import { deepwatchAgent } from "./agents/deepwatch-agent/index";


export const mastra = new Mastra({
	workflows: { weatherWorkflow }, // can be deleted later
	agents: { weatherAgent, yourAgent, deepwatchAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 30000, // 30 seconds
	},
});


