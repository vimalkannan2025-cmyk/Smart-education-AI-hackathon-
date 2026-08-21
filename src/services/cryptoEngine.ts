/**
 * Cryptographic Engine for Decentralized Academic Verifiable Credentials
 * Uses Web Crypto API for SHA-256 hashing, Merkle calculations, and tamper detection.
 */

// Canonicalize JSON to guarantee deterministic cryptographic hashing
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `"${k}":${canonicalizeJson(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}

// Compute SHA-256 Hash of string
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compute Merkle Root from an array of leaf hashes
export async function computeMerkleRoot(leafHashes: string[]): Promise<string> {
  if (leafHashes.length === 0) {
    return await sha256Hex('EMPTY_TREE');
  }
  if (leafHashes.length === 1) {
    return leafHashes[0];
  }

  let currentLevel = [...leafHashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = currentLevel[i] + currentLevel[i + 1];
        const parentHash = await sha256Hex(combined);
        nextLevel.push(parentHash);
      } else {
        // Odd number of leaves, hash with itself
        const combined = currentLevel[i] + currentLevel[i];
        const parentHash = await sha256Hex(combined);
        nextLevel.push(parentHash);
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

// Compute the canonical Document Hash of a credential without its proof signature
export async function computeCredentialPayloadHash(credential: {
  id: string;
  type: string;
  title: string;
  issuanceDate: string;
  issuer: { id: string; did: string; name: string };
  subject: { did: string; rollNumber: string; enrollmentNumber: string; fullName: string };
  data: any;
}): Promise<string> {
  const cleanPayload = {
    id: credential.id,
    type: credential.type,
    title: credential.title,
    issuanceDate: credential.issuanceDate,
    issuer: {
      id: credential.issuer.id,
      did: credential.issuer.did,
      name: credential.issuer.name,
    },
    subject: {
      did: credential.subject.did,
      rollNumber: credential.subject.rollNumber,
      enrollmentNumber: credential.subject.enrollmentNumber,
      fullName: credential.subject.fullName,
    },
    data: credential.data,
  };
  const canonicalStr = canonicalizeJson(cleanPayload);
  return await sha256Hex(canonicalStr);
}

// Generate a deterministic simulated cryptographic signature from document hash and private key
export async function signDocumentHash(
  docHash: string,
  privateKeySeed: string
): Promise<string> {
  const combined = `SIG_V1:${docHash}:${privateKeySeed}:ACAD_LEDGER_2026`;
  const signatureHex = await sha256Hex(combined);
  // Extend to 128 chars to mimic 512-bit Ed25519 signature
  const suffix = await sha256Hex(signatureHex + ':SUFFIX');
  return `0x${signatureHex}${suffix.slice(0, 64)}`;
}

// Verify signature against public key
export async function verifyDocumentSignature(
  docHash: string,
  signature: string,
  expectedPublicKeySeed: string
): Promise<boolean> {
  const expectedSig = await signDocumentHash(docHash, expectedPublicKeySeed);
  return expectedSig.toLowerCase() === signature.toLowerCase();
}

// Deep field comparator to identify what fields were altered in tampered credentials
export function findModifiedFields(original: any, modified: any, path: string = ''): string[] {
  const differences: string[] = [];

  if (typeof original !== typeof modified) {
    differences.push(path || 'root');
    return differences;
  }

  if (typeof original !== 'object' || original === null || modified === null) {
    if (original !== modified) {
      differences.push(`${path} (original: "${original}" → modified: "${modified}")`);
    }
    return differences;
  }

  const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(modified)]));
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!(key in original)) {
      differences.push(`Added field ${currentPath}`);
    } else if (!(key in modified)) {
      differences.push(`Removed field ${currentPath}`);
    } else {
      const nestedDiffs = findModifiedFields(original[key], modified[key], currentPath);
      differences.push(...nestedDiffs);
    }
  }

  return differences;
}

// Generate realistic Ethereum / Ledger Tx Hash
export function generateTxHash(): string {
  const hexChars = '0123456789abcdef';
  let tx = '0x';
  for (let i = 0; i < 64; i++) {
    tx += hexChars[Math.floor(Math.random() * hexChars.length)];
  }
  return tx;
}

// Generate a random UUID
export function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'urn:uuid:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
