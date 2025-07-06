import axios from "axios";

const PINATA_API_KEY = 'acd50060c4e0a029ee95';
const PINATA_API_SECRET = '5d05341988ce35b37c07422efd29840d84516d252e0c824c9101db4cea231a7e';

export async function uploadToPinata(data: any, name = "deepwatch-audit.json") {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const body = {
    pinataMetadata: { name },
    pinataContent: data,
  };
  const headers = {
    "Content-Type": "application/json",
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_API_SECRET,
  };

  const response = await axios.post(url, body, { headers });
  // Returns { IpfsHash, PinSize, Timestamp }
  return response.data;
} 