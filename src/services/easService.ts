import { EAS, SchemaEncoder, Offchain } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

// Base Sepolia EAS Contract Address
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021"; 

// A 32-byte dummy schema UID for off-chain attestations 
const DEMO_SCHEMA_UID = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Derives a valid ethers.Wallet from a deterministic string (e.g., University DID)
 * This allows us to use ephemeral wallets that represent our mock universities without needing real private keys.
 */
export function getWalletFromId(id: string): ethers.Wallet {
    const hash = ethers.id(id);
    return new ethers.Wallet(hash);
}

/**
 * Creates an Off-chain EAS Attestation signed by the University's ephemeral wallet.
 */
export async function createOffchainAttestation(
    documentHashHex: string,
    credentialType: string,
    studentDid: string,
    issuerDid: string
) {
    // 1. Setup EAS offchain object
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    
    // Connect to a public RPC to fetch the EIP-712 domain separator (chainId, etc)
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    eas.connect(provider);
    
    const offchain = await eas.getOffchain();

    // 2. Encode the schema data
    const schemaEncoder = new SchemaEncoder("bytes32 documentHash, string credentialType");
    
    // Ensure 0x prefix and exact 32 bytes (64 hex chars + 2 for '0x')
    let docHashBytes32 = documentHashHex.startsWith('0x') ? documentHashHex : '0x' + documentHashHex;
    // Pad to 32 bytes if necessary
    if (docHashBytes32.length < 66) {
        docHashBytes32 = docHashBytes32.padEnd(66, '0');
    } else if (docHashBytes32.length > 66) {
        docHashBytes32 = docHashBytes32.substring(0, 66);
    }
    
    const encodedData = schemaEncoder.encodeData([
        { name: "documentHash", value: docHashBytes32, type: "bytes32" },
        { name: "credentialType", value: credentialType, type: "string" }
    ]);

    // 3. Sign with the issuer's wallet
    const signer = getWalletFromId(issuerDid);
    const studentWallet = getWalletFromId(studentDid);

    const attestation = await offchain.signOffchainAttestation({
        recipient: studentWallet.address,
        expirationTime: 0n,
        time: BigInt(Math.floor(Date.now() / 1000)),
        revocable: true,
        version: 1,
        nonce: 0n,
        schema: DEMO_SCHEMA_UID,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData
    }, signer);

    return {
        attestation,
        signerAddress: signer.address,
        recipientAddress: studentWallet.address
    };
}

/**
 * Verifies an Off-chain EAS Attestation mathematically (verifying EIP-712 signature).
 */
export async function verifyOffchainAttestation(
    attestation: any,
    issuerDid: string
): Promise<boolean> {
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    eas.connect(provider);
    
    const offchain = await eas.getOffchain();
    const expectedSigner = getWalletFromId(issuerDid).address;

    try {
        const isValid = offchain.verifyOffchainAttestationSignature(
            expectedSigner,
            attestation
        );
        return isValid;
    } catch (e) {
        console.error("EAS signature verification failed", e);
        return false;
    }
}
