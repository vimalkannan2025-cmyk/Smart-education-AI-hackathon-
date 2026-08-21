import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { VerifiableCredential, MigrationCertificateData } from '../../types';
import { ShieldCheck, CheckCircle2, Building, Stamp, ArrowRightCircle } from 'lucide-react';

interface MigrationDocumentProps {
  credential: VerifiableCredential;
}

export const MigrationDocument: React.FC<MigrationDocumentProps> = ({ credential }) => {
  const data = credential.data as MigrationCertificateData;
  const student = credential.subject;
  const issuer = credential.issuer;
  const isRevoked = credential.revocationStatus?.isRevoked;

  const verificationUrl = `${window.location.origin}?verifyId=${credential.id}&tx=${credential.proof.txHash}`;

  return (
    <div className="relative bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border-t-4 border-t-blue-600 border-x border-b border-slate-200 shadow-lg overflow-hidden print:p-4 print:border-2 print:shadow-none">
      
      {/* Background Guilloche Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-[-25deg]">
        <span className="text-8xl font-serif font-black uppercase tracking-widest text-slate-900">
          OFFICIAL MIGRATION CLEARANCE
        </span>
      </div>

      {isRevoked && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-800 flex items-center space-x-3">
          <div className="p-2 bg-rose-500 text-white rounded-lg font-bold">REVOKED</div>
          <div>
            <div className="font-bold">This Migration Certificate has been officially revoked on-chain</div>
            <div className="text-xs text-rose-700">Reason: {credential.revocationStatus.revocationReason}</div>
          </div>
        </div>
      )}

      {/* University Header */}
      <div className="border-b-2 border-slate-200 pb-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {issuer.crestUrl ? (
              <img
                src={issuer.crestUrl}
                alt={issuer.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-600/30 p-0.5 bg-white shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-2xl font-bold">
                {issuer.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-950 uppercase">
                {issuer.name}
              </h1>
              <p className="text-xs font-semibold text-blue-900">
                OFFICE OF THE REGISTRAR & ACADEMIC CLEARANCE COUNCIL
              </p>
              <p className="text-[11px] text-slate-600">
                {issuer.accreditation} • {issuer.state}, {issuer.country}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <QRCodeSVG value={verificationUrl} size={74} level="H" includeMargin={false} />
            <span className="text-[9px] font-mono text-slate-600 mt-1 font-semibold">
              INSTANT QR CHECK
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-block px-6 py-1.5 rounded-full bg-blue-950 text-white font-serif text-sm font-bold tracking-widest uppercase shadow-xs">
            CERTIFICATE OF MIGRATION & INSTITUTIONAL TRANSFER
          </div>
          <div className="text-xs text-blue-900 font-mono font-semibold mt-1">
            Serial No: {data.certificateNumber || 'IITD/MIG/2024/0512'}
          </div>
        </div>
      </div>

      {/* Main Legal Declaration Text */}
      <div className="bg-white/80 rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4 font-serif text-sm text-slate-800 leading-relaxed mb-6">
        <p>
          This is to officially certify that <strong className="text-slate-950 font-sans">{student.fullName}</strong>, 
          bearing Roll Number <strong className="text-blue-900 font-mono font-sans">{student.rollNumber}</strong> and 
          Enrollment No. <strong className="text-slate-900 font-mono font-sans">{student.enrollmentNumber}</strong>, 
          was a bona fide student of the <strong className="text-slate-950 font-sans">{student.department}</strong> pursuing 
          <strong className="text-slate-950 font-sans"> {student.program}</strong> during the academic period 
          <strong className="text-slate-950 font-sans"> {student.admissionYear} – {student.completionYear}</strong>.
        </p>

        <p>
          The Institution has <strong className="text-emerald-800 underline decoration-emerald-500 font-sans">NO OBJECTION</strong> to 
          the candidate continuing their education, seeking admission to higher academic degrees in any recognized Indian 
          or foreign University/Institute, or migrating for professional employment and consular visa endorsements.
        </p>

        <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs font-sans text-emerald-950 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Clearance & Non-Encumbrance Status Verified On-Chain:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-[11px] text-slate-700">
              <span>✓ Central Library Dues: Cleared</span>
              <span>✓ Hostel / Mess Dues: Cleared</span>
              <span>✓ Disciplinary Status: Spotless (Conduct: {data.conductGrade || 'Exemplary'})</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 italic">
          Target Scope: {data.targetInstitutionOrGeneral}
        </p>
      </div>

      {/* Institutional Seals & Registrar Signature */}
      <div className="border-t-2 border-blue-900/20 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {/* Hologram Stamp */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="w-24 h-24 rounded-full border-2 border-blue-600/40 hologram-shimmer flex flex-col items-center justify-center p-2 shadow-inner text-center">
            <ShieldCheck className="w-6 h-6 text-blue-950 mb-0.5" />
            <span className="text-[7px] font-black uppercase text-blue-950 tracking-tighter">
              MIGRATION REGISTRY SEAL
            </span>
            <span className="text-[6px] font-mono text-slate-800">
              TX: {credential.proof.txHash.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Legal Authority Note */}
        <div className="text-center text-[10px] text-slate-600 space-y-1">
          <p>Effective Date of Leaving: <strong className="text-slate-800">{data.leavingDate || '2024-06-30'}</strong></p>
          <p>Issued under AICTE / UGC Decentralized Credential Framework</p>
          <p className="font-mono text-[9px] text-slate-500">DID: {issuer.did.slice(0, 24)}...</p>
        </div>

        {/* Registrar Signature */}
        <div className="text-center sm:text-right">
          <div className="font-serif italic font-bold text-blue-950 text-base border-b border-slate-400 inline-block px-4 pb-1 mb-1">
            Dr. R. K. Mukherjee, IAS (Retd.)
          </div>
          <p className="text-[11px] font-bold text-slate-800 uppercase font-serif">
            Registrar & Secretary
          </p>
          <p className="text-[10px] text-slate-500">
            {issuer.name}
          </p>
          <p className="text-[9px] font-mono text-slate-400 mt-1">
            Block Height: #{credential.proof.blockNumber}
          </p>
        </div>
      </div>

      {/* Footer Audit Hash */}
      <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SHA-256: {credential.proof.documentHash.slice(0, 18)}...</span>
        </div>
        <div className="text-emerald-700 font-semibold">
          ✓ Tamper-Proof Cryptographic Migration Seal
        </div>
      </div>

    </div>
  );
};
