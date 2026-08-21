import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { VerifiableCredential, DegreeCertificateData } from '../../types';
import { ShieldCheck, Award } from 'lucide-react';

interface DegreeDocumentProps {
  credential: VerifiableCredential;
}

export const DegreeDocument: React.FC<DegreeDocumentProps> = ({ credential }) => {
  const data = credential.data as DegreeCertificateData;
  const student = credential.subject;
  const issuer = credential.issuer;
  const isRevoked = credential.revocationStatus?.isRevoked;

  const verificationUrl = `${window.location.origin}?verifyId=${credential.id}&tx=${credential.proof.txHash}`;

  return (
    <div className="relative bg-white text-slate-900 rounded-2xl p-6 sm:p-12 border-t-4 border-t-blue-600 border-x border-b border-slate-200 shadow-lg overflow-hidden print:p-6 print:border-4 print:shadow-none">
      
      {/* Decorative Geometric Corner Borders */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-600 pointer-events-none"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-600 pointer-events-none"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-600 pointer-events-none"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-600 pointer-events-none"></div>

      {isRevoked && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-800 flex items-center space-x-3">
          <div className="p-2 bg-rose-500 text-white rounded-lg font-bold">REVOKED</div>
          <div>
            <div className="font-bold">This Degree has been officially revoked on-chain</div>
            <div className="text-xs text-rose-700">Reason: {credential.revocationStatus.revocationReason}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2 pb-6 border-b border-slate-200">
        <div className="flex justify-center mb-2">
          {issuer.crestUrl ? (
            <img
              src={issuer.crestUrl}
              alt={issuer.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-600/40 p-1 bg-white shadow-xs"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-900 text-blue-400 flex items-center justify-center font-serif text-3xl font-bold">
              {issuer.name.charAt(0)}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 uppercase">
          {issuer.name}
        </h1>
        <p className="text-xs font-serif italic text-blue-900 max-w-lg mx-auto">
          {issuer.accreditation}
        </p>
        <div className="text-[11px] font-mono text-slate-500">
          Convocation Serial: {data.convocationNumber || '55th Annual Convocation'}
        </div>
      </div>

      {/* Degree Body */}
      <div className="py-8 text-center space-y-5 font-serif text-slate-800">
        <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">
          Upon the recommendation of the Senate, hereby confers upon
        </p>
        
        <h2 className="text-2xl sm:text-4xl font-serif font-black text-blue-950 tracking-tight py-1 font-display">
          {student.fullName}
        </h2>
        
        <p className="text-xs font-mono text-slate-600">
          Roll No: {student.rollNumber} • Enrollment No: {student.enrollmentNumber}
        </p>

        <p className="text-sm text-slate-600">
          the Degree of
        </p>

        <div className="text-xl sm:text-2xl font-serif font-bold text-amber-950 py-1 uppercase tracking-wide">
          {data.degreeTitle || 'Bachelor of Technology'}
        </div>
        
        <p className="text-sm font-semibold text-slate-700">
          in {data.major || student.department}
        </p>

        <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-950 font-sans text-xs font-bold border border-amber-300">
          {data.honors || student.division}
        </div>

        <p className="text-xs text-slate-600 max-w-xl mx-auto pt-2">
          Given under the Seal of the Institute at New Delhi, Republic of India, on this{' '}
          <strong>{new Date(data.conferredDate || credential.issuanceDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
        </p>
      </div>

      {/* Signature & Seal Footer */}
      <div className="border-t border-amber-900/20 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {/* Vice Chancellor */}
        <div className="text-center sm:text-left space-y-1">
          <div className="font-serif italic font-bold text-blue-950 text-base border-b border-slate-400 inline-block px-3 pb-1">
            {data.viceChancellorName || 'Prof. Rangan Banerjee'}
          </div>
          <p className="text-xs font-bold text-slate-900 uppercase font-serif">
            Director / Vice-Chancellor
          </p>
        </div>

        {/* QR Code & Hologram */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-amber-600 hologram-shimmer flex flex-col items-center justify-center p-1 shadow-md mb-2">
            <Award className="w-6 h-6 text-amber-950" />
            <span className="text-[6px] font-black uppercase text-amber-950 tracking-tighter">
              CONVOCATION SEAL
            </span>
          </div>
          <div className="bg-white p-1.5 rounded-lg border border-amber-900/20 shadow-xs">
            <QRCodeSVG value={verificationUrl} size={58} level="H" />
          </div>
          <span className="text-[8px] font-mono text-slate-500 mt-1">VERIFY CERTIFICATE</span>
        </div>

        {/* Chairman / Chancellor */}
        <div className="text-center sm:text-right space-y-1">
          <div className="font-serif italic font-bold text-blue-950 text-base border-b border-slate-400 inline-block px-3 pb-1">
            {data.chancellorName || 'Dr. Hari S. Bhartia'}
          </div>
          <p className="text-xs font-bold text-slate-900 uppercase font-serif">
            Chairman, Board of Governors
          </p>
        </div>
      </div>

      {/* Cryptographic Ledger Proof Banner */}
      <div className="mt-8 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
        <span>SHA-256: {credential.proof.documentHash.slice(0, 20)}...</span>
        <span>BLOCK #{credential.proof.blockNumber}</span>
        <span className="text-emerald-700 font-semibold">✓ Cryptographically Sealed</span>
      </div>

    </div>
  );
};
