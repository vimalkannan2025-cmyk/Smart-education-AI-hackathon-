import React from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Search, 
  FlaskConical, 
  Blocks, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'STUDENT' | 'ISSUER' | 'VERIFIER' | 'TAMPER_LAB' | 'BLOCKCHAIN';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  blockHeight: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  blockHeight,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('STUDENT')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-sm flex items-center justify-center border border-blue-400/40">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">
                  AcadChain<span className="text-blue-400">.io</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Web3 Impact
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-normal">
                Verifiable Transcript & Migration Infrastructure
              </p>
            </div>
          </div>

          {/* Stakeholder Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <button
              id="nav-tab-student"
              onClick={() => setActiveTab('STUDENT')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Student Wallet</span>
              <span className="md:hidden">Student</span>
            </button>

            <button
              id="nav-tab-issuer"
              onClick={() => setActiveTab('ISSUER')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ISSUER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">University Issuer</span>
              <span className="md:hidden">Issuer</span>
            </button>

            <button
              id="nav-tab-verifier"
              onClick={() => setActiveTab('VERIFIER')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'VERIFIER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Instant Verifier</span>
              <span className="md:hidden">Verifier</span>
            </button>

            <button
              id="nav-tab-tamper-lab"
              onClick={() => setActiveTab('TAMPER_LAB')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'TAMPER_LAB'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Anti-Fraud Lab</span>
              <span className="md:hidden">Lab</span>
            </button>

            <button
              id="nav-tab-blockchain"
              onClick={() => setActiveTab('BLOCKCHAIN')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'BLOCKCHAIN'
                  ? 'bg-slate-800 text-blue-300 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Blocks className="w-4 h-4" />
              <span className="hidden md:inline">Ledger & Impact</span>
              <span className="md:hidden">Ledger</span>
            </button>
          </nav>

          {/* Right Network Status & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">Consortium L2</span>
              <span className="font-mono text-blue-400 font-semibold">#{blockHeight}</span>
            </div>

            <button
              id="btn-reset-demo"
              onClick={onResetData}
              title="Reset Demo Data"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
