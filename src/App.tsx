import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudentWalletView } from './components/StudentWallet/StudentWalletView';
import { IssuerPortalView } from './components/IssuerPortal/IssuerPortalView';
import { VerifierPortalView } from './components/VerifierPortal/VerifierPortalView';
import { TamperSimulatorView } from './components/TamperLab/TamperSimulatorView';
import { BlockchainExplorerView } from './components/BlockchainExplorer/BlockchainExplorerView';
import { ledgerService } from './services/blockchainLedger';
import { VerifiableCredential, StudentProfile, UniversityIssuerInfo, AccessGrant, VerificationAuditLog, BlockchainBlock } from './types';
import { ShieldCheck, HeartHandshake, Globe, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('STUDENT');
  const [credentials, setCredentials] = useState<VerifiableCredential[]>(() => ledgerService.getCredentials());
  const [student, setStudent] = useState<StudentProfile>(() => ledgerService.getActiveStudent());
  const [universities, setUniversities] = useState<UniversityIssuerInfo[]>(() => ledgerService.getUniversities());
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>(() => ledgerService.getAccessGrants());
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>(() => ledgerService.getAuditLogs());
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(() => ledgerService.getBlocks());
  const [verifierPrefillId, setVerifierPrefillId] = useState<string>('');
  const [tamperPrefillId, setTamperPrefillId] = useState<string>('');

  const refreshData = () => {
    setCredentials([...ledgerService.getCredentials()]);
    setStudent({ ...ledgerService.getActiveStudent() });
    setUniversities([...ledgerService.getUniversities()]);
    setAccessGrants([...ledgerService.getAccessGrants()]);
    setAuditLogs([...ledgerService.getAuditLogs()]);
    setBlocks([...ledgerService.getBlocks()]);
  };

  useEffect(() => {
    refreshData();

    // Check URL parameters for direct verification links (e.g. ?verifyId=... or ?accessCode=...)
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verifyId');
    const accessCode = params.get('accessCode');
    const credId = params.get('credId');

    if (verifyId || accessCode || credId) {
      setVerifierPrefillId(accessCode || verifyId || credId || '');
      setActiveTab('VERIFIER');
    }
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all demo state to fresh default credentials and blocks?')) {
      ledgerService.resetToDefault();
      refreshData();
    }
  };

  const navigateToVerifier = (credId: string) => {
    setVerifierPrefillId(credId);
    setActiveTab('VERIFIER');
  };

  const navigateToTamperLab = (credId: string) => {
    setTamperPrefillId(credId);
    setActiveTab('TAMPER_LAB');
  };

  const latestBlockNumber = blocks[0]?.blockNumber || 18510800;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white geometric-grid">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        blockHeight={latestBlockNumber}
      />

      {/* Main Stakeholder View Router */}
      <main className="grow">
        {activeTab === 'STUDENT' && (
          <StudentWalletView
            credentials={credentials}
            student={student}
            accessGrants={accessGrants}
            auditLogs={auditLogs}
            onRefreshData={refreshData}
            onNavigateToVerifier={navigateToVerifier}
            onNavigateToTamperLab={navigateToTamperLab}
          />
        )}

        {activeTab === 'ISSUER' && (
          <IssuerPortalView
            universities={universities}
            credentials={credentials}
            currentStudent={student}
            onRefreshData={refreshData}
            onNavigateToVerifier={navigateToVerifier}
          />
        )}

        {activeTab === 'VERIFIER' && (
          <VerifierPortalView
            initialCredId={verifierPrefillId}
            credentials={credentials}
            onNavigateToTamperLab={navigateToTamperLab}
          />
        )}

        {activeTab === 'TAMPER_LAB' && (
          <TamperSimulatorView
            initialCredId={tamperPrefillId}
            credentials={credentials}
            onNavigateToVerifier={navigateToVerifier}
          />
        )}

        {activeTab === 'BLOCKCHAIN' && (
          <BlockchainExplorerView
            blocks={blocks}
          />
        )}
      </main>

      {/* Platform Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">
              AcadChain • Decentralized Academic Records & Migration Protocol
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-slate-400">Track: Blockchain / Web3 for Social Impact</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">W3C Verifiable Credentials Standard</span>
            <span>•</span>
            <span className="text-blue-400 font-medium">Instant Verification</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
