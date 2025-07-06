import dotenv from "dotenv";
import { analyzeWalletRisks } from "./walletRisk";
dotenv.config();

interface ContractData {
  address: string;
  chain: string;
  transactions: any[];
  contractCode: string;
  tokenInfo?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  };
  verificationStatus: boolean | 'unknown';
  creationDate?: string;
  creator?: string;
}

interface RiskFinding {
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  recommendation: string;
}

interface RiskAnalysis {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  findings: RiskFinding[];
  summary: string;
  recommendations: string[];
  confidence: number;
  wallets?: Array<{
    address: string;
    score: number;
    flags: string[];
  }>;
  contractType: string;
}

export async function analyzeContractRisk(contractData: ContractData): Promise<RiskAnalysis> {
  const findings: RiskFinding[] = [];
  let riskScore = 0;

  // Check for unverified contract
  if (contractData.verificationStatus === false) {
    findings.push({
      type: "Unverified Contract",
      severity: "High",
      description: "Contract source code is not verified on the blockchain explorer",
      recommendation: "Avoid interacting with unverified contracts unless you trust the developer"
    });
    riskScore += 30;
  } else if (contractData.verificationStatus === 'unknown') {
    findings.push({
      type: "Verification Status Unknown",
      severity: "Medium",
      description: "Could not determine contract verification status due to API/network error or invalid API key.",
      recommendation: "Retry later or check your API key/network settings. Results may be incomplete."
    });
    riskScore += 10;
  }

  // Check for honeypot patterns
  const honeypotPatterns = detectHoneypotPatterns(contractData);
  findings.push(...honeypotPatterns);
  riskScore += honeypotPatterns.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 40;
      case "High": return score + 25;
      case "Medium": return score + 15;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Check for rug pull indicators
  const rugPullPatterns = detectRugPullPatterns(contractData);
  findings.push(...rugPullPatterns);
  riskScore += rugPullPatterns.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 35;
      case "High": return score + 20;
      case "Medium": return score + 12;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Check for suspicious transaction patterns
  const transactionPatterns = detectSuspiciousTransactions(contractData);
  findings.push(...transactionPatterns);
  riskScore += transactionPatterns.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 30;
      case "High": return score + 18;
      case "Medium": return score + 10;
      case "Low": return score + 3;
      default: return score;
    }
  }, 0);

  // Check for code vulnerabilities
  const codeVulnerabilities = detectCodeVulnerabilities(contractData);
  findings.push(...codeVulnerabilities);
  riskScore += codeVulnerabilities.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 35;
      case "High": return score + 20;
      case "Medium": return score + 12;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Add Minting Spike Detection
  const mintingSpikes = detectMintingSpikes(contractData);
  findings.push(...mintingSpikes);
  riskScore += mintingSpikes.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 40;
      case "High": return score + 25;
      case "Medium": return score + 15;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Add Owner Withdrawal Detection
  const ownerWithdrawals = detectOwnerWithdrawals(contractData);
  findings.push(...ownerWithdrawals);
  riskScore += ownerWithdrawals.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 40;
      case "High": return score + 25;
      case "Medium": return score + 15;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Add Proxy Pattern Detection
  const proxyPatterns = detectProxyPattern(contractData);
  findings.push(...proxyPatterns);
  riskScore += proxyPatterns.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 30;
      case "High": return score + 18;
      case "Medium": return score + 10;
      case "Low": return score + 3;
      default: return score;
    }
  }, 0);

  // Add Pausable/Freeze Detection
  const pausableFreeze = detectPausableFreeze(contractData);
  findings.push(...pausableFreeze);
  riskScore += pausableFreeze.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 30;
      case "High": return score + 18;
      case "Medium": return score + 10;
      case "Low": return score + 3;
      default: return score;
    }
  }, 0);

  // Add Mint-to-Burn Loop Detection
  const mintToBurn = detectMintToBurnLoop(contractData);
  findings.push(...mintToBurn);
  riskScore += mintToBurn.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 40;
      case "High": return score + 25;
      case "Medium": return score + 15;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Add Dangerous Owner-Only Methods Detection
  const dangerousOwner = detectDangerousOwnerMethods(contractData);
  findings.push(...dangerousOwner);
  riskScore += dangerousOwner.reduce((score, finding) => {
    switch (finding.severity) {
      case "Critical": return score + 40;
      case "High": return score + 25;
      case "Medium": return score + 15;
      case "Low": return score + 5;
      default: return score;
    }
  }, 0);

  // Wallet risk scoring (top 5 wallets)
  const wallets = await analyzeWalletRisks(contractData.transactions, 5);

  // Confidence score
  const confidence = calculateConfidence(contractData);

  // Determine risk level
  const riskLevel = determineRiskLevel(riskScore);

  // Generate summary and recommendations
  const summary = generateSummary(findings, riskLevel);
  const recommendations = generateRecommendations(findings);

  const contractType = detectContractType(contractData);

  return {
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    findings,
    summary,
    recommendations,
    confidence,
    wallets,
    contractType,
  };
}

function detectHoneypotPatterns(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];

  // Check for buy-only transactions (no sells)
  const buyTransactions = contractData.transactions.filter(tx => 
    tx.to.toLowerCase() === contractData.address.toLowerCase() && 
    tx.value !== "0"
  );
  const sellTransactions = contractData.transactions.filter(tx => 
    tx.from.toLowerCase() === contractData.address.toLowerCase() && 
    tx.value !== "0"
  );

  if (buyTransactions.length > 5 && sellTransactions.length === 0) {
    findings.push({
      type: "Honeypot Pattern",
      severity: "Critical",
      description: "Contract shows buy-only pattern with no sell transactions",
      recommendation: "This is a strong indicator of a honeypot contract. Do not invest."
    });
  }

  // Check for blacklisted functions
  if (contractData.contractCode.includes("blacklist") || 
      contractData.contractCode.includes("_blacklist") ||
      contractData.contractCode.includes("isBlacklisted")) {
    findings.push({
      type: "Blacklist Function",
      severity: "High",
      description: "Contract contains blacklist functionality that can prevent selling",
      recommendation: "Be cautious - contract owner can blacklist addresses to prevent selling"
    });
  }

  return findings;
}

function detectRugPullPatterns(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];

  // Check for high ownership concentration
  if (contractData.tokenInfo) {
    const totalSupply = BigInt(contractData.tokenInfo.totalSupply);
    const creatorBalance = contractData.transactions
      .filter(tx => tx.from.toLowerCase() === contractData.creator?.toLowerCase())
      .reduce((sum, tx) => sum + BigInt(tx.value || "0"), BigInt(0));
    
    const ownershipPercentage = Number((creatorBalance * BigInt(100)) / totalSupply);
    
    if (ownershipPercentage > 50) {
      findings.push({
        type: "High Ownership Concentration",
        severity: "High",
        description: `Contract creator owns ${ownershipPercentage.toFixed(2)}% of total supply`,
        recommendation: "High ownership concentration increases rug pull risk"
      });
    }
  }

  // Check for recent large transfers to creator
  const recentTransfersToCreator = contractData.transactions
    .filter(tx => 
      tx.to.toLowerCase() === contractData.creator?.toLowerCase() &&
      BigInt(tx.value) > BigInt("1000000000000000000") // > 1 ETH
    )
    .slice(0, 10);

  if (recentTransfersToCreator.length > 3) {
    findings.push({
      type: "Suspicious Transfers",
      severity: "Medium",
      description: "Multiple large transfers to contract creator detected",
      recommendation: "Monitor for unusual transfer patterns"
    });
  }

  return findings;
}

function detectSuspiciousTransactions(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];

  // Check for high gas fees
  const highGasTransactions = contractData.transactions.filter(tx => 
    BigInt(tx.gasPrice) * BigInt(tx.gas) > BigInt("100000000000000000") // > 0.1 ETH
  );

  if (highGasTransactions.length > 5) {
    findings.push({
      type: "High Gas Fees",
      severity: "Medium",
      description: "Multiple transactions with unusually high gas fees",
      recommendation: "High gas fees may indicate contract inefficiency or malicious intent"
    });
  }

  // Check for rapid trading patterns
  const recentTransactions = contractData.transactions.slice(0, 20);
  const timeSpan = recentTransactions.length > 1 ? 
    parseInt(recentTransactions[0].timestamp) - parseInt(recentTransactions[recentTransactions.length - 1].timestamp) : 0;
  
  if (recentTransactions.length > 10 && timeSpan < 3600) { // 10+ transactions in 1 hour
    findings.push({
      type: "Rapid Trading",
      severity: "Medium",
      description: "Unusually high transaction frequency detected",
      recommendation: "Rapid trading may indicate pump and dump or bot activity"
    });
  }

  return findings;
}

function detectCodeVulnerabilities(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (!contractData.contractCode) {
    return findings; // No code to analyze
  }

  const code = contractData.contractCode.toLowerCase();

  // Check for reentrancy vulnerabilities
  if (code.includes("call.value") || code.includes("transfer") || code.includes("send")) {
    if (!code.includes("reentrancyguard") && !code.includes("nonreentrant")) {
      findings.push({
        type: "Potential Reentrancy",
        severity: "High",
        description: "Contract uses low-level calls without reentrancy protection",
        recommendation: "Contract may be vulnerable to reentrancy attacks"
      });
    }
  }

  // Check for integer overflow/underflow
  if (code.includes("+") || code.includes("-") || code.includes("*") || code.includes("/")) {
    if (!code.includes("safemath") && !code.includes("@openzeppelin")) {
      findings.push({
        type: "No SafeMath",
        severity: "Medium",
        description: "Contract doesn't use SafeMath for arithmetic operations",
        recommendation: "Consider using SafeMath or Solidity 0.8+ for overflow protection"
      });
    }
  }

  // Check for unrestricted access to critical functions
  if (code.includes("function") && (code.includes("onlyowner") || code.includes("onlyowner"))) {
    findings.push({
      type: "Owner Privileges",
      severity: "Low",
      description: "Contract has owner-only functions",
      recommendation: "Verify owner privileges and ensure they're not excessive"
    });
  }

  return findings;
}

function determineRiskLevel(riskScore: number): "Low" | "Medium" | "High" | "Critical" {
  if (riskScore >= 80) return "Critical";
  if (riskScore >= 60) return "High";
  if (riskScore >= 30) return "Medium";
  return "Low";
}

function generateSummary(findings: RiskFinding[], riskLevel: string): string {
  const criticalCount = findings.filter(f => f.severity === "Critical").length;
  const highCount = findings.filter(f => f.severity === "High").length;
  
  if (criticalCount > 0) {
    return `CRITICAL RISK: ${criticalCount} critical and ${highCount} high severity issues detected. Avoid this contract.`;
  } else if (highCount > 0) {
    return `HIGH RISK: ${highCount} high severity issues detected. Exercise extreme caution.`;
  } else if (findings.length > 0) {
    return `MEDIUM RISK: ${findings.length} security issues detected. Proceed with caution.`;
  } else {
    return "LOW RISK: No significant security issues detected. Standard due diligence recommended.";
  }
}

function generateRecommendations(findings: RiskFinding[]): string[] {
  const recommendations: string[] = [];
  
  if (findings.some(f => f.type === "Honeypot Pattern")) {
    recommendations.push("DO NOT INVEST - This contract shows honeypot characteristics");
  }
  
  if (findings.some(f => f.type === "Unverified Contract")) {
    recommendations.push("Avoid unverified contracts unless you trust the developer");
  }
  
  if (findings.some(f => f.type === "High Ownership Concentration")) {
    recommendations.push("Monitor ownership distribution and beware of rug pull risks");
  }
  
  if (findings.some(f => f.type === "Potential Reentrancy")) {
    recommendations.push("Contract may be vulnerable to reentrancy attacks");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Perform standard due diligence before investing");
    recommendations.push("Monitor contract activity for unusual patterns");
  }
  
  return recommendations;
}

// Add Minting Spike Detection
function detectMintingSpikes(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const mintTxs = contractData.transactions.filter(tx =>
    tx.methodName && tx.methodName.toLowerCase().includes("mint")
  );
  if (mintTxs.length > 5) {
    findings.push({
      type: "Minting Spike",
      severity: "High",
      description: "High frequency of mint transactions detected in recent activity.",
      recommendation: "Investigate the reason for frequent minting; could indicate inflation risk or scam."
    });
  }
  return findings;
}

// Add Owner Withdrawal Detection
function detectOwnerWithdrawals(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  if (!contractData.creator) return findings;
  const creator = contractData.creator.toLowerCase();
  const withdrawals = contractData.transactions.filter(tx =>
    tx.from.toLowerCase() === contractData.address.toLowerCase() &&
    tx.to && tx.to.toLowerCase() === creator &&
    BigInt(tx.value) > BigInt("100000000000000000") // > 0.1 ETH
  );
  if (withdrawals.length > 0) {
    findings.push({
      type: "Owner Withdrawal",
      severity: "High",
      description: `Detected ${withdrawals.length} large withdrawals to contract creator in recent transactions`,
      recommendation: "Large owner withdrawals may indicate rug pull or malicious intent."
    });
  }
  return findings;
}

// Add Proxy Pattern Detection
function detectProxyPattern(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  if (!contractData.contractCode) return findings;
  const code = contractData.contractCode.toLowerCase();
  if (code.includes("delegatecall") || code.includes("implementation") || code.includes("proxyadmin")) {
    findings.push({
      type: "Proxy Pattern",
      severity: "Medium",
      description: "Contract contains proxy pattern code (delegatecall/implementation/proxyadmin)",
      recommendation: "Proxy contracts can be upgraded by the owner; verify upgradeability and admin controls."
    });
  }
  return findings;
}

// Add Pausable/Freeze Detection
function detectPausableFreeze(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  if (!contractData.contractCode) return findings;
  const code = contractData.contractCode.toLowerCase();
  if (code.includes("pausable") || code.includes("pause") || code.includes("frozen") || code.includes("freeze")) {
    findings.push({
      type: "Pausable/Freeze Function",
      severity: "Medium",
      description: "Contract contains pausable or freeze functionality",
      recommendation: "Owner can pause or freeze contract; check for abuse potential."
    });
  }
  return findings;
}

// Add Mint-to-Burn Loop Detection
function detectMintToBurnLoop(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  if (!contractData.contractCode) return findings;
  const code = contractData.contractCode.toLowerCase();
  if (code.includes("mint") && code.includes("burn")) {
    // Heuristic: look for both mint and burn, and recent txs with both
    const mintTxs = contractData.transactions.filter(tx => tx.methodName && tx.methodName.toLowerCase().includes("mint"));
    const burnTxs = contractData.transactions.filter(tx => tx.methodName && tx.methodName.toLowerCase().includes("burn"));
    if (mintTxs.length > 2 && burnTxs.length > 2) {
      findings.push({
        type: "Mint-to-Burn Loop",
        severity: "High",
        description: "Contract has frequent mint and burn transactions, which may be used to manipulate supply or price.",
        recommendation: "Review contract logic for potential supply manipulation or price control via mint/burn loops."
      });
    }
  }
  return findings;
}

function detectDangerousOwnerMethods(contractData: ContractData): RiskFinding[] {
  const findings: RiskFinding[] = [];
  if (!contractData.contractCode) return findings;
  const code = contractData.contractCode.toLowerCase();
  const dangerousMethods = ["withdrawall", "emergencywithdraw", "setbalance", "setowner", "transferownership", "mint", "burn", "pause", "blacklist", "freeze"];
  for (const method of dangerousMethods) {
    if (code.includes(method) && code.includes("onlyowner")) {
      findings.push({
        type: "Dangerous Owner-Only Method",
        severity: "High",
        description: `Contract contains owner-only method: ${method}`,
        recommendation: `Review the use of owner-only method '${method}' for potential abuse or rug pull risk.`
      });
    }
  }
  return findings;
}

// Enhanced Risk Scoring and Confidence
function calculateConfidence(contractData: ContractData): number {
  // Confidence is higher if we have more transactions and verified code
  let score = 50;
  if (contractData.transactions.length >= 20) score += 25;
  if (contractData.verificationStatus === true) score += 25;
  return Math.min(score, 100);
}

export function detectContractType(contractData: ContractData): string {
  if (!contractData.contractCode) return "Unknown";
  const code = contractData.contractCode.toLowerCase();
  if (code.includes("totalSupply".toLowerCase()) && code.includes("transfer".toLowerCase()) && code.includes("balanceOf".toLowerCase())) {
    return "ERC20";
  }
  if (code.includes("delegatecall") || code.includes("implementation") || code.includes("proxyadmin")) {
    return "Proxy";
  }
  if (code.includes("ownerOf") && code.includes("safeTransferFrom")) {
    return "ERC721";
  }
  return "Unknown";
} 