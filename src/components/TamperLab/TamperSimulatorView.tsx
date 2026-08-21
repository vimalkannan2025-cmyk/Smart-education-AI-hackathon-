import React, { useState, useEffect } from 'react';
import { VerifiableCredential, VerificationReport } from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { computeCredentialPayloadHash, verifyDocumentSignature } from '../../services/cryptoEngine';
import { 
  FlaskConical, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Bug, 
  Lock, 
  Flame,
  ArrowRight,
  Code
} from 'lucide-react';

interface TamperSimulatorViewProps {
  initialCredId?: string;
  credentials: VerifiableCredential[];
  onNavigateToVerifier: (credId: string) => void;
}

export const TamperSimulatorView: React.FC<TamperSimulatorViewProps> = ({
  initialCredId,
  credentials,
  onNavigateToVerifier,
}) => {
  const [selectedCredId, setSelectedCredId] = useState(
    initialCredId || credentials[0]?.id || ''
  );

  // Sync selectedCredId if initialCredId or credentials change
  useEffect(() => {
    if (initialCredId) {
      setSelectedCredId(initialCredId);
    } else if (credentials.length > 0 && (!selectedCredId || !credentials.some(c => c.id === selectedCredId))) {
      setSelectedCredId(credentials[0].id);
    }
  }, [initialCredId, credentials, selectedCredId]);

  const baseCred = credentials.find((c) => c.id === selectedCredId) || credentials[0];

  // Tampered payload state
  const [tamperedFullName, setTamperedFullName] = useState(baseCred?.subject?.fullName || '');
  const [tamperedRollNo, setTamperedRollNo] = useState(baseCred?.subject?.rollNumber || '');
  const [tamperedCgpa, setTamperedCgpa] = useState(baseCred?.subject?.cgpa?.toString() || '9.42');
  const [tamperedSignature, setTamperedSignature] = useState(baseCred?.proof?.signatureValue || '');
  
  // Real-time cryptographic calculation results
  const [originalHash, setOriginalHash] = useState('');
  const [computedCurrentHash, setComputedCurrentHash] = useState('');
  const [isHashValid, setIsHashValid] = useState(true);
  const [isSigValid, setIsSigValid] = useState(true);

  // Sync state on baseCred change
  useEffect(() => {
    if (baseCred) {
      setTamperedFullName(baseCred.subject.fullName);
      setTamperedRollNo(baseCred.subject.rollNumber);
      setTamperedCgpa(baseCred.subject.cgpa.toString());
      setTamperedSignature(baseCred.proof.signatureValue);
      setOriginalHash(baseCred.proof.documentHash);
    }
  }, [baseCred]);

  // Compute live hash and signature on every keystroke
  useEffect(() => {
    if (!baseCred) return;

    const evaluateCrypto = async () => {
      const workingCred = {
        ...baseCred,
        subject: {
          ...baseCred.subject,
          fullName: tamperedFullName,
          rollNumber: tamperedRollNo,
          cgpa: parseFloat(tamperedCgpa) || baseCred.subject.cgpa,
        },
      };

      const newHash = await computeCredentialPayloadHash(workingCred);
      setComputedCurrentHash(newHash);

      const hashMatches = newHash.toLowerCase() === baseCred.proof.documentHash.toLowerCase();
      setIsHashValid(hashMatches);

      const sigMatches = await verifyDocumentSignature(
        newHash,
        tamperedSignature,
        baseCred.issuer.publicKey
      );
      setIsSigValid(sigMatches);
    };

    evaluateCrypto();
  }, [baseCred, tamperedFullName, tamperedRollNo, tamperedCgpa, tamperedSignature]);

  // Preset Attack Handlers
  const applyPresetAttack = (type: 'CGPA' | 'NAME' | 'ROLL' | 'SIGNATURE') => {
    if (!baseCred) return;
    if (type === 'CGPA') {
      setTamperedCgpa('9.98');
    } else if (type === 'NAME') {
      setTamperedFullName('Vikramaditya Singhania');
    } else if (type === 'ROLL') {
      setTamperedRollNo('2020CSB9999');
    } else if (type === 'SIGNATURE') {
      setTamperedSignature('0x0000000000000000000000000000000000000000000000000000000000000000fake');
    }
  };

  const handleReset = () => {
    if (baseCred) {
      setTamperedFullName(baseCred.subject.fullName);
      setTamperedRollNo(baseCred.subject.rollNumber);
      setTamperedCgpa(baseCred.subject.cgpa.toString());
      setTamperedSignature(baseCred.proof.signatureValue);
    }
  };

  const isTampered = !isHashValid || !isSigValid;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border-t-4 border-t-rose-600 border-x border-b border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs border border-rose-500/30 font-semibold flex items-center space-x-1">
                <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
                <span>Cryptographic Anti-Fraud Sandbox</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-Time Cryptanalysis</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Tamper & Forgery Simulation Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Experience firsthand why paper documents and PDFs can be effortlessly faked with photo editing, but altering even <strong>a single byte</strong> in a decentralized verifiable credential instantly breaks the cryptographic math.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedCredId}
              onChange={(e) => setSelectedCredId(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-hidden"
            >
              {credentials.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} - {c.subject.fullName}
                </option>
              ))}
            </select>

            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Attacks Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3">
        <div className="flex items-center space-x-2 text-xs uppercase font-bold text-slate-400 tracking-wider">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>Simulate Black Market / Forgery Attack Scenarios (1-Click)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPresetAttack('CGPA')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left space-y-1 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
              <span>Grade Inflation Attack</span>
              <Bug className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Change student CGPA from {baseCred?.subject?.cgpa ?? '9.42'} to 9.98
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPresetAttack('NAME')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left space-y-1 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
              <span>Identity Impersonation</span>
              <Bug className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Steal credential by modifying candidate name
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPresetAttack('ROLL')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left space-y-1 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
              <span>Roll Number Forgery</span>
              <Bug className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Alter official college enrollment ID
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPresetAttack('SIGNATURE')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left space-y-1 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
              <span>Fake Issuer Signature</span>
              <Bug className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Inject illegitimate cryptographic signature
            </p>
          </button>
        </div>
      </div>

      {/* Main Interactive Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Editable Credential Fields */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Interactive Credential Payload Editor</h3>
              <p className="text-xs text-slate-400">Modify any field below and witness real-time cryptographic failure</p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Live Modifiable
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Candidate Full Name:
              </label>
              <input
                type="text"
                value={tamperedFullName}
                onChange={(e) => setTamperedFullName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono transition-colors text-white ${
                  tamperedFullName !== baseCred.subject.fullName
                    ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                    : 'border-slate-800'
                }`}
              />
              {tamperedFullName !== baseCred.subject.fullName && (
                <span className="text-[10px] text-rose-400 mt-1 block">
                  ⚠️ Altered from original: "{baseCred.subject.fullName}"
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Roll Number / ID:
              </label>
              <input
                type="text"
                value={tamperedRollNo}
                onChange={(e) => setTamperedRollNo(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono transition-colors text-white ${
                  tamperedRollNo !== baseCred.subject.rollNumber
                    ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                    : 'border-slate-800'
                }`}
              />
              {tamperedRollNo !== baseCred.subject.rollNumber && (
                <span className="text-[10px] text-rose-400 mt-1 block">
                  ⚠️ Altered from original: "{baseCred.subject.rollNumber}"
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Cumulative CGPA (out of 10.0):
              </label>
              <input
                type="text"
                value={tamperedCgpa}
                onChange={(e) => setTamperedCgpa(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono transition-colors text-white ${
                  tamperedCgpa !== baseCred.subject.cgpa.toString()
                    ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                    : 'border-slate-800'
                }`}
              />
              {tamperedCgpa !== baseCred.subject.cgpa.toString() && (
                <span className="text-[10px] text-rose-400 mt-1 block">
                  ⚠️ Altered from original CGPA: {baseCred.subject.cgpa}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Issuing University:
              </label>
              <input
                type="text"
                readOnly
                value={baseCred.issuer.name}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 select-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Digital Signature Value:
              </label>
              <textarea
                rows={2}
                value={tamperedSignature}
                onChange={(e) => setTamperedSignature(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono text-[10px] transition-colors text-white ${
                  tamperedSignature !== baseCred.proof.signatureValue
                    ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                    : 'border-slate-800'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Cryptographic Verifier Feedback Engine */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Live Status Card */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-xl text-white transition-all ${
              !isTampered
                ? 'bg-gradient-to-br from-emerald-950/90 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-br from-rose-950/90 to-slate-900 border-rose-500/50 shadow-rose-500/20'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-2xl border ${
                  !isTampered
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                }`}
              >
                {!isTampered ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <ShieldAlert className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1">
                <span
                  className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    !isTampered
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {!isTampered ? 'AUTHENTIC MATCH (0 TAMPERING)' : 'FRAUD DETECTED IN REAL-TIME'}
                </span>

                <h3 className="text-xl font-bold text-white pt-1">
                  {!isTampered
                    ? 'Cryptographic Signatures Aligned'
                    : 'Instant Tamper Breakdown: Broken Proof!'}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {!isTampered
                    ? 'All bytes conform exactly to the original university controller private key assertion.'
                    : 'The canonical SHA-256 digest has mutated. A receiving university admissions office or visa consulate will flag this forgery in 0.4 seconds automatically.'}
                </p>
              </div>
            </div>

            {/* Cryptographic Proof Comparison */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3 font-mono text-[11px]">
              
              {/* Check 1: Hash */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">1. SHA-256 Canonical Digest:</span>
                  {isHashValid ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MATCH</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>MISMATCH (TAMPERED)</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Original: {originalHash}
                </div>
                <div className={`text-[10px] truncate ${isHashValid ? 'text-emerald-400' : 'text-rose-400 font-bold'}`}>
                  Computed: {computedCurrentHash}
                </div>
              </div>

              {/* Check 2: Digital Signature */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">2. Ed25519 University Signature:</span>
                  {isSigValid ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>VALID</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>INVALID SIGNATURE</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  Key: {baseCred.issuer.controllerName} ({baseCred.issuer.id})
                </div>
              </div>

            </div>
          </div>

          {/* Educational Takeaway Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Why Web3 Verifiable Credentials Eliminate Corruption</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              In traditional paper workflows, corrupt clerks or fake certificate brokers forge physical seals and watermarks. Third-party universities must wait months sending physical letters to verify.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              With <strong>AcadChain Verifiable Credentials</strong>, the mathematics of elliptic curve cryptography protects the student. Any forged record is instantly rejected everywhere globally, permanently ending certificate fraud.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
