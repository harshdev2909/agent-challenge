import BigNumber from "bignumber.js";

// Example: Known flash loan contract addresses or method signatures (expand as needed)
const FLASH_LOAN_SIGNATURES = [
  "0x5cffe9d7", // Aave flashLoan
  "0x1b9a32e6", // DyDx flashLoan
  // Add more as needed
];

// Example: Known suspicious contract addresses (expand as needed)
const SUSPICIOUS_CONTRACTS: string | any[] = [
  // Add known scam/attack contract addresses here
];

interface WalletRisk {
  address: string;
  score: number;
  flags: string[];
}

/**
 * Analyze the top N wallet addresses that interacted with the contract.
 * @param transactions Array of contract transactions (from etherscan)
 * @param N Number of top wallets to analyze
 * @returns Array of wallet risk objects
 */
export async function analyzeWalletRisks(transactions: any[], N: number = 5): Promise<WalletRisk[]> {
  // Count transactions per wallet (exclude contract address itself)
  const walletCounts: Record<string, number> = {};
  const contractAddress = transactions[0]?.to?.toLowerCase();
  for (const tx of transactions) {
    const from = tx.from?.toLowerCase();
    if (from && from !== contractAddress) {
      walletCounts[from] = (walletCounts[from] || 0) + 1;
    }
  }
  // Get top N wallets by tx count
  const topWallets = Object.entries(walletCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, N)
    .map(([address]) => address);

  // Analyze each wallet
  const results: WalletRisk[] = [];
  for (const wallet of topWallets) {
    const walletTxs = transactions.filter(tx => tx.from?.toLowerCase() === wallet);
    let score = 0;
    const flags: string[] = [];

    // 1. High gas usage in short time (spamming)
    const gasSpikes = detectGasSpikes(walletTxs);
    if (gasSpikes) {
      score += 20;
      flags.push("Gas spike");
    }

    // 2. Flash loan interactions
    const flashLoan = detectFlashLoan(walletTxs);
    if (flashLoan) {
      score += 30;
      flags.push("Flash loan");
    }

    // 3. Interacted with suspicious contracts
    const suspicious = detectSuspiciousInteractions(walletTxs);
    if (suspicious) {
      score += 25;
      flags.push("Suspicious contract interaction");
    }

    results.push({ address: wallet, score, flags });
  }
  return results;
}

function detectGasSpikes(walletTxs: any[]): boolean {
  // Look for 3+ txs in < 5 minutes with high gas usage
  if (walletTxs.length < 3) return false;
  const sorted = walletTxs.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
  for (let i = 0; i < sorted.length - 2; i++) {
    const t0 = parseInt(sorted[i].timestamp);
    const t2 = parseInt(sorted[i + 2].timestamp);
    if (t2 - t0 < 300) { // 5 minutes
      const highGas = [sorted[i], sorted[i+1], sorted[i+2]].every(tx => {
        try {
          return BigNumber(tx.gas).multipliedBy(tx.gasPrice).isGreaterThan("100000000000000000"); // >0.1 ETH
        } catch {
          return false;
        }
      });
      if (highGas) return true;
    }
  }
  return false;
}

function detectFlashLoan(walletTxs: any[]): boolean {
  // Look for known flash loan method signatures in input data
  return walletTxs.some(tx => {
    if (!tx.input) return false;
    return FLASH_LOAN_SIGNATURES.some(sig => tx.input.startsWith(sig));
  });
}

function detectSuspiciousInteractions(walletTxs: any[]): boolean {
  // Check if any tx is to a known suspicious contract
  return walletTxs.some(tx => SUSPICIOUS_CONTRACTS.includes(tx.to?.toLowerCase()));
} 