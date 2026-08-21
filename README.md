# VeriDoc — AcadChain
### Instant Transcript & Migration Verification System
**Hackathon Track: Blockchain / Web3 for Social Impact**

> A decentralized academic records protocol where verified transcripts and migration certificates are issued to students as tamper-proof, cryptographically signed digital credentials. Students own their records and grant instant, permissioned access to any third party — with verification in seconds, no intermediaries, no corruption, no forgery possible.

---

## The Problem

Getting an official transcript, degree certificate, or migration certificate in India (and much of the world) is a slow, opaque, and often corrupt process:

- ⏳ **Weeks of turnaround** — physical visits, paper applications, chasing clerks
- 💰 **Corruption** — gatekeepers with discretionary power who demand bribes
- 📄 **Fragile paper** — documents get lost, damaged, or destroyed
- 🖨️ **Rampant forgery** — paper certificates are trivially easy to fake
- 📧 **Slow manual verification** — employers and universities email institutions and wait weeks
- 🚫 **Zero student agency** — the person the records belong to has the least control

---

## The Solution

AcadChain / VeriDoc gives academic credentials the same properties as cryptocurrency:
- **Unforgeable** — cryptographically signed by the University's Ethereum key
- **Student-Owned** — stored in the student's own Self-Sovereign Identity (SSI) wallet
- **Instantly Verifiable** — any employer, embassy, or university can verify in < 0.5 seconds with zero contact to the issuing institution
- **Selectively Disclosable** — students choose which fields to share (GPA only, full transcript, etc.)
- **On-Chain Revocable** — universities can revoke credentials instantly if needed

---

## Live Demo — Five Interactive Portals

| Portal | Who Uses It | Description |
|---|---|---|
| 🎓 **Student Wallet** | Students | View, share, and manage all issued credentials with selective disclosure |
| 🏛️ **University Issuer** | Exam Controllers | Issue & revoke transcripts, migration certs, and degrees with 1-click |
| 🔍 **Instant Verifier** | Employers / Embassies / Universities | Cryptographically verify any credential in < 0.5 seconds |
| 🔬 **Anti-Fraud Lab** | Judges / Demo | Tamper with credentials and watch cryptographic hashes break in real-time |
| 📊 **Ledger & Impact** | Anyone | Blockchain explorer: blocks, transactions, gas, and Solidity contract code |

---

## Tech Stack

```
Frontend:     React 19 + Vite + TypeScript
Styling:      TailwindCSS v4
Animations:   Framer Motion (motion)
Blockchain:   Ethereum Attestation Service (EAS) SDK v2.9.1
Web3:         Ethers.js v6
Cryptography: Web Crypto API (SHA-256, Merkle Trees)
Standards:    W3C Verifiable Credentials 2.0
QR Codes:     qrcode.react
Icons:        lucide-react
```

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/vimalkannan2025-cm/veridoc-acadchain.git
cd veridoc-acadchain

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# 4. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Build for Production

```bash
npm run build
```

> **Windows Users:** If you get a PowerShell script execution error, run using:
> ```bash
> cmd /c npm run dev
> ```
> Or permanently fix it by running in PowerShell **as Administrator**:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## Environment Variables

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Architecture

### Cryptographic Verification Pipeline (6 Checks)

```
University  ──signs──►  EAS Off-Chain Attestation (EIP-712)
                         + SHA-256 Document Hash
                         + Merkle Root anchored to Block
                                │
                         Student Wallet (W3C VC JSON)
                                │
                         Verifier runs 6 checks in < 0.5s:
                           ✅ W3C Schema Validation
                           ✅ SHA-256 Hash Integrity
                           ✅ University Signature Verification
                           ✅ EAS EIP-712 Attestation Check
                           ✅ Blockchain Anchor / Merkle Root
                           ✅ On-Chain Revocation Registry
```

### Smart Contract (`AcademicRegistry.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AcademicRegistry {
    struct CredentialAnchor {
        bytes32 documentHash;
        bytes32 merkleRoot;
        address issuer;
        uint256 blockTimestamp;
        bool isRevoked;
        string revocationReason;
    }
    mapping(bytes32 => CredentialAnchor) public registry;
    mapping(address => bool) public authorizedIssuers;

    function anchorCredential(string calldata credentialId, bytes32 documentHash, bytes32 merkleRoot) external onlyIssuer;
    function revokeCredential(string calldata credentialId, string calldata reason) external onlyIssuer;
}
```

---

## Project Structure

```
src/
├── components/
│   ├── StudentWallet/        # Student credential wallet portal
│   ├── IssuerPortal/         # University issuer dashboard
│   ├── VerifierPortal/       # Employer/embassy verifier gateway
│   ├── TamperLab/            # Anti-fraud demo lab
│   ├── BlockchainExplorer/   # Ledger & impact explorer
│   └── Navbar.tsx
├── services/
│   ├── blockchainLedger.ts   # Core ledger, issuance & verification engine
│   ├── cryptoEngine.ts       # SHA-256, Merkle trees, canonical JSON hashing
│   ├── easService.ts         # Ethereum Attestation Service (EAS) integration
│   └── mockData.ts           # Demo institutions, students, seed credentials
├── types/
│   └── index.ts              # W3C VC types, DID types, credential interfaces
├── App.tsx
├── main.tsx
└── index.css
```

---

## Supported Credential Types

| Type | Description |
|---|---|
| 📋 **Consolidated Transcript** | 8-semester academic record with course-level grade details, CGPA, rank |
| 🚀 **Migration Certificate** | Institutional transfer clearance (library, hostel, conduct) |
| 🎓 **Degree Certificate** | Conferred degree with chancellor authority and convocation number |
| 📄 **Provisional Certificate** | Pre-final year verification |

---

## Security & Trust Model

- **No PII on-chain** — Only `bytes32 documentHash` and `bytes32 merkleRoot` are anchored. No student names or grades on-chain.
- **Zero server trust** — Verification is entirely client-side. No central server can be compromised.
- **Student-controlled access** — Selective disclosure grants can be revoked by the student at any time.
- **Mathematically unforgeable** — Any 1-character change in the document breaks the SHA-256 hash and EAS signature immediately.

---

## Roadmap

- [x] All five portals operational
- [x] EAS off-chain attestation (ethers.js v6 + EAS SDK v2.9.1)
- [x] W3C Verifiable Credentials 2.0 compliance
- [x] Selective disclosure & time-limited access grants
- [x] On-chain revocation registry
- [ ] Deploy `AcademicRegistry.sol` to Base Mainnet / Polygon
- [ ] Pinata/IPFS for PDF backup storage
- [ ] Web3Auth social login (no seed phrases)
- [ ] Mobile PWA student wallet
- [ ] Real university API integration

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Hackathon Submission

- **Track:** Blockchain / Web3 for Social Impact
- **Problem:** Corrupt, slow, forgeable paper academic records in India and globally
- **Solution:** Self-Sovereign Identity (SSI) + Ethereum Attestation Service + W3C Verifiable Credentials
- **Impact:** Eliminates bribery, reduces verification from weeks to seconds, and makes forgery cryptographically impossible for 40M+ graduates annually
