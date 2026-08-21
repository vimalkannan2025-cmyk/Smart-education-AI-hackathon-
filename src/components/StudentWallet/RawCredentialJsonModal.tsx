import React, { useState } from 'react';
import { VerifiableCredential } from '../../types';
import { Code, Copy, Check, Download, Printer, ShieldCheck } from 'lucide-react';

interface RawCredentialJsonModalProps {
  credential: VerifiableCredential;
  onClose: () => void;
}

export const RawCredentialJsonModal: React.FC<RawCredentialJsonModalProps> = ({
  credential,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(credential, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJsonFile = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${credential.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                W3C Verifiable Credential Payload & Proof
              </h3>
              <p className="text-xs text-slate-400">
                Self-contained, cryptographically signed JSON-LD envelope
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

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              {credential?.proof?.type || 'JsonWebSignature2020'}
            </span>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              SHA-256 Canonical
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={downloadJsonFile}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors shadow-md shadow-blue-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Copy</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="grow overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-emerald-400">
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">
            Tx: {credential.proof.txHash.slice(0, 24)}...
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
