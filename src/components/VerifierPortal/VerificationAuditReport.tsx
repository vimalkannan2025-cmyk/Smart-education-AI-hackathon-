import React from 'react';
import { VerificationReport } from '../../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  Building,
  Key,
  Blocks,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { TranscriptDocument } from '../StudentWallet/TranscriptDocument';
import { MigrationDocument } from '../StudentWallet/MigrationDocument';
import { DegreeDocument } from '../StudentWallet/DegreeDocument';

interface VerificationAuditReportProps {
  report: VerificationReport;
  onReset: () => void;
  onNavigateToTamperLab?: () => void;
}

export const VerificationAuditReport: React.FC<VerificationAuditReportProps> = ({
  report,
  onReset,
  onNavigateToTamperLab,
}) => {
  const isSuccess = report.status === 'VALID';
  const isTampered = report.status === 'TAMPERED';
  const isRevoked = report.status === 'REVOKED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Top Banner Status Header */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-xl text-white ${
          isSuccess
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/40 shadow-emerald-500/10'
            : isTampered
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500/50 shadow-rose-500/20'
            : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/50 shadow-amber-500/20'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isTampered
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {isSuccess ? (
                <ShieldCheck className="w-8 h-8" />
              ) : isTampered ? (
                <ShieldAlert className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isTampered
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isSuccess
                    ? '100% CRYPTOGRAPHICALLY AUTHENTIC'
                    : isTampered
                    ? 'SECURITY ALERT: FORGED OR TAMPERED RECORD'
                    : 'RECORD REVOKED ON-CHAIN'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Verified: {new Date(report.verifiedAt).toLocaleTimeString()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {isSuccess
                  ? 'Official Academic Record Verified'
                  : isTampered
                  ? 'Cryptographic Signature Mismatch Detected!'
                  : 'Document Status: Revoked by University'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {report.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Compliance Dossier</span>
            </button>

            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      </div>

      {/* 5-Stage Visual Cryptographic Audit Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">
              5-Point Mathematical & On-Chain Audit Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated against decentralized consortium root & registered university public keys
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Latency: 0.38s • 0 Trust Assumptions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {report.checks.map((check, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                check.passed
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-rose-950/30 border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  {check.step}
                </span>
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <h4 className="font-bold text-xs text-white leading-snug">
                {check.name}
              </h4>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {check.details}
              </p>

              {check.technicalData && (
                <div className="pt-2 border-t border-slate-800/80 text-[9px] font-mono text-slate-500 break-all">
                  {check.technicalData}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* If Tampered, show interactive tamper diagnosis */}
        {isTampered && report.tamperDetails && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Tamper Diagnostics Report (Fraud Forensic Analysis)</span>
            </div>
            <p className="text-xs text-rose-300 leading-relaxed">
              The payload hash generated from the document does NOT match the cryptographic signature signed by the issuing university's private key.
            </p>
            {report.tamperDetails.mismatchedFields && report.tamperDetails.mismatchedFields.length > 0 && (
              <div className="space-y-1 pt-1 font-mono text-[11px] text-rose-100 bg-slate-950/80 p-3 rounded-xl border border-rose-500/30">
                <div className="text-rose-400 font-bold">Modified Key-Value Fields Detected:</div>
                {report.tamperDetails.mismatchedFields.map((field, i) => (
                  <div key={i} className="text-rose-300">⚠️ {field}</div>
                ))}
              </div>
            )}
            {onNavigateToTamperLab && (
              <button
                onClick={onNavigateToTamperLab}
                className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center space-x-1.5"
              >
                <span>Inspect in Anti-Fraud Sandbox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Actual Verified Credential Document Preview */}
      {report.credential && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Cryptographically Rendered Official Document</span>
            </h3>
            <span className="text-xs text-slate-500">
              Immutable Document ID: <strong className="font-mono text-slate-700">{report.credential.id}</strong>
            </span>
          </div>

          {report.credential?.type === 'TRANSCRIPT' && (
            <TranscriptDocument credential={report.credential} />
          )}

          {report.credential?.type === 'MIGRATION_CERTIFICATE' && (
            <MigrationDocument credential={report.credential} />
          )}

          {report.credential?.type === 'DEGREE_CERTIFICATE' && (
            <DegreeDocument credential={report.credential} />
          )}
        </div>
      )}

    </div>
  );
};
