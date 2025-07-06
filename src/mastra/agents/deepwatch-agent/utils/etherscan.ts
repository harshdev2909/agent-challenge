import dotenv from "dotenv";
dotenv.config();

interface ContractTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  timestamp: string;
  methodName?: string;
}

interface ContractData {
  address: string;
  chain: string;
  transactions: ContractTransaction[];
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

// V2 API base URL
const V2_API_BASE = "https://api.etherscan.io/v2/api";

// Map chain names to chain IDs for Etherscan V2
const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
};

// Use only the Etherscan API key for all chains
const API_KEY = process.env.ETHERSCAN_API_KEY || "";

// Utility to add timeout to fetch requests
async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 20000 } = options; // 20 seconds
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timed out (network/API slow or unresponsive)");
    }
    throw error;
  }
}

export type VerificationStatus = true | false | 'unknown';

export async function fetchContractData(contractAddress: string, chain: string = "ethereum"): Promise<ContractData> {
  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  try {
    console.log(`[DeepWatch] Fetching transactions for ${contractAddress} on chain ${chain}`);
    const transactions = await fetchContractTransactions(contractAddress, chainId);
    console.log(`[DeepWatch] Transactions fetched: ${transactions.length}`);

    console.log(`[DeepWatch] Fetching contract source code for ${contractAddress}`);
    const contractCode = await fetchContractSourceCode(contractAddress, chainId);
    console.log(`[DeepWatch] Contract source code fetched`);

    console.log(`[DeepWatch] Fetching token info for ${contractAddress}`);
    const tokenInfo = await fetchTokenInfo(contractAddress, chainId);
    console.log(`[DeepWatch] Token info fetched`);

    console.log(`[DeepWatch] Checking verification status for ${contractAddress}`);
    const verificationStatus = await checkVerificationStatus(contractAddress, chainId);
    console.log(`[DeepWatch] Verification status:`, verificationStatus);

    console.log(`[DeepWatch] Fetching contract creation info for ${contractAddress}`);
    const creationInfo = await fetchContractCreation(contractAddress, chainId);
    console.log(`[DeepWatch] Contract creation info fetched`);

    return {
      address: contractAddress,
      chain,
      transactions,
      contractCode,
      tokenInfo,
      verificationStatus,
      creationDate: creationInfo?.creationDate,
      creator: creationInfo?.creator,
    };
  } catch (error) {
    throw new Error(`Failed to fetch contract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchContractTransactions(contractAddress: string, chainId: number): Promise<ContractTransaction[]> {
  const url = `${V2_API_BASE}?chainid=${chainId}&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (data.status !== "1") {
      throw new Error(`API Error: ${data.message}`);
    }
    // Reduce to 10 transactions for performance (wallet risk analysis)
    return data.result.slice(0, 10).map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      timestamp: tx.timeStamp,
      methodName: tx.methodName || undefined,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch contract transactions: ${(error as Error).message}`);
  }
}

async function fetchContractSourceCode(contractAddress: string, chainId: number): Promise<string> {
  const url = `${V2_API_BASE}?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${API_KEY}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (data.status !== "1") {
      throw new Error(`API Error: ${data.message}`);
    }
    return data.result[0]?.SourceCode || "";
  } catch (error) {
    throw new Error(`Failed to fetch contract source code: ${(error as Error).message}`);
  }
}

async function fetchTokenInfo(contractAddress: string, chainId: number): Promise<any> {
  const url = `${V2_API_BASE}?chainid=${chainId}&module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${API_KEY}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (data.status === "1" && data.result.length > 0) {
      const token = data.result[0];
      return {
        name: token.tokenName,
        symbol: token.tokenSymbol,
        decimals: parseInt(token.tokenDecimal),
        totalSupply: token.totalSupply,
      };
    }
  } catch (error) {
    // Token info not available, return undefined
  }
  return undefined;
}

async function checkVerificationStatus(contractAddress: string, chainId: number): Promise<VerificationStatus> {
  const url = `${V2_API_BASE}?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${API_KEY}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    console.log('[DeepWatch] Etherscan V2 verification API response:', JSON.stringify(data));
    if (data.status !== "1") {
      console.warn(`[DeepWatch] V2 Verification API returned non-1 status for ${contractAddress}:`, data.message);
      return 'unknown';
    }
    return data.result[0]?.SourceCode !== "";
  } catch (error) {
    console.error(`[DeepWatch] Error checking V2 verification status for ${contractAddress}:`, error);
    return 'unknown';
  }
}

async function fetchContractCreation(contractAddress: string, chainId: number): Promise<{ creationDate?: string; creator?: string }> {
  try {
    const url = `${V2_API_BASE}?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${API_KEY}`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (data.status === "1" && data.result.length > 0) {
      const creation = data.result[0];
      return {
        creationDate: creation.contractCreator,
        creator: creation.contractCreator,
      };
    }
  } catch (error) {
    // Creation info not available
  }
  return {};
} 