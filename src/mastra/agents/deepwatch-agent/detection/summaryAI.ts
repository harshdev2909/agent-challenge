import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_API_KEY = "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"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_API_KEY = "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"
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OLLAMA_API_URL = process.env.OLLAMA_API_URL; // e.g., http://localhost:11434/api/generate

function fetchWithTimeout(resource: string, options: any = {}, timeout = 15000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("LLM request timed out")), timeout))
  ]);
}

export async function summarizeAuditReport(auditJson: any): Promise<string> {
  // Reduce prompt size: only send top 5 findings and summary
  const minimalAudit = {
    contractAddress: auditJson.contractAddress,
    riskLevel: auditJson.riskLevel,
    riskScore: auditJson.riskScore,
    findings: Array.isArray(auditJson.findings) ? auditJson.findings.slice(0, 5) : [],
    summary: auditJson.summary,
    recommendations: Array.isArray(auditJson.recommendations) ? auditJson.recommendations.slice(0, 3) : [],
    contractType: auditJson.contractType,
  };
  const prompt = `Summarize this audit report for a non-technical user:\n${JSON.stringify(minimalAudit, null, 2)}`;

  // Prefer OpenRouter if available
  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetchWithTimeout(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1",
          messages: [
            { role: "system", content: "You are an expert smart contract auditor and technical writer." },
            { role: "user", content: prompt }
          ],
          max_tokens: 512
        })
      }, 15000);
      const data = await response.json();
      console.log("[DeepWatch] OpenRouter API response:", JSON.stringify(data));
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content.trim();
      }
      if (data.error) {
        return `AI summary unavailable: ${data.error.message || JSON.stringify(data.error)}`;
      }
      return `AI summary unavailable: Unexpected response from OpenRouter API: ${JSON.stringify(data)}`;
    } catch (error) {
      return `AI summary unavailable: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // Next, try local LLM (Ollama)
  if (OLLAMA_API_URL) {
    try {
      const response = await fetchWithTimeout(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama2",
          prompt,
          stream: false
        })
      }, 15000);
      const data = await response.json();
      return data.response?.trim() || "Local LLM summary unavailable: Unexpected response.";
    } catch (error) {
      return `Local LLM summary unavailable: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // Fallback to OpenAI if available
  if (OPENAI_API_KEY) {
    try {
      const response = await fetchWithTimeout(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an expert smart contract auditor and technical writer." },
            { role: "user", content: prompt }
          ],
          max_tokens: 256,
          temperature: 0.7
        })
      }, 15000);
      const data = await response.json();
      console.log("[DeepWatch] OpenAI API response:", JSON.stringify(data));
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content.trim();
      }
      if (data.error) {
        return `AI summary unavailable: ${data.error.message || JSON.stringify(data.error)}`;
      }
      return `AI summary unavailable: Unexpected response from OpenAI API: ${JSON.stringify(data)}`;
    } catch (error) {
      return `AI summary unavailable: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // If none are available
  return "AI summary unavailable: No LLM endpoint or API key configured.";
} 