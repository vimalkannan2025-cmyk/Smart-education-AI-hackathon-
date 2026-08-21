import React, { useState } from 'react';
import { BlockchainBlock, BlockchainTransaction } from '../../types';
import { 
  Blocks, 
  Layers, 
  Code, 
  TrendingUp, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  DollarSign, 
  Cpu, 
  Activity,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface BlockchainExplorerViewProps {
  blocks: BlockchainBlock[];
}

export const BlockchainExplorerView: React.FC<BlockchainExplorerViewProps> = ({ blocks }) => {
  const [selectedTab, setSelectedTab] = useState<'BLOCKS' | 'CONTRACT' | 'IMPACT'>('IMPACT');
  const [selectedBlock, setSelectedBlock] = useState<BlockchainBlock | null>(blocks[0] || null);

  const totalTransactions = blocks.reduce((acc, b) => acc + b.transactionsCount, 0);
  const latestBlock = blocks[0];

  const sampleSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AcademicRegistry - Decentralized Verifiable Credential Consortium
 * @notice Anchors academic transcripts, migration certificates, and degrees
 * @dev Implements EIP-712 / W3C Verifiable Credentials with on-chain Revocation Registry
 */
contract AcademicRegistry {
    
    struct CredentialAnchor {
        bytes32 documentHash;
        bytes32 merkleRoot;
        address issuer;
        uint256 blockTimestamp;
        bool isRevoked;
        string revocationReason;
    }

    // Mapping: keccak256(credentialId) => CredentialAnchor
    mapping(bytes32 => CredentialAnchor) public registry;
    
    // Whitelisted National Academic Issuers (IITs, NITs, Central Universities)
    mapping(address => bool) public authorizedIssuers;
    
    event CredentialAnchored(string indexed credentialId, bytes32 indexed documentHash, address indexed issuer);
    event CredentialRevoked(string indexed credentialId, address indexed issuer, string reason);

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Caller not an accredited University Issuer node");
        _;
    }

    function anchorCredential(
        string calldata credentialId,
        bytes32 documentHash,
        bytes32 merkleRoot
    ) external onlyIssuer {
        bytes32 key = keccak256(abi.encodePacked(credentialId));
        require(registry[key].blockTimestamp == 0, "Credential already anchored on-chain");

        registry[key] = CredentialAnchor({
            documentHash: documentHash,
            merkleRoot: merkleRoot,
            issuer: msg.sender,
            blockTimestamp: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        emit CredentialAnchored(credentialId, documentHash, msg.sender);
    }

    function revokeCredential(
        string calldata credentialId,
        string calldata reason
    ) external onlyIssuer {
        bytes32 key = keccak256(abi.encodePacked(credentialId));
        require(registry[key].blockTimestamp > 0, "Credential not found");
        require(registry[key].issuer == msg.sender, "Only the issuing university can revoke");
        require(!registry[key].isRevoked, "Already revoked");

        registry[key].isRevoked = true;
        registry[key].revocationReason = reason;

        emit CredentialRevoked(credentialId, msg.sender, reason);
    }

    function verifyCredential(
        string calldata credentialId,
        bytes32 payloadHash
    ) external view returns (bool isValid, bool isRevoked, address issuer, uint256 timestamp) {
        bytes32 key = keccak256(abi.encodePacked(credentialId));
        CredentialAnchor memory record = registry[key];
        
        if (record.blockTimestamp == 0 || record.documentHash != payloadHash) {
            return (false, false, address(0), 0);
        }
        return (true, record.isRevoked, record.issuer, record.blockTimestamp);
    }
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border-t-4 border-t-blue-600 border-x border-b border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/30 font-semibold flex items-center space-x-1">
                <Blocks className="w-3.5 h-3.5" />
                <span>AcadChain Consortium Network L2</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Consensus: Proof of Authority (PoA)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Decentralized Ledger & Social Impact Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time auditability for student sovereignty, fraud prevention, and administrative transparency.
            </p>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTab('IMPACT')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
                selectedTab === 'IMPACT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Social Impact</span>
            </button>

            <button
              onClick={() => setSelectedTab('BLOCKS')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
                selectedTab === 'BLOCKS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Blocks className="w-4 h-4" />
              <span>Blocks & Ledger</span>
            </button>

            <button
              onClick={() => setSelectedTab('CONTRACT')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
                selectedTab === 'CONTRACT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Smart Contract</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SOCIAL IMPACT DASHBOARD */}
      {selectedTab === 'IMPACT' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Key Macro Transformation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">Turnaround Time</span>
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-400">0.4 sec</div>
              <div className="text-xs text-slate-400">
                Reduced from <strong className="text-rose-400 line-through">28.4 Days</strong> of university clerk chasing.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">Student Out-of-Pocket Cost</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-400">₹0.00</div>
              <div className="text-xs text-slate-400">
                Eliminated <strong className="text-rose-400">₹3,200</strong> in travel, courier fees, and "speed money" bribes.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">Certificate Forgery Rate</span>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-black font-mono text-blue-400">0.00%</div>
              <div className="text-xs text-slate-400">
                Cryptographic mathematical impossibility of tampering.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">Green Eco Impact</span>
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-400">45 Sheets</div>
              <div className="text-xs text-slate-400">
                Paper & 12.8 kg CO2 saved per student graduation lifecycle.
              </div>
            </div>
          </div>

          {/* Detailed Problem vs. Solution Deep-Dive Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* The Broken Legacy System */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>The Legacy Paper & Bureaucracy Trap</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 text-sm block">1. Physical Gatekeeping & Bribes</strong>
                  <p>Students must travel hundreds of kilometers to physical campuses, wait in queues, and often pay illicit "speed money" to clerk counters to get registrar seals.</p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 text-sm block">2. Rampant Certificate Forgeries</strong>
                  <p>Paper transcripts and migration letters are easily counterfeited with high-resolution printers and photoshop seals, debasing national academic credibility.</p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 text-sm block">3. 4-8 Week Foreign Verification Backlogs</strong>
                  <p>Foreign universities (US/UK/EU) and visa embassies must send manual inquiry emails to Indian institutions, causing students to miss admission deadlines.</p>
                </div>
              </div>
            </div>

            {/* The Web3 Social Impact Solution */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>The AcadChain Decentralized Paradigm</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 text-sm block">1. Self-Sovereign Student Ownership</strong>
                  <p>Students hold their credentials in cryptographic wallets (W3C standard), granting instant time-locked or selective disclosure access without intermediaries.</p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 text-sm block">2. 0.4-Second Global Trust Verification</strong>
                  <p>Employers, visa officers, and graduate schools verify the cryptographic signature against the blockchain ledger instantly with zero contact to university clerks.</p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 text-sm block">3. Real-Time On-Chain Revocation</strong>
                  <p>If a student record requires administrative hold or disciplinary update, university authorities update the status list on-chain in 1 transaction.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: BLOCKCHAIN BLOCKS & LEDGER EXPLORER */}
      {selectedTab === 'BLOCKS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <span className="text-xs text-slate-400">Current Block Height</span>
              <div className="text-2xl font-bold font-mono text-amber-400">#{latestBlock?.blockNumber || 18510800}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <span className="text-xs text-slate-400">Total Anchored Transactions</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{totalTransactions} Tx</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
              <span className="text-xs text-slate-400">Average Confirmation Time</span>
              <div className="text-2xl font-bold font-mono text-blue-400">420 ms</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <h3 className="font-bold text-base text-white">Live Blocks Stream</h3>

            <div className="space-y-3">
              {blocks.map((block) => (
                <div
                  key={block.blockNumber}
                  onClick={() => setSelectedBlock(block)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedBlock?.blockNumber === block.blockNumber
                      ? 'bg-amber-950/30 border-amber-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        Block #{block.blockNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                        {block.transactionsCount} txs
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Miner: <strong className="text-slate-300">{block.miner}</strong>
                      </span>
                    </div>

                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(block.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <div className="truncate">
                      Hash: <span className="text-slate-300">{block.hash}</span>
                    </div>
                    <div className="truncate">
                      Merkle Root: <span className="text-slate-300">{block.merkleRoot}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: SMART CONTRACT SOLIDITY CODE & SPECIFICATION */}
      {selectedTab === 'CONTRACT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Smart Contract Architecture: AcademicRegistry.sol</h3>
              <p className="text-xs text-slate-400">Deployed at: <strong className="font-mono text-amber-400">0xAcademicRegistrySmartContractV2</strong></p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Solidity 0.8.20 • EIP-712
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre className="whitespace-pre">{sampleSolidityCode}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
