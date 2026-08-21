import React, { useState } from 'react';
import { VerifiableCredential, AccessGrant } from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { 
  ShieldCheck, 
  Lock, 
  Link2, 
  Copy, 
  Check, 
  Calendar, 
  Eye, 
  EyeOff, 
  Sparkles,
  Building,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SelectiveDisclosureModalProps {
  credential: VerifiableCredential;
  onClose: () => void;
  onGrantCreated: () => void;
}

export const SelectiveDisclosureModal: React.FC<SelectiveDisclosureModalProps> = ({
  credential,
  onClose,
  onGrantCreated,
}) => {
  const [granteeName, setGranteeName] = useState('Stanford University Admissions');
  const [granteeRole, setGranteeRole] = useState<AccessGrant['granteeRole']>('UNIVERSITY');
  const [durationDays, setDurationDays] = useState(30);
  const [allowedFields, setAllowedFields] = useState<AccessGrant['allowedFields']>('FULL');
  const [generatedGrant, setGeneratedGrant] = useState<AccessGrant | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateGrant = () => {
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const accessCode = `${granteeRole.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newGrant = ledgerService.createAccessGrant({
      credentialId: credential.id,
      granteeName,
      granteeRole,
      expiresAt,
      accessCode,
      allowedFields,
    });

    setGeneratedGrant(newGrant);
    onGrantCreated();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  const shareUrl = generatedGrant
    ? `${window.location.origin}?accessCode=${generatedGrant.accessCode}&credId=${credential.id}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Granular Permissioned Sharing</h3>
              <p className="text-xs text-slate-400">Self-Sovereign Access Control & Selective Disclosure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {!generatedGrant ? (
          <div className="space-y-4 text-xs">
            {/* Target Stakeholder */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Grant Access To (Organization / Officer Name):
              </label>
              <input
                type="text"
                value={granteeName}
                onChange={(e) => setGranteeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Stanford University Admissions or US Embassy Visa Division"
              />
            </div>

            {/* Stakeholder Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Stakeholder Category:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGranteeRole('UNIVERSITY')}
                  className={`p-2 rounded-lg border text-center flex flex-col items-center space-y-1 transition-colors ${
                    granteeRole === 'UNIVERSITY'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-[11px] font-medium">University</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGranteeRole('EMPLOYER')}
                  className={`p-2 rounded-lg border text-center flex flex-col items-center space-y-1 transition-colors ${
                    granteeRole === 'EMPLOYER'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Employer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGranteeRole('EMBASSY')}
                  className={`p-2 rounded-lg border text-center flex flex-col items-center space-y-1 transition-colors ${
                    granteeRole === 'EMBASSY'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Visa Embassy</span>
                </button>
              </div>
            </div>

            {/* Disclosure Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Disclosure & Privacy Level:
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800">
                  <input
                    type="radio"
                    name="disclosure"
                    checked={allowedFields === 'FULL'}
                    onChange={() => setAllowedFields('FULL')}
                    className="text-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-white block">Full Official Transcript</span>
                    <span className="text-slate-400 text-[11px]">
                      Includes all 8 semester courses, marks, GPA, and digital cryptographic seal.
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer hover:bg-slate-800">
                  <input
                    type="radio"
                    name="disclosure"
                    checked={allowedFields === 'SELECTIVE_GPA_ONLY'}
                    onChange={() => setAllowedFields('SELECTIVE_GPA_ONLY')}
                    className="text-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-amber-300 block">Selective / GPA-Only Mode</span>
                    <span className="text-slate-400 text-[11px]">
                      Redacts individual course breakdown while mathematically proving CGPA and Degree authenticity.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Expiration Duration */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Access Validity Duration:
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
              >
                <option value={1}>24 Hours (Immediate Single-Use)</option>
                <option value={7}>7 Days (Visa Interview Window)</option>
                <option value={30}>30 Days (University Admission Evaluation)</option>
                <option value={365}>1 Year (Long-Term Employer Verification)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateGrant}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Cryptographic Access Pass</span>
            </button>
          </div>
        ) : (
          /* Grant Success Screen */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Access Pass Generated & Anchored!</span>
              </div>
              <p className="text-xs text-slate-300">
                Authorized for <strong>{generatedGrant.granteeName}</strong> ({generatedGrant.granteeRole}).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">
                Instant Verification Link:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-[11px] select-all"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Access Code:</span>
                <span className="text-amber-400 font-bold">{generatedGrant.accessCode}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Expires At:</span>
                <span className="text-slate-300">{new Date(generatedGrant.expiresAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Privacy Mode:</span>
                <span className="text-blue-400">{generatedGrant.allowedFields}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
            >
              Done & Return to Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
