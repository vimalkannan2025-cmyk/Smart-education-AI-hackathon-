import React, { useState, useEffect } from 'react';
import { VerifiableCredential, StudentProfile, AccessGrant, VerificationAuditLog } from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { TranscriptDocument } from './TranscriptDocument';
import { MigrationDocument } from './MigrationDocument';
import { DegreeDocument } from './DegreeDocument';
import { SelectiveDisclosureModal } from './SelectiveDisclosureModal';
import { AccessHistoryModal } from './AccessHistoryModal';
import { RawCredentialJsonModal } from './RawCredentialJsonModal';
import { 
  GraduationCap, 
  FileText, 
  ArrowRightLeft, 
  Award, 
  ShieldCheck, 
  Lock, 
  Share2, 
  History, 
  Code, 
  Printer, 
  QrCode,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface StudentWalletViewProps {
  credentials: VerifiableCredential[];
  student: StudentProfile;
  accessGrants: AccessGrant[];
  auditLogs: VerificationAuditLog[];
  onRefreshData: () => void;
  onNavigateToVerifier: (credId: string) => void;
  onNavigateToTamperLab: (credId: string) => void;
}

export const StudentWalletView: React.FC<StudentWalletViewProps> = ({
  credentials,
  student,
  accessGrants,
  auditLogs,
  onRefreshData,
  onNavigateToVerifier,
  onNavigateToTamperLab,
}) => {
  const [selectedCredId, setSelectedCredId] = useState<string>(
    credentials[0]?.id || ''
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [selectiveMode, setSelectiveMode] = useState<'FULL' | 'SELECTIVE_GPA_ONLY'>('FULL');

  // Keep selectedCredId in sync when credentials array updates
  useEffect(() => {
    if (credentials.length > 0 && (!selectedCredId || !credentials.some((c) => c.id === selectedCredId))) {
      setSelectedCredId(credentials[0].id);
    }
  }, [credentials, selectedCredId]);

  const selectedCred = credentials.find((c) => c.id === selectedCredId) || credentials[0];

  const getIconForType = (type?: VerifiableCredential['type']) => {
    switch (type) {
      case 'TRANSCRIPT':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'MIGRATION_CERTIFICATE':
        return <ArrowRightLeft className="w-5 h-5 text-emerald-400" />;
      case 'DEGREE_CERTIFICATE':
        return <Award className="w-5 h-5 text-amber-400" />;
      default:
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student SSI Banner */}
      <div className="bg-slate-900 border-t-4 border-t-blue-600 border-x border-b border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-blue-500/40 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-2xl">
                  {student.fullName.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {student.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/30">
                  {student.rollNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                  CGPA {student.cgpa} / 10.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                {student.program}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>DID: <strong className="text-slate-200">{student.did.slice(0, 22)}...</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Self-Sovereign Identity Active</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-share-credentials"
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Permissioned Share</span>
            </button>

            <button
              id="btn-view-audit-history"
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all border border-slate-700"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span>Access History ({auditLogs.length})</span>
            </button>

            <button
              id="btn-view-raw-json"
              onClick={() => setShowRawJsonModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all border border-slate-700"
              title="Inspect Cryptographic W3C JSON-LD"
            >
              <Code className="w-4 h-4 text-blue-400" />
              <span>JSON Proof</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Credentials Wallet Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Credentials Selector Tabs & Quick Proof Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>My Sovereign Credentials ({credentials.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {credentials.map((cred) => {
                const isSelected = cred.id === selectedCredId;
                const isRevoked = cred.revocationStatus?.isRevoked;

                return (
                  <div
                    key={cred.id}
                    onClick={() => setSelectedCredId(cred.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-800">
                          {getIconForType(cred.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white line-clamp-1">
                            {cred.title}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {cred.issuer.name}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-400 rotate-90' : 'text-slate-600'}`} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Block #{cred.proof.blockNumber}</span>
                      {isRevoked ? (
                        <span className="text-rose-400 font-bold">REVOKED</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">● ACTIVE & VALID</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Impact Callout Card */}
          <div className="bg-slate-900 border-t-4 border-t-blue-600 border-x border-b border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Decentralized Freedom</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No paper lost in mail, no 4-week delays, no clerk bribes. You hold your cryptographic records in your self-sovereign wallet and can grant instant, verifiable access to foreign universities or visa embassies anywhere in the world.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Verification Speed</span>
                <span className="text-emerald-400 font-bold">0.4 Seconds</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Intermediary Delay</span>
                <span className="text-emerald-400 font-bold">0 Days</span>
              </div>
            </div>
          </div>

          {/* Direct Verification Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Interactive Test Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateToVerifier(selectedCred.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>Run 5-Stage Verification Audit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateToTamperLab(selectedCred.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>Test Anti-Fraud Tamper Detection</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: High-Fidelity Official Credential Rendering */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Certificate View Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">View Mode:</span>
              <button
                onClick={() => setSelectiveMode('FULL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectiveMode === 'FULL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Full Academic Record
              </button>
              <button
                onClick={() => setSelectiveMode('SELECTIVE_GPA_ONLY')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectiveMode === 'SELECTIVE_GPA_ONLY'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Selective CGPA Only
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Copy</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1.5 transition-colors shadow-md shadow-blue-600/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Active Document Render */}
          {!selectedCred && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No Credential Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an academic credential from the list on the left or issue a new credential from the University Issuer Portal.
              </p>
            </div>
          )}

          {selectedCred && selectedCred.type === 'TRANSCRIPT' && (
            <TranscriptDocument
              credential={selectedCred}
              selectiveMode={selectiveMode}
              onVerifyNow={() => onNavigateToVerifier(selectedCred.id)}
              onOpenSelectiveShare={() => setShowShareModal(true)}
            />
          )}

          {selectedCred && selectedCred.type === 'MIGRATION_CERTIFICATE' && (
            <MigrationDocument credential={selectedCred} />
          )}

          {selectedCred && selectedCred.type === 'DEGREE_CERTIFICATE' && (
            <DegreeDocument credential={selectedCred} />
          )}

        </div>

      </div>

      {/* Modals */}
      {showShareModal && selectedCred && (
        <SelectiveDisclosureModal
          credential={selectedCred}
          onClose={() => setShowShareModal(false)}
          onGrantCreated={onRefreshData}
        />
      )}

      {showHistoryModal && selectedCred && (
        <AccessHistoryModal
          credentialId={selectedCred.id}
          auditLogs={auditLogs}
          accessGrants={accessGrants}
          onClose={() => setShowHistoryModal(false)}
          onRevokeGrant={(grantId) => {
            ledgerService.revokeAccessGrant(grantId);
            onRefreshData();
          }}
        />
      )}

      {showRawJsonModal && selectedCred && (
        <RawCredentialJsonModal
          credential={selectedCred}
          onClose={() => setShowRawJsonModal(false)}
        />
      )}

    </div>
  );
};
