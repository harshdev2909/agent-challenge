import dotenv from "dotenv";
dotenv.config();

interface AIConfig {
  provider: "openai" | "claude" | "openrouter";
  apiKey: string;
  model: string;
}

interface ContractAnalysisRequest {
  contractAddress: string;
  contractCode: string;
  transactions: any[];
  tokenInfo?: any;
  findings: any[];
}

interface AIAnalysisResult {
  enhancedFindings: string[];
  riskAssessment: string;
  codeReview: string;
  recommendations: string[];
}

export class AIContractAnalyzer {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async analyzeContract(request: ContractAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(request);
      const response = await this.queryAI(prompt);
      
      return this.parseAIResponse(response);
    } catch (error) {
      console.error("AI analysis failed:", error);
      return {
        enhancedFindings: [],
        riskAssessment: "AI analysis unavailable",
        codeReview: "AI analysis unavailable",
        recommendations: ["Fallback to manual analysis recommended"]
      };
    }
  }

  private buildAnalysisPrompt(request: ContractAnalysisRequest): string {
    return `
You are an expert smart contract security auditor. Analyze the following contract data and provide detailed security insights.

Contract Address: ${request.contractAddress}
Token Info: ${JSON.stringify(request.tokenInfo, null, 2)}
Number of Transactions: ${request.transactions.length}
Initial Findings: ${JSON.stringify(request.findings, null, 2)}

Contract Source Code:
\`\`\`solidity
${request.contractCode.substring(0, 5000)} // Truncated for brevity
\`\`\`

Recent Transactions (first 10):
${request.transactions.slice(0, 10).map(tx => 
  `- ${tx.hash}: ${tx.from} -> ${tx.to} (${tx.value} wei)`
).join('\n')}

Please provide:
1. Enhanced security findings beyond basic heuristics
2. Detailed risk assessment with specific vulnerabilities
3. Code review highlighting potential issues
4. Actionable recommendations for users

Format your response as JSON:
{
  "enhancedFindings": ["finding1", "finding2"],
  "riskAssessment": "detailed risk analysis",
  "codeReview": "code-specific issues",
  "recommendations": ["rec1", "rec2"]
}
`;
  }

  private async queryAI(prompt: string): Promise<string> {
    if (this.config.provider === "openrouter") {
      return await this.queryOpenRouter(prompt);
    } else if (this.config.provider === "openai") {
      return await this.queryOpenAI(prompt);
    } else {
      return await this.queryClaude(prompt);
    }
  }

  private async queryOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model || "openai/gpt-4.1",
        messages: [
          { role: "system", content: "You are an expert smart contract security auditor. Provide detailed, accurate analysis in JSON format." },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  private async queryOpenAI(prompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "You are an expert smart contract security auditor. Provide detailed, accurate analysis in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  private async queryClaude(prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "";
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          enhancedFindings: parsed.enhancedFindings || [],
          riskAssessment: parsed.riskAssessment || "No risk assessment provided",
          codeReview: parsed.codeReview || "No code review provided",
          recommendations: parsed.recommendations || []
        };
      }
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);
    }

    // Fallback: return raw response
    return {
      enhancedFindings: [],
      riskAssessment: response,
      codeReview: "Raw AI response",
      recommendations: ["Review the raw AI analysis above"]
    };
  }
}

// Utility function to create AI analyzer with environment variables
export function createAIAnalyzer(): AIContractAnalyzer | null {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.CLAUDE_API_KEY;

  if (openrouterKey) {
    return new AIContractAnalyzer({
      provider: "openrouter",
      apiKey: openrouterKey,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4.1"
    });
  } else if (openaiKey) {
    return new AIContractAnalyzer({
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4"
    });
  } else if (claudeKey) {
    return new AIContractAnalyzer({
      provider: "claude",
      apiKey: claudeKey,
      model: process.env.CLAUDE_MODEL || "claude-3-sonnet-20240229"
    });
  }

  return null; // No AI provider configured
} 