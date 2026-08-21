import React, { useState } from 'react';
import { VerifiableCredential } from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { AlertOctagon, ShieldAlert, Check, X, Search, Lock } from 'lucide-react';

interface RevocationManagerModalProps {
  credentials: VerifiableCredential[];
  onClose: () => void;
  onRevocationUpdated: () => void;
}

export const RevocationManagerModal: React.FC<RevocationManagerModalProps> = ({
  credentials,
  onClose,
  onRevocationUpdated,
}) => {
  const [selectedCredId, setSelectedCredId] = useState(credentials[0]?.id || '');
  const [reason, setReason] = useState('Administrative Disciplinary Action / Record Updated');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedCred = credentials.find((c) => c.id === selectedCredId);

  const handleRevoke = async () => {
    if (!selectedCredId || !reason) return;
    setIsProcessing(true);

    try {
      const success = await ledgerService.revokeCredential(selectedCredId, reason);
      if (success) {
        setStatusMessage(`Successfully revoked ${selectedCredId} on-chain! Status list updated.`);
        onRevocationUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">On-Chain Revocation Registry</h3>
              <p className="text-xs text-slate-400">Invalidate credentials in real-time across all global verifiers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {statusMessage ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
              <div className="font-bold text-sm flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>On-Chain Revocation Broadcasted!</span>
              </div>
              <p>{statusMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Credential to Revoke:
              </label>
              <select
                value={selectedCredId}
                onChange={(e) => setSelectedCredId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
              >
                {credentials.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} - {c.subject.fullName} ({c.subject.rollNumber}) {c.revocationStatus?.isRevoked ? '[ALREADY REVOKED]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedCred && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <div>Student: <span className="text-slate-200">{selectedCred.subject.fullName}</span></div>
                <div>Issuer: <span className="text-slate-200">{selectedCred.issuer.name}</span></div>
                <div>Status: {selectedCred.revocationStatus?.isRevoked ? <span className="text-rose-400 font-bold">REVOKED</span> : <span className="text-emerald-400 font-semibold">ACTIVE</span>}</div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Official Revocation Reason (Recorded to Ledger):
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
                placeholder="State the institutional / examination board reason for revoking this credential"
              />
            </div>

            <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 leading-relaxed">
              ⚠️ Warning: Revocation is irreversible on the blockchain. Verifiers checking this credential in the future will receive an immediate revocation alert.
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRevoke}
                disabled={isProcessing || selectedCred?.revocationStatus?.isRevoked}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-rose-600/30"
              >
                {isProcessing ? (
                  <span>Broadcasting Revocation...</span>
                ) : (
                  <span>Broadcast Revoke Tx</span>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
