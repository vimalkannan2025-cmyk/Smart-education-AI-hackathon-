import React, { useState } from 'react';
import { UniversityIssuerInfo, VerifiableCredential, StudentProfile } from '../../types';
import { IssueCredentialModal } from './IssueCredentialModal';
import { RevocationManagerModal } from './RevocationManagerModal';
import { 
  Building2, 
  Plus, 
  AlertOctagon, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  ArrowRightLeft, 
  Award, 
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Lock,
  Globe
} from 'lucide-react';

interface IssuerPortalViewProps {
  universities: UniversityIssuerInfo[];
  credentials: VerifiableCredential[];
  currentStudent: StudentProfile;
  onRefreshData: () => void;
  onNavigateToVerifier: (credId: string) => void;
}

export const IssuerPortalView: React.FC<IssuerPortalViewProps> = ({
  universities,
  credentials,
  currentStudent,
  onRefreshData,
  onNavigateToVerifier,
}) => {
  const [selectedUnivId, setSelectedUnivId] = useState(universities[0]?.id || 'iit-delhi');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TRANSCRIPT' | 'MIGRATION_CERTIFICATE' | 'DEGREE_CERTIFICATE'>('ALL');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const selectedUniv = universities.find((u) => u.id === selectedUnivId) || universities[0];

  const filteredCredentials = credentials.filter((cred) => {
    const matchesUniv = !selectedUniv || cred.issuer?.id === selectedUniv.id || cred.issuer?.did === selectedUniv.did;
    const matchesType = typeFilter === 'ALL' || cred.type === typeFilter;
    const matchesSearch =
      (cred.subject?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (cred.subject?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (cred.id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (cred.proof?.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesUniv && matchesType && matchesSearch;
  });

  const totalIssued = selectedUniv ? credentials.filter((c) => c.issuer?.id === selectedUniv.id).length : credentials.length;
  const activeCount = selectedUniv ? credentials.filter((c) => c.issuer?.id === selectedUniv.id && !c.revocationStatus?.isRevoked).length : 0;
  const revokedCount = totalIssued - activeCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* University Header & Identity */}
      <div className="bg-slate-900 border-t-4 border-t-blue-600 border-x border-b border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            {selectedUniv.crestUrl ? (
              <img
                src={selectedUniv.crestUrl}
                alt={selectedUniv.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-blue-500/50 shadow-xs bg-white"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-2xl">
                {selectedUniv.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {selectedUniv.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                  Verified Issuer Node
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-300">
                {selectedUniv.accreditation}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>Controller: <strong className="text-slate-200">{selectedUniv.controllerName}</strong></span>
                <span>•</span>
                <span>DID: <strong className="text-slate-200">{selectedUniv.did.slice(0, 20)}...</strong></span>
              </div>
            </div>
          </div>

          {/* Switch University Selector & Issue Button */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedUnivId}
              onChange={(e) => setSelectedUnivId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-hidden"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  Switch: {u.name}
                </option>
              ))}
            </select>

            <button
              id="btn-open-issue-modal"
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Credential</span>
            </button>

            <button
              id="btn-open-revoke-modal"
              onClick={() => setShowRevokeModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Revocation Registry</span>
            </button>
          </div>

        </div>
      </div>

      {/* Institutional Telemetry & Anti-Fraud Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Credentials Issued</span>
          <div className="text-2xl font-bold font-mono text-white">{totalIssued}</div>
          <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Anchored to Consortium Ledger</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-1">
          <span className="text-xs text-slate-400 font-medium">Active Verifiable Records</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</div>
          <span className="text-[11px] text-slate-400">Zero Clerk Overhead</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-1">
          <span className="text-xs text-slate-400 font-medium">Revoked / Invalidated</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{revokedCount}</div>
          <span className="text-[11px] text-rose-300">Status List 2021 Active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-1">
          <span className="text-xs text-slate-400 font-medium">Institutional Cost Saved</span>
          <div className="text-2xl font-bold font-mono text-amber-400">₹4.2 Lakhs</div>
          <span className="text-[11px] text-slate-400">Courier & Manual Email Checks</span>
        </div>
      </div>

      {/* Registry Table & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-white">Official Institutional Credential Registry</h3>
            <p className="text-xs text-slate-400">
              Real-time cryptographic audit trail of all mark sheets, migration certificates, and degrees
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student, roll no, or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'TRANSCRIPT', 'MIGRATION_CERTIFICATE', 'DEGREE_CERTIFICATE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'TRANSCRIPT' ? 'Transcripts' : type === 'MIGRATION_CERTIFICATE' ? 'Migration' : 'Degrees'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Document Title & Type</th>
                <th className="px-4 py-3">Student / Candidate</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Issuance Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Block / Tx</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCredentials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No academic credentials matched your query.
                  </td>
                </tr>
              ) : (
                filteredCredentials.map((cred) => {
                  const isRevoked = cred.revocationStatus?.isRevoked;
                  return (
                    <tr key={cred.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{cred.title}</div>
                        <span className="text-[10px] font-mono text-indigo-400">{cred.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{cred.subject.fullName}</div>
                        <span className="text-[10px] text-slate-500">{cred.subject.program}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-400 font-bold">
                        {cred.subject.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(cred.issuanceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold text-[10px] border border-rose-500/30">
                            REVOKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        <div>#{cred.proof.blockNumber}</div>
                        <span className="text-slate-500">{cred.proof.txHash.slice(0, 10)}...</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onNavigateToVerifier(cred.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium inline-flex items-center space-x-1 transition-colors"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      {showIssueModal && (
        <IssueCredentialModal
          universities={universities}
          currentStudent={currentStudent}
          onClose={() => setShowIssueModal(false)}
          onIssued={() => {
            onRefreshData();
          }}
        />
      )}

      {showRevokeModal && (
        <RevocationManagerModal
          credentials={credentials}
          onClose={() => setShowRevokeModal(false)}
          onRevocationUpdated={() => {
            onRefreshData();
          }}
        />
      )}

    </div>
  );
};
