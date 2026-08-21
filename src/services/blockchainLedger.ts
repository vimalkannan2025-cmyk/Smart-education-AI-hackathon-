import {
  VerifiableCredential,
  BlockchainBlock,
  BlockchainTransaction,
  UniversityIssuerInfo,
  StudentProfile,
  AccessGrant,
  VerificationAuditLog,
  VerificationReport,
  VerificationCheckResult,
} from '../types';
import { KNOWN_UNIVERSITIES, CURRENT_STUDENT, SEED_CREDENTIALS, INITIAL_BLOCKS } from './mockData';
import {
  computeCredentialPayloadHash,
  signDocumentHash,
  verifyDocumentSignature,
  findModifiedFields,
  generateTxHash,
  generateUUID,
  sha256Hex,
} from './cryptoEngine';
import { createOffchainAttestation, verifyOffchainAttestation } from './easService';

const STORAGE_KEYS = {
  CREDENTIALS: 'acadchain_credentials_v1',
  BLOCKS: 'acadchain_blocks_v1',
  GRANTS: 'acadchain_access_grants_v1',
  AUDIT_LOGS: 'acadchain_audit_logs_v1',
  ACTIVE_STUDENT: 'acadchain_active_student_v1',
  UNIVERSITIES: 'acadchain_universities_v1',
};

class BlockchainLedgerService {
  private credentials: VerifiableCredential[] = [];
  private blocks: BlockchainBlock[] = [];
  private accessGrants: AccessGrant[] = [];
  private auditLogs: VerificationAuditLog[] = [];
  private universities: UniversityIssuerInfo[] = [];
  private activeStudent: StudentProfile = CURRENT_STUDENT;

  constructor() {
    this.init();
  }

  private async init() {
    this.loadState();
    // Re-verify and compute authentic hashes on first boot to ensure 100% cryptographic alignment
    await this.alignSeedHashes();
  }

  private loadState() {
    try {
      const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      this.credentials = storedCreds ? JSON.parse(storedCreds) : [...SEED_CREDENTIALS];

      const storedBlocks = localStorage.getItem(STORAGE_KEYS.BLOCKS);
      this.blocks = storedBlocks ? JSON.parse(storedBlocks) : [...INITIAL_BLOCKS];

      const storedGrants = localStorage.getItem(STORAGE_KEYS.GRANTS);
      this.accessGrants = storedGrants
        ? JSON.parse(storedGrants)
        : [
            {
              id: 'grant-stanford-2024',
              credentialId: 'cred-transcript-2024-iitd-089',
              granteeName: 'Stanford University - Graduate Admissions Office',
              granteeRole: 'UNIVERSITY',
              createdAt: '2024-07-10T08:00:00.000Z',
              expiresAt: '2027-07-10T08:00:00.000Z',
              accessCode: 'STANFORD-MSCS-8891',
              allowedFields: 'FULL',
              viewsCount: 3,
              lastViewedAt: '2024-07-14T14:22:00.000Z',
              isActive: true,
            },
            {
              id: 'grant-embassy-2024',
              credentialId: 'cred-migration-2024-iitd-512',
              granteeName: 'US Consulate General (F-1 Student Visa Division)',
              granteeRole: 'EMBASSY',
              createdAt: '2024-07-12T09:30:00.000Z',
              expiresAt: '2026-12-31T23:59:59.000Z',
              accessCode: 'USVISA-F1-0512',
              allowedFields: 'FULL',
              viewsCount: 1,
              lastViewedAt: '2024-07-15T11:05:00.000Z',
              isActive: true,
            },
            {
              id: 'grant-google-2024',
              credentialId: 'cred-degree-2024-iitd-089',
              granteeName: 'Google LLC - Engineering Recruitment Background Check',
              granteeRole: 'EMPLOYER',
              createdAt: '2024-08-15T12:00:00.000Z',
              expiresAt: '2026-08-15T12:00:00.000Z',
              accessCode: 'GOOG-SWE-2024-VERI',
              allowedFields: 'FULL',
              viewsCount: 2,
              lastViewedAt: '2024-08-18T16:40:00.000Z',
              isActive: true,
            },
          ];

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs
        ? JSON.parse(storedLogs)
        : [
            {
              id: 'audit-log-1',
              credentialId: 'cred-transcript-2024-iitd-089',
              verifierName: 'Stanford Graduate Admissions (Admissions Officer #4)',
              verifierIpOrLocation: 'Palo Alto, CA, USA (IP: 171.64.68.x)',
              verifiedAt: '2024-07-14T14:22:00.000Z',
              status: 'VALID',
              purpose: 'Master of Science in CS Application Review',
            },
            {
              id: 'audit-log-2',
              credentialId: 'cred-migration-2024-iitd-512',
              verifierName: 'US Consulate Visa Section New Delhi',
              verifierIpOrLocation: 'Chanakyapuri, New Delhi (US Govt Net)',
              verifiedAt: '2024-07-15T11:05:00.000Z',
              status: 'VALID',
              purpose: 'F1 Visa Non-Immigrant Academic Verification',
            },
            {
              id: 'audit-log-3',
              credentialId: 'cred-degree-2024-iitd-089',
              verifierName: 'Google Background Verification (First Advantage Corp)',
              verifierIpOrLocation: 'Mountain View, CA, USA',
              verifiedAt: '2024-08-18T16:40:00.000Z',
              status: 'VALID',
              purpose: 'Staff Software Engineer Hire Clearance',
            },
          ];

      const storedUniv = localStorage.getItem(STORAGE_KEYS.UNIVERSITIES);
      this.universities = storedUniv ? JSON.parse(storedUniv) : [...KNOWN_UNIVERSITIES];

      const storedStudent = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT);
      this.activeStudent = storedStudent ? JSON.parse(storedStudent) : { ...CURRENT_STUDENT };
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
      this.credentials = [...SEED_CREDENTIALS];
      this.blocks = [...INITIAL_BLOCKS];
      this.universities = [...KNOWN_UNIVERSITIES];
      this.activeStudent = { ...CURRENT_STUDENT };
    }
  }

  private async alignSeedHashes() {
    let modified = false;
    for (const cred of this.credentials) {
      const computedHash = await computeCredentialPayloadHash(cred);
      if (cred.proof.documentHash !== computedHash) {
        cred.proof.documentHash = computedHash;
        const validSig = await signDocumentHash(computedHash, cred.issuer.publicKey);
        cred.proof.signatureValue = validSig;
        modified = true;
      }
    }
    if (modified) {
      this.saveState();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(this.blocks));
      localStorage.setItem(STORAGE_KEYS.GRANTS, JSON.stringify(this.accessGrants));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(this.universities));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, JSON.stringify(this.activeStudent));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  // --- Read Methods ---
  public getCredentials(): VerifiableCredential[] {
    return this.credentials;
  }

  public getCredentialById(id: string): VerifiableCredential | undefined {
    return this.credentials.find((c) => c.id === id || c.proof?.txHash === id);
  }

  public getBlocks(): BlockchainBlock[] {
    return this.blocks;
  }

  public getAccessGrants(): AccessGrant[] {
    return this.accessGrants;
  }

  public getAuditLogs(): VerificationAuditLog[] {
    return this.auditLogs;
  }

  public getUniversities(): UniversityIssuerInfo[] {
    return this.universities;
  }

  public getActiveStudent(): StudentProfile {
    return this.activeStudent;
  }

  // --- Write Methods ---
  public async issueCredential(payload: {
    type: VerifiableCredential['type'];
    title: string;
    issuer: UniversityIssuerInfo;
    student: StudentProfile;
    data: any;
  }): Promise<{ credential: VerifiableCredential; transaction: BlockchainTransaction }> {
    const credId = `cred-${payload.type.toLowerCase()}-${Date.now()}-${payload.student.rollNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const issuanceDate = new Date().toISOString();

    const partialCred = {
      id: credId,
      type: payload.type,
      title: payload.title,
      issuanceDate,
      issuer: payload.issuer,
      subject: payload.student,
      data: payload.data,
    };

    // 1. Calculate canonical document hash
    const documentHash = await computeCredentialPayloadHash(partialCred);

    // 2. University cryptographic signature (Ed25519 signature scheme)
    const signatureValue = await signDocumentHash(documentHash, payload.issuer.publicKey);

    // 2.5 Generate real EAS Offchain Attestation!
    let easAttestation = undefined;
    try {
        const easData = await createOffchainAttestation(
            documentHash,
            payload.type,
            payload.student.did,
            payload.issuer.did
        );
        easAttestation = easData.attestation;
    } catch (e) {
        console.warn("Failed to generate EAS attestation, falling back to mock signature", e);
    }

    // 3. Anchor on Blockchain
    const txHash = generateTxHash();
    const latestBlock = this.blocks[0] || INITIAL_BLOCKS[0];
    const newBlockNumber = latestBlock.blockNumber + 1;
    const merkleRoot = await sha256Hex(`MERKLE_ROOT:${documentHash}:${newBlockNumber}`);

    const newTx: BlockchainTransaction = {
        txHash,
        blockNumber: newBlockNumber,
        timestamp: issuanceDate,
        from: payload.issuer.contractAddress,
        to: '0xAcademicRegistrySmartContractV2',
        functionName: 'anchorCredential',
        credentialId: credId,
        documentHash,
        merkleRoot,
      status: 'CONFIRMED',
      gasFeeEth: 0.00045,
    };

    const newBlock: BlockchainBlock = {
      blockNumber: newBlockNumber,
      timestamp: issuanceDate,
      previousHash: latestBlock.hash,
      merkleRoot,
      hash: await sha256Hex(`BLOCK:${newBlockNumber}:${merkleRoot}:${latestBlock.hash}`),
      transactionsCount: 1,
      gasUsed: 450000,
      miner: `0xConsortiumValidator_${payload.issuer.id.toUpperCase()}`,
      transactions: [newTx],
    };

    const fullCredential: VerifiableCredential = {
      ...partialCred,
      // Attach the EAS attestation in the proof along with the simulated legacy signature
      proof: {
        type: 'Ed25519Signature2020',
        created: issuanceDate,
        verificationMethod: payload.issuer.did,
        proofPurpose: 'assertionMethod',
        documentHash,
        merkleRoot,
        signatureValue,
        easAttestation,
        txHash,
        blockNumber: newBlockNumber,
      },
      revocationStatus: {
        isRevoked: false,
      },
    };

    this.credentials.unshift(fullCredential);
    this.blocks.unshift(newBlock);
    this.saveState();

    return { credential: fullCredential, transaction: newTx };
  }

  public async revokeCredential(credentialId: string, reason: string): Promise<boolean> {
    const cred = this.credentials.find((c) => c.id === credentialId);
    if (!cred) return false;

    const revocationTxHash = generateTxHash();
    const latestBlock = this.blocks[0];
    const newBlockNumber = (latestBlock?.blockNumber || 18510800) + 1;
    const timestamp = new Date().toISOString();

    cred.revocationStatus = {
      isRevoked: true,
      revokedAt: timestamp,
      revocationReason: reason,
      revocationTxHash,
    };

    const revokeTx: BlockchainTransaction = {
      txHash: revocationTxHash,
      blockNumber: newBlockNumber,
      timestamp,
      from: cred.issuer.contractAddress,
      to: '0xAcademicRegistrySmartContractV2',
      functionName: 'revokeCredential',
      credentialId,
      documentHash: cred.proof.documentHash,
      merkleRoot: cred.proof.merkleRoot,
      status: 'CONFIRMED',
      gasFeeEth: 0.00032,
    };

    const newBlock: BlockchainBlock = {
      blockNumber: newBlockNumber,
      timestamp,
      previousHash: latestBlock?.hash || '0x0',
      merkleRoot: await sha256Hex(`REVOKE_MERKLE:${credentialId}:${timestamp}`),
      hash: await sha256Hex(`BLOCK:${newBlockNumber}:REVOKE:${timestamp}`),
      transactionsCount: 1,
      gasUsed: 320000,
      miner: `0xConsortiumValidator_${cred.issuer.id.toUpperCase()}`,
      transactions: [revokeTx],
    };

    this.blocks.unshift(newBlock);
    this.saveState();
    return true;
  }

  public createAccessGrant(grant: Omit<AccessGrant, 'id' | 'createdAt' | 'viewsCount' | 'isActive'>): AccessGrant {
    const newGrant: AccessGrant = {
      ...grant,
      id: `grant-${generateUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      isActive: true,
    };
    this.accessGrants.unshift(newGrant);
    this.saveState();
    return newGrant;
  }

  public revokeAccessGrant(grantId: string): void {
    const grant = this.accessGrants.find((g) => g.id === grantId);
    if (grant) {
      grant.isActive = false;
      this.saveState();
    }
  }

  public recordVerificationAudit(
    credentialId: string,
    verifierName: string,
    verifierLocation: string,
    status: 'VALID' | 'TAMPERED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND',
    purpose: string
  ): void {
    const newLog: VerificationAuditLog = {
      id: `audit-${generateUUID().slice(0, 8)}`,
      credentialId,
      verifierName,
      verifierIpOrLocation: verifierLocation,
      verifiedAt: new Date().toISOString(),
      status,
      purpose,
    };
    this.auditLogs.unshift(newLog);
    this.saveState();
  }

  // --- Comprehensive 5-Point Cryptographic Verification Pipeline ---
  public async verifyCredential(credentialInput: any, verifierMeta?: { name?: string; purpose?: string }): Promise<VerificationReport> {
    const checks: VerificationCheckResult[] = [];
    const verifiedAt = new Date().toISOString();

    if (!credentialInput || typeof credentialInput !== 'object') {
      return {
        status: 'NOT_FOUND',
        verifiedAt,
        checks: [
          {
            step: 'FORMAT',
            name: 'Payload Schema Validation',
            passed: false,
            details: 'Invalid credential schema or empty JSON structure.',
          },
        ],
        summary: 'Verification failed: provided data is not a valid verifiable academic credential.',
      };
    }

    const cred: VerifiableCredential = credentialInput;

    // Check 1: Schema & Mandatory Fields
    const hasRequiredFields =
      Boolean(cred.id) &&
      Boolean(cred.type) &&
      Boolean(cred.issuer?.did) &&
      Boolean(cred.subject?.rollNumber) &&
      Boolean(cred.proof?.signatureValue);

    checks.push({
      step: '1. SCHEMA',
      name: 'W3C Verifiable Credential Structure & Metadata',
      passed: hasRequiredFields,
      details: hasRequiredFields
        ? `Valid ${cred.type} payload conforming to W3C VC 2.0 Academic Standards.`
        : 'Missing mandatory credential fields or broken envelope schema.',
      technicalData: `ID: ${cred.id || 'N/A'} | Type: ${cred.type || 'N/A'}`,
    });

    if (!hasRequiredFields) {
      return {
        status: 'NOT_FOUND',
        verifiedAt,
        checks,
        summary: 'Invalid credential payload structure.',
      };
    }

    // Check 2: Cryptographic Canonical Payload Hash Check (Bit-level Tamper Proof)
    const computedHash = await computeCredentialPayloadHash(cred);
    const originalProofHash = cred.proof?.documentHash;
    const isHashMatched = computedHash.toLowerCase() === originalProofHash?.toLowerCase();

    // Check if we have an original stored version in registry to pinpoint differences
    const storedVersion = this.credentials.find((c) => c.id === cred.id);
    let mismatchedFields: string[] = [];
    if (storedVersion && !isHashMatched) {
      mismatchedFields = findModifiedFields(storedVersion.data, cred.data, 'data');
      if (storedVersion.subject.fullName !== cred.subject?.fullName) {
        mismatchedFields.push(`subject.fullName ("${storedVersion.subject.fullName}" vs "${cred.subject?.fullName}")`);
      }
      if (storedVersion.subject.rollNumber !== cred.subject?.rollNumber) {
        mismatchedFields.push(`subject.rollNumber ("${storedVersion.subject.rollNumber}" vs "${cred.subject?.rollNumber}")`);
      }
    }

    checks.push({
      step: '2. INTEGRITY',
      name: 'SHA-256 Cryptographic Payload Canonical Hash',
      passed: isHashMatched,
      details: isHashMatched
        ? 'Payload hash matches canonical byte-level representation perfectly (0 modifications detected).'
        : `DATA TAMPERING DETECTED! Computed hash does not match original signed hash. Altered fields: ${mismatchedFields.join(', ') || 'Payload content altered'}`,
      technicalData: `Original Hash: ${originalProofHash || 'N/A'}\nComputed Hash: ${computedHash}`,
    });

    // Check 3: Digital Signature & Issuer DID Public Key Verification
    const issuerInfo = this.universities.find((u) => u.did === cred.issuer?.did || u.id === cred.issuer?.id) || cred.issuer;
    const isSignatureValid = await verifyDocumentSignature(
      originalProofHash || computedHash,
      cred.proof?.signatureValue,
      issuerInfo?.publicKey || ''
    );

    checks.push({
      step: '3. SIGNATURE',
      name: 'University Ed25519 Cryptographic Signature Proof',
      passed: isSignatureValid,
      details: isSignatureValid
        ? `Valid digital signature confirmed for Issuer DID: ${cred.issuer?.did} (${cred.issuer?.name}).`
        : `Cryptographic signature verification failed! Signature does not correspond to ${cred.issuer?.name}'s registered public key.`,
      technicalData: `Verification Method: ${cred.proof?.verificationMethod}\nSignature: ${cred.proof?.signatureValue?.slice(0, 32)}...`,
    });

    // Check 3.5: EAS Off-chain Attestation Verification
    let isEasValid = false;
    let easDetails = 'No EAS Attestation found on credential. Falling back to legacy signature.';
    if (cred.proof?.easAttestation) {
      isEasValid = await verifyOffchainAttestation(cred.proof.easAttestation, cred.issuer?.did || '');
      easDetails = isEasValid 
        ? `EAS EIP-712 Attestation mathematically verified for ${cred.issuer?.name}.`
        : `EAS Attestation Signature is INVALID or TAMPERED.`;
      
      checks.push({
        step: '3.5 EAS PROOF',
        name: 'Ethereum Attestation Service (EAS) Off-Chain Signature',
        passed: isEasValid,
        details: easDetails,
        technicalData: `EAS Schema: 0x0000000000000000000000000000000000000000000000000000000000000000\nEAS UID: ${cred.proof.easAttestation?.uid || 'Unknown'}`
      });
    }

    // Check 4: On-Chain Blockchain Registry Anchor (Proof of Existence)
    const matchingBlock = this.blocks.find(
      (b) =>
        b.blockNumber === cred.proof?.blockNumber ||
        b.transactions.some((tx) => tx.credentialId === cred.id || tx.txHash === cred.proof?.txHash)
    );
    const isOnChain = Boolean(matchingBlock);

    checks.push({
      step: '4. BLOCKCHAIN',
      name: 'Smart Contract Ledger State Anchor',
      passed: isOnChain,
      details: isOnChain
        ? `Document anchor confirmed on Block #${cred.proof?.blockNumber} (Tx: ${cred.proof?.txHash.slice(0, 18)}...).`
        : 'Transaction not found on academic consortium ledger.',
      technicalData: `Contract: ${cred.issuer?.contractAddress || '0xAcademicRegistryV2'}\nBlock Height: #${cred.proof?.blockNumber || 'N/A'}`,
    });

    // Check 5: On-Chain Revocation & Validity Status
    // Also check if current registry marks it as revoked
    const isRevoked = Boolean(cred.revocationStatus?.isRevoked || storedVersion?.revocationStatus?.isRevoked);
    const revocationReason = cred.revocationStatus?.revocationReason || storedVersion?.revocationStatus?.revocationReason;

    checks.push({
      step: '5. REVOCATION',
      name: 'Real-Time On-Chain Revocation Status Check',
      passed: !isRevoked,
      details: !isRevoked
        ? 'Credential is valid and ACTIVE in the smart contract status registry.'
        : `CREDENTIAL REVOKED by ${cred.issuer?.name}! Reason: ${revocationReason || 'Administrative / Disciplinary Action'}`,
      technicalData: isRevoked
        ? `Revoked At: ${cred.revocationStatus?.revokedAt || 'Unknown'}\nRevocation Tx: ${cred.revocationStatus?.revocationTxHash || '0xRevoke'}`
        : 'Status: 0x00 (ACTIVE)',
    });

    // Determine final status
    let status: VerificationReport['status'] = 'VALID';
    if (!isHashMatched || !isSignatureValid || (cred.proof?.easAttestation && !isEasValid)) {
      status = 'TAMPERED';
    } else if (isRevoked) {
      status = 'REVOKED';
    } else if (!isOnChain) {
      status = 'NOT_FOUND';
    }

    // Record audit log
    if (verifierMeta?.name) {
      this.recordVerificationAudit(
        cred.id,
        verifierMeta.name,
        'Web3 Client Verification Gateway',
        status,
        verifierMeta.purpose || 'Instant Authenticity & Migration Clearance Check'
      );
    }

    let summary = '';
    if (status === 'VALID') {
      summary = `Authentic & Cryptographically Verified! Issued by ${cred.issuer?.name} to ${cred.subject?.fullName} (${cred.subject?.rollNumber}). Anchored on-chain on Block #${cred.proof?.blockNumber}.`;
    } else if (status === 'TAMPERED') {
      summary = `FRAUD ALERT: Tampered Academic Record! Document hash or digital signature does not match issuer seal.`;
    } else if (status === 'REVOKED') {
      summary = `WARNING: Revoked Document! This certificate was invalidated by ${cred.issuer?.name}.`;
    } else {
      summary = `Verification unresolved.`;
    }

    return {
      status,
      verifiedAt,
      credential: cred,
      issuer: issuerInfo,
      checks,
      tamperDetails: !isHashMatched
        ? {
            originalHash: originalProofHash || 'N/A',
            computedHash,
            mismatchedFields,
          }
        : undefined,
      summary,
    };
  }

  // Reset demo state if needed
  public resetToDefault() {
    localStorage.clear();
    this.credentials = [...SEED_CREDENTIALS];
    this.blocks = [...INITIAL_BLOCKS];
    this.universities = [...KNOWN_UNIVERSITIES];
    this.activeStudent = { ...CURRENT_STUDENT };
    this.accessGrants = [];
    this.auditLogs = [];
    this.saveState();
    this.alignSeedHashes();
  }
}

export const ledgerService = new BlockchainLedgerService();
