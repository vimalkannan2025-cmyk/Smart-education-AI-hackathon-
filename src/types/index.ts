export type CredentialType = 'TRANSCRIPT' | 'MIGRATION_CERTIFICATE' | 'DEGREE_CERTIFICATE' | 'PROVISIONAL_CERTIFICATE';

export interface SemesterCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

export interface SemesterRecord {
  semesterNumber: number;
  term: string; // e.g. "Autumn 2024"
  gpa: number;
  creditsEarned: number;
  courses: SemesterCourse[];
}

export interface UniversityIssuerInfo {
  id: string;
  name: string;
  accreditation: string; // e.g. "NAAC A++ | AICTE & UGC Recognized"
  country: string;
  state: string;
  did: string;
  publicKey: string;
  crestUrl?: string;
  controllerName: string;
  establishedYear: number;
  contractAddress: string;
}

export interface StudentProfile {
  did: string;
  rollNumber: string;
  enrollmentNumber: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  avatarUrl?: string;
  program: string; // e.g. "Bachelor of Technology in Computer Science & Engineering"
  department: string;
  admissionYear: number;
  completionYear: number;
  cgpa: number;
  division: string; // e.g. "First Class with Distinction"
}

export interface TranscriptData {
  student: StudentProfile;
  issuer: UniversityIssuerInfo;
  semesters: SemesterRecord[];
  totalCreditsRequired: number;
  totalCreditsEarned: number;
  gradingScale: string; // e.g. "10.0 Point Absolute Scale"
  mediumOfInstruction: string; // "English"
  provisionalRank?: string;
}

export interface MigrationCertificateData {
  student: StudentProfile;
  issuer: UniversityIssuerInfo;
  certificateNumber: string;
  targetInstitutionOrGeneral: string; // e.g. "For Higher Studies / General Migration"
  noObjectionDeclared: boolean;
  clearanceDetails: {
    libraryDuesCleared: boolean;
    hostelDuesCleared: boolean;
    disciplinaryActionPending: boolean;
  };
  conductGrade: string; // "Exemplary" | "Good"
  leavingDate: string;
}

export interface DegreeCertificateData {
  student: StudentProfile;
  issuer: UniversityIssuerInfo;
  degreeTitle: string; // "Bachelor of Technology"
  major: string; // "Computer Science and Engineering"
  conferredDate: string;
  convocationNumber: string;
  honors?: string;
  chancellorName: string;
  viceChancellorName: string;
}

export interface VerifiableCredential {
  id: string; // Unique UUID / URN
  type: CredentialType;
  title: string;
  issuanceDate: string;
  expirationDate?: string;
  issuer: UniversityIssuerInfo;
  subject: StudentProfile;
  data: TranscriptData | MigrationCertificateData | DegreeCertificateData;
  proof: {
    type: 'Ed25519Signature2020' | 'EcdsaSecp256k1Signature2019';
    created: string;
    verificationMethod: string; // DID URL
    proofPurpose: 'assertionMethod';
    documentHash: string; // SHA-256 canonical hash
    merkleRoot: string;
    signatureValue: string; // Hex digital signature
    easAttestation?: any; // The actual EAS off-chain attestation
    txHash: string; // On-chain anchoring transaction
    blockNumber: number;
  };
  revocationStatus: {
    isRevoked: boolean;
    revokedAt?: string;
    revocationReason?: string;
    revocationTxHash?: string;
  };
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  previousHash: string;
  merkleRoot: string;
  hash: string;
  transactionsCount: number;
  gasUsed: number;
  miner: string;
  transactions: BlockchainTransaction[];
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string; // University DID/Address
  to: string; // Smart Contract Registry
  functionName: 'anchorCredential' | 'revokeCredential' | 'registerIssuer';
  credentialId: string;
  documentHash: string;
  merkleRoot: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  gasFeeEth: number;
}

export interface AccessGrant {
  id: string;
  credentialId: string;
  granteeName: string; // e.g. "Stanford University Admissions" or "Google HR"
  granteeRole: 'UNIVERSITY' | 'EMPLOYER' | 'EMBASSY' | 'PUBLIC';
  createdAt: string;
  expiresAt: string;
  accessCode: string;
  allowedFields: 'FULL' | 'SELECTIVE_GPA_ONLY' | 'NO_BACKPAPERS';
  viewsCount: number;
  lastViewedAt?: string;
  isActive: boolean;
}

export interface VerificationAuditLog {
  id: string;
  credentialId: string;
  verifierName: string;
  verifierIpOrLocation: string;
  verifiedAt: string;
  status: 'VALID' | 'TAMPERED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';
  purpose: string;
}

export interface VerificationCheckResult {
  step: string;
  name: string;
  passed: boolean;
  details: string;
  technicalData?: string;
}

export interface VerificationReport {
  status: 'VALID' | 'TAMPERED' | 'REVOKED' | 'NOT_FOUND';
  verifiedAt: string;
  credential?: VerifiableCredential;
  issuer?: UniversityIssuerInfo;
  checks: VerificationCheckResult[];
  tamperDetails?: {
    originalHash: string;
    computedHash: string;
    mismatchedFields?: string[];
  };
  summary: string;
}
