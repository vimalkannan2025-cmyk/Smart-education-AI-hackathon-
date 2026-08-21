import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { VerifiableCredential, TranscriptData } from '../../types';
import { ShieldCheck, CheckCircle2, Award, Calendar, Hash, FileCheck, QrCode } from 'lucide-react';

interface TranscriptDocumentProps {
  credential: VerifiableCredential;
  onVerifyNow?: () => void;
  onOpenSelectiveShare?: () => void;
  selectiveMode?: 'FULL' | 'SELECTIVE_GPA_ONLY';
}

export const TranscriptDocument: React.FC<TranscriptDocumentProps> = ({
  credential,
  onVerifyNow,
  onOpenSelectiveShare,
  selectiveMode = 'FULL',
}) => {
  const data = credential.data as TranscriptData;
  const student = credential.subject;
  const issuer = credential.issuer;
  const isRevoked = credential.revocationStatus?.isRevoked;

  const verificationUrl = `${window.location.origin}?verifyId=${credential.id}&tx=${credential.proof.txHash}`;

  return (
    <div className="relative bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border-t-4 border-t-blue-600 border-x border-b border-slate-200 shadow-lg overflow-hidden print:p-4 print:border-2 print:shadow-none">
      
      {/* Security Watermark Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center rotate-[-30deg]">
        <span className="text-8xl font-black uppercase tracking-widest text-slate-900">
          ACADEMIC LEDGER VERIFIED
        </span>
      </div>

      {/* Revocation Banner if Revoked */}
      {isRevoked && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-800 flex items-center space-x-3">
          <div className="p-2 bg-rose-500 text-white rounded-lg font-bold">REVOKED</div>
          <div>
            <div className="font-bold">This credential has been officially revoked on-chain</div>
            <div className="text-xs text-rose-700">Reason: {credential.revocationStatus.revocationReason}</div>
          </div>
        </div>
      )}

      {/* Official Header */}
      <div className="relative border-b-2 border-slate-200 pb-6 mb-6">
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
              <div className="w-16 h-16 rounded-full bg-slate-900 text-blue-400 flex items-center justify-center font-serif text-2xl font-bold">
                {issuer.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 uppercase">
                {issuer.name}
              </h1>
              <p className="text-xs font-medium text-blue-900 font-serif">
                {issuer.accreditation}
              </p>
              <p className="text-[11px] text-slate-600">
                {issuer.state}, {issuer.country} • Estd. {issuer.establishedYear}
              </p>
            </div>
          </div>

          {/* QR Code Anchor */}
          <div className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <QRCodeSVG value={verificationUrl} size={74} level="H" includeMargin={false} />
            <span className="text-[9px] font-mono text-slate-600 mt-1 font-semibold">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-950 font-serif text-sm font-bold tracking-wider uppercase border border-blue-200">
            OFFICIAL CONSOLIDATED GRADE TRANSCRIPT
          </span>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            W3C VERIFIABLE CREDENTIAL • MERKLE TREE ROOT: {credential.proof.merkleRoot.slice(0, 16)}...
          </div>
        </div>
      </div>

      {/* Student Metadata Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Candidate Full Name:</span>
          <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Roll / Student ID:</span>
          <span className="font-mono font-bold text-blue-900 text-sm">{student.rollNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Enrollment / Registration:</span>
          <span className="font-mono font-medium text-slate-800">{student.enrollmentNumber}</span>
        </div>
        <div className="md:col-span-2">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Degree Program:</span>
          <span className="font-semibold text-slate-900">{student.program}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">Cumulative GPA (CGPA):</span>
          <span className="font-mono font-black text-base text-emerald-800">
            {student.cgpa} / 10.0
          </span>
          <span className="text-[10px] text-emerald-700 ml-1.5 font-medium">({student.division})</span>
        </div>
      </div>

      {/* Semesters Marksheet Breakdown */}
      {selectiveMode === 'FULL' ? (
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-700" />
              <span>Comprehensive Semester Performance Record</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Credits Earned: {data.totalCreditsEarned} / {data.totalCreditsRequired}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.semesters?.map((sem) => (
              <div
                key={sem.semesterNumber}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm hover:border-amber-900/30 transition-colors"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-serif font-bold text-xs text-slate-800">
                    Semester {sem.semesterNumber}: {sem.term}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold">
                      SGPA: {sem.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {sem.courses?.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 text-[11px]"
                    >
                      <div className="flex items-center space-x-1.5 truncate max-w-[70%]">
                        <span className="font-mono font-semibold text-slate-500">{c.code}</span>
                        <span className="truncate text-slate-700">{c.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-slate-400 text-[10px]">{c.credits} cr</span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            c.grade.startsWith('A')
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.grade.startsWith('B')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Selective Disclosure Mode (Privacy Preserving View) */
        <div className="p-6 bg-blue-50/70 border-2 border-dashed border-blue-300 rounded-xl my-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-blue-900">Zero-Knowledge / Selective Disclosure Active</h4>
          <p className="text-xs text-blue-700 max-w-md mx-auto mt-1">
            Individual course mark breakdowns are redacted by student privacy policy. The Overall CGPA ({student.cgpa}/10.0), Degree Status, and Cryptographic Signature remain 100% mathematically proven.
          </p>
        </div>
      )}

      {/* Official Signatures & Seal Footer */}
      <div className="border-t-2 border-amber-900/30 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {/* Holographic Security Stamp */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="w-24 h-24 rounded-full border-2 border-amber-600/40 hologram-shimmer flex flex-col items-center justify-center p-2 shadow-inner text-center">
            <ShieldCheck className="w-6 h-6 text-amber-900 mb-0.5" />
            <span className="text-[7px] font-black uppercase text-amber-950 tracking-tighter">
              CRYPTOGRAPHIC SECURE SEAL
            </span>
            <span className="text-[6px] font-mono text-slate-800">
              BLOCK #{credential.proof.blockNumber}
            </span>
          </div>
        </div>

        {/* Medium & Accreditation Note */}
        <div className="text-center text-[10px] text-slate-600 space-y-1">
          <p>Medium of Instruction: <strong className="text-slate-800">{data.mediumOfInstruction}</strong></p>
          <p>Grading Standard: <strong className="text-slate-800">{data.gradingScale}</strong></p>
          <p className="font-mono text-[9px] text-slate-500">
            DID: {issuer.did.slice(0, 24)}...
          </p>
        </div>

        {/* Controller of Examinations Signature */}
        <div className="text-center sm:text-right">
          <div className="font-serif italic font-bold text-blue-950 text-base border-b border-slate-400 inline-block px-4 pb-1 mb-1">
            {issuer.controllerName}
          </div>
          <p className="text-[11px] font-bold text-slate-800 uppercase font-serif">
            Controller of Examinations
          </p>
          <p className="text-[10px] text-slate-500">
            {issuer.name}
          </p>
          <p className="text-[9px] font-mono text-slate-400 mt-1">
            Issued: {new Date(credential.issuanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Cryptographic Proof Footer Bar */}
      <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SHA-256: {credential.proof.documentHash.slice(0, 18)}...</span>
        </div>
        <div>
          <span>TX: {credential.proof.txHash.slice(0, 18)}...</span>
        </div>
        <div className="text-emerald-700 font-semibold">
          ✓ On-Chain Verified
        </div>
      </div>

    </div>
  );
};
