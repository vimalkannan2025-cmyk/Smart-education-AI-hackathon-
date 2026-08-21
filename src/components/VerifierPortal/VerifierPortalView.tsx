import React, { useState, useEffect } from 'react';
import { VerifiableCredential, VerificationReport } from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { VerificationAuditReport } from './VerificationAuditReport';
import { 
  Search, 
  Upload, 
  FileText, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Key, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode
} from 'lucide-react';

interface VerifierPortalViewProps {
  initialCredId?: string;
  credentials: VerifiableCredential[];
  onNavigateToTamperLab: (credId: string) => void;
}

export const VerifierPortalView: React.FC<VerifierPortalViewProps> = ({
  initialCredId,
  credentials,
  onNavigateToTamperLab,
}) => {
  const [verifierName, setVerifierName] = useState('Stanford University - Graduate Admissions');
  const [verifierRole, setVerifierRole] = useState<'UNIVERSITY' | 'EMPLOYER' | 'EMBASSY'>('UNIVERSITY');
  const [searchCodeOrId, setSearchCodeOrId] = useState(initialCredId || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialCredId) {
      setSearchCodeOrId(initialCredId);
      runVerification(initialCredId);
    }
  }, [initialCredId]);

  const runVerification = async (targetIdOrCode: string, jsonPayload?: any) => {
    setIsVerifying(true);
    setVerificationReport(null);

    // Simulate minor asynchronous cryptographic network & consensus verification roundtrip
    await new Promise((res) => setTimeout(res, 400));

    try {
      let targetCred: any = jsonPayload;

      if (!targetCred) {
        // Search in ledger credentials by ID or TxHash or Access Code
        const grants = ledgerService.getAccessGrants();
        const matchingGrant = grants.find(
          (g) => g.accessCode.toLowerCase() === targetIdOrCode.trim().toLowerCase()
        );

        if (matchingGrant) {
          matchingGrant.viewsCount += 1;
          matchingGrant.lastViewedAt = new Date().toISOString();
          targetCred = ledgerService.getCredentialById(matchingGrant.credentialId);
        } else {
          targetCred = ledgerService.getCredentialById(targetIdOrCode.trim());
        }
      }

      if (targetCred) {
        const report = await ledgerService.verifyCredential(targetCred, {
          name: verifierName,
          purpose: `${verifierRole} Verification of Academic Integrity`,
        });
        setVerificationReport(report);
      } else {
        setVerificationReport({
          status: 'NOT_FOUND',
          verifiedAt: new Date().toISOString(),
          checks: [
            {
              step: 'LOOKUP',
              name: 'Academic Registry Identifier Match',
              passed: false,
              details: `No record found on AcadChain ledger matching ID/Code: "${targetIdOrCode}".`,
            },
          ],
          summary: `Record lookup failed. The certificate identifier or access code does not exist on the academic consortium ledger.`,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target?.result as string);
          runVerification(parsedJson.id || 'UPLOADED_FILE', parsedJson);
        } catch (err) {
          alert('Invalid JSON credential file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target?.result as string);
          runVerification(parsedJson.id || 'UPLOADED_FILE', parsedJson);
        } catch (err) {
          alert('Invalid JSON credential file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border-t-4 border-t-blue-600 border-x border-b border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/30 font-semibold">
                Third-Party Instant Verifier Gateway
              </span>
              <span className="text-xs text-slate-400 font-mono">Consensus Zero-Knowledge Compatible</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Instant Academic Transcript & Migration Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify degree transcripts, migration clearances, and diplomas directly against the cryptographically signed ledger in 0.4 seconds. No manual emails or university clerk delays.
            </p>
          </div>

          {/* Verifier Identity Controls */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
              Simulate Verifier Organization:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setVerifierRole('UNIVERSITY');
                  setVerifierName('Stanford University Admissions');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
                  verifierRole === 'UNIVERSITY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Univ Admissions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerifierRole('EMBASSY');
                  setVerifierName('US Consulate Visa Section New Delhi');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
                  verifierRole === 'EMBASSY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Visa Embassy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerifierRole('EMPLOYER');
                  setVerifierName('Google Background Verification (First Advantage)');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-colors ${
                  verifierRole === 'EMPLOYER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Employer / HR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Input Hub */}
      {!verificationReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Input Box */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
            <div className="space-y-1 pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Search className="w-5 h-5 text-emerald-400" />
                <span>Enter Certificate ID, Access Passcode, or Blockchain Tx Hash</span>
              </h2>
              <p className="text-xs text-slate-400">
                Instantly validates cryptographic payload hash, digital signature, and revocation status
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchCodeOrId}
                    onChange={(e) => setSearchCodeOrId(e.target.value)}
                    placeholder="e.g. cred-transcript-2024-iitd-089 or STANFORD-MSCS-8891 or 0x3a9184..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <button
                  id="btn-run-instant-verify"
                  onClick={() => runVerification(searchCodeOrId)}
                  disabled={!searchCodeOrId.trim() || isVerifying}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/30"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Instant Verify</span>
                    </>
                  )}
                </button>
              </div>

              {/* Drag and Drop JSON Verifiable Credential */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-colors ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <label className="font-semibold text-emerald-400 hover:underline cursor-pointer">
                    Upload W3C JSON Credential file
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>{' '}
                  or drag and drop here
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports raw JSON-LD verifiable credentials from IITs, NITs, and central universities
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 1-Click Quick Presets for Demo Evaluation */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>One-Click Verification Demo Presets</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSearchCodeOrId('cred-transcript-2024-iitd-089');
                  runVerification('cred-transcript-2024-iitd-089');
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-emerald-400">
                    IIT Delhi Consolidated Transcript
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    VALID
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Aarav Sharma • 8 Semesters • CGPA 9.42
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchCodeOrId('cred-migration-2024-iitd-512');
                  runVerification('cred-migration-2024-iitd-512');
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-emerald-400">
                    Official Migration Certificate
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    VALID
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  No Objection Declared • Library & Hostel Cleared
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchCodeOrId('STANFORD-MSCS-8891');
                  runVerification('STANFORD-MSCS-8891');
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-blue-400">
                    Stanford Access Passcode
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    PASSCODE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Code: STANFORD-MSCS-8891
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchCodeOrId('cred-degree-2024-iitd-089');
                  runVerification('cred-degree-2024-iitd-089');
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-amber-400">
                    B.Tech Degree Parchment
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    DEGREE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Conferred at 55th Annual Convocation
                </p>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Verification Result Output */}
      {verificationReport && (
        <VerificationAuditReport
          report={verificationReport}
          onReset={() => {
            setVerificationReport(null);
            setSearchCodeOrId('');
          }}
          onNavigateToTamperLab={() => {
            if (verificationReport.credential?.id) {
              onNavigateToTamperLab(verificationReport.credential.id);
            }
          }}
        />
      )}

    </div>
  );
};
