import React from 'react';
import { VerificationAuditLog, AccessGrant } from '../../types';
import { 
  ShieldCheck, 
  History, 
  ExternalLink, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Key
} from 'lucide-react';

interface AccessHistoryModalProps {
  credentialId: string;
  auditLogs: VerificationAuditLog[];
  accessGrants: AccessGrant[];
  onClose: () => void;
  onRevokeGrant: (grantId: string) => void;
}

export const AccessHistoryModal: React.FC<AccessHistoryModalProps> = ({
  credentialId,
  auditLogs,
  accessGrants,
  onClose,
  onRevokeGrant,
}) => {
  const relevantLogs = auditLogs.filter((log) => log.credentialId === credentialId);
  const relevantGrants = accessGrants.filter((grant) => grant.credentialId === credentialId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Student Privacy & Audit Ledger</h3>
              <p className="text-xs text-slate-400">
                Track all third parties who verified or hold permissioned access to your records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Active Access Passes */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Active Delegated Access Grants ({relevantGrants.length})</span>
          </h4>

          {relevantGrants.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
              No third-party access passes currently configured.
            </p>
          ) : (
            <div className="space-y-2">
              {relevantGrants.map((grant) => (
                <div
                  key={grant.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{grant.granteeName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                        {grant.granteeRole}
                      </span>
                      {grant.isActive ? (
                        <span className="text-[10px] text-emerald-400 font-medium">● Active</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-medium">● Revoked</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Code: <strong className="text-amber-400">{grant.accessCode}</strong> • Views: {grant.viewsCount} • Expires: {new Date(grant.expiresAt).toLocaleDateString()}
                    </div>
                  </div>

                  {grant.isActive && (
                    <button
                      onClick={() => onRevokeGrant(grant.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium self-start sm:self-auto transition-colors"
                    >
                      Revoke Pass
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Verification Audit Trail */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verification Audit Log ({relevantLogs.length})</span>
          </h4>

          {relevantLogs.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
              No verifications recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {relevantLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{log.verifierName}</span>
                    <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{log.status}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(log.verifiedAt).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{log.verifierIpOrLocation}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Purpose: {log.purpose}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close Audit Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
