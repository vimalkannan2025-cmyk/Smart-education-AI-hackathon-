import React, { useState } from 'react';
import { 
  UniversityIssuerInfo, 
  StudentProfile, 
  CredentialType,
  SemesterRecord,
  VerifiableCredential 
} from '../../types';
import { ledgerService } from '../../services/blockchainLedger';
import { 
  Building2, 
  FileText, 
  ArrowRightLeft, 
  Award, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle,
  Key,
  Blocks
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IssueCredentialModalProps {
  universities: UniversityIssuerInfo[];
  currentStudent: StudentProfile;
  onClose: () => void;
  onIssued: (credential: VerifiableCredential) => void;
}

export const IssueCredentialModal: React.FC<IssueCredentialModalProps> = ({
  universities,
  currentStudent,
  onClose,
  onIssued,
}) => {
  const [selectedUnivId, setSelectedUnivId] = useState(universities[0]?.id || 'iit-delhi');
  const [credType, setCredType] = useState<CredentialType>('TRANSCRIPT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    credential: VerifiableCredential;
    txHash: string;
    blockNumber: number;
  } | null>(null);

  // Student Form State
  const [studentName, setStudentName] = useState(currentStudent.fullName);
  const [rollNumber, setRollNumber] = useState(currentStudent.rollNumber);
  const [enrollmentNo, setEnrollmentNo] = useState(currentStudent.enrollmentNumber);
  const [program, setProgram] = useState(currentStudent.program);
  const [department, setDepartment] = useState(currentStudent.department);
  const [cgpa, setCgpa] = useState(currentStudent.cgpa.toString());

  // Migration specifics
  const [migrationDestination, setMigrationDestination] = useState('Admission to Higher Studies in Foreign / Indian Universities & Global Visa Endorsements');
  const [conductGrade, setConductGrade] = useState('Exemplary');
  const [leavingDate, setLeavingDate] = useState('2024-06-30');

  // Degree specifics
  const [degreeTitle, setDegreeTitle] = useState('Bachelor of Technology');
  const [major, setMajor] = useState('Computer Science and Engineering');
  const [convocationNumber, setConvocationNumber] = useState('55th Annual Convocation');

  // Custom courses for Transcript
  const [sampleSemesters, setSampleSemesters] = useState<SemesterRecord[]>([
    {
      semesterNumber: 1,
      term: 'Autumn 2023',
      gpa: 9.4,
      creditsEarned: 21,
      courses: [
        { code: 'CS101', name: 'Computer Programming & Problem Solving', credits: 4, grade: 'A', gradePoints: 10 },
        { code: 'MA101', name: 'Linear Algebra & Calculus', credits: 4, grade: 'A', gradePoints: 10 },
        { code: 'PH101', name: 'Quantum & Classical Mechanics', credits: 4, grade: 'A-', gradePoints: 9 },
        { code: 'EE101', name: 'Basic Electrical Sciences', credits: 4, grade: 'A', gradePoints: 10 },
        { code: 'HS101', name: 'Technical Writing & Ethics', credits: 5, grade: 'B+', gradePoints: 8 },
      ],
    },
    {
      semesterNumber: 2,
      term: 'Spring 2024',
      gpa: 9.6,
      creditsEarned: 22,
      courses: [
        { code: 'CS201', name: 'Data Structures & Algorithms', credits: 5, grade: 'A', gradePoints: 10 },
        { code: 'CS202', name: 'Discrete Mathematics', credits: 4, grade: 'A', gradePoints: 10 },
        { code: 'CS203', name: 'Digital Electronics & Logic Design', credits: 4, grade: 'A', gradePoints: 10 },
        { code: 'CS204', name: 'Computer System Architecture', credits: 4, grade: 'A-', gradePoints: 9 },
        { code: 'MA102', name: 'Probability & Statistics', credits: 5, grade: 'A', gradePoints: 10 },
      ],
    },
  ]);

  const selectedUniv = universities.find((u) => u.id === selectedUnivId) || universities[0];

  const handleIssue = async () => {
    setIsProcessing(true);

    try {
      const studentPayload: StudentProfile = {
        ...currentStudent,
        fullName: studentName,
        rollNumber,
        enrollmentNumber: enrollmentNo,
        program,
        department,
        cgpa: parseFloat(cgpa) || 9.0,
      };

      let credentialData: any = {};
      let title = '';

      if (credType === 'TRANSCRIPT') {
        title = `Official Consolidated Academic Transcript (${sampleSemesters.length} Semesters)`;
        credentialData = {
          student: studentPayload,
          issuer: selectedUniv,
          semesters: sampleSemesters,
          totalCreditsRequired: 160,
          totalCreditsEarned: sampleSemesters.reduce((acc, s) => acc + s.creditsEarned, 0),
          gradingScale: '10.0 Point Scale (Absolute & Relative Grading)',
          mediumOfInstruction: 'English',
          provisionalRank: 'Rank 1 / 140 (Top 1%)',
        };
      } else if (credType === 'MIGRATION_CERTIFICATE') {
        title = 'Official Academic Migration & Institutional Transfer Certificate';
        credentialData = {
          student: studentPayload,
          issuer: selectedUniv,
          certificateNumber: `${selectedUniv.id.toUpperCase()}/MIG/${Date.now().toString().slice(-4)}`,
          targetInstitutionOrGeneral: migrationDestination,
          noObjectionDeclared: true,
          clearanceDetails: {
            libraryDuesCleared: true,
            hostelDuesCleared: true,
            disciplinaryActionPending: false,
          },
          conductGrade,
          leavingDate,
        };
      } else if (credType === 'DEGREE_CERTIFICATE') {
        title = `Degree of ${degreeTitle} in ${major}`;
        credentialData = {
          student: studentPayload,
          issuer: selectedUniv,
          degreeTitle,
          major,
          conferredDate: new Date().toISOString().split('T')[0],
          convocationNumber,
          honors: 'First Class with Distinction',
          chancellorName: 'Dr. Hari S. Bhartia',
          viceChancellorName: selectedUniv.controllerName,
        };
      }

      // Execute cryptographic signing and on-chain anchoring
      const result = await ledgerService.issueCredential({
        type: credType,
        title,
        issuer: selectedUniv,
        student: studentPayload,
        data: credentialData,
      });

      setSuccessResult({
        credential: result.credential,
        txHash: result.transaction.txHash,
        blockNumber: result.transaction.blockNumber,
      });

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onIssued(result.credential);
    } catch (e) {
      console.error('Error issuing credential:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Issue Official Academic Credential</h3>
              <p className="text-xs text-slate-400">Cryptographically signed & anchored directly to consortium ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {!successResult ? (
          <div className="space-y-4 text-xs">
            
            {/* Step 1: Select Issuing Institution */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Issuing University (Controller of Examinations):
              </label>
              <select
                value={selectedUnivId}
                onChange={(e) => setSelectedUnivId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.accreditation})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Document Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Academic Document Type:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCredType('TRANSCRIPT')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center space-y-1.5 transition-all ${
                    credType === 'TRANSCRIPT'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-semibold">Consolidated Transcript</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCredType('MIGRATION_CERTIFICATE')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center space-y-1.5 transition-all ${
                    credType === 'MIGRATION_CERTIFICATE'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  <span className="text-xs font-semibold">Migration Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCredType('DEGREE_CERTIFICATE')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center space-y-1.5 transition-all ${
                    credType === 'DEGREE_CERTIFICATE'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-semibold">Degree Parchment</span>
                </button>
              </div>
            </div>

            {/* Step 3: Student Details */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Student Record Verification
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Roll / Student ID</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Cumulative CGPA</label>
                  <input
                    type="text"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Academic Program / Degree</label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Document-Specific Fields */}
            {credType === 'MIGRATION_CERTIFICATE' && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                  Migration & Clearance Controls
                </h4>
                <div>
                  <label className="block text-slate-400 mb-1">Scope & Purpose</label>
                  <input
                    type="text"
                    value={migrationDestination}
                    onChange={(e) => setMigrationDestination(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Institutional Conduct</label>
                    <select
                      value={conductGrade}
                      onChange={(e) => setConductGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="Exemplary">Exemplary</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Date of Leaving</label>
                    <input
                      type="date"
                      value={leavingDate}
                      onChange={(e) => setLeavingDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    >
                    </input>
                  </div>
                </div>
              </div>
            )}

            {/* Cryptographic Signing Info Note */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
              <Key className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                Will sign with {selectedUniv.controllerName}'s registered ECDSA/Ed25519 private key and broadcast to Academic Consortium Smart Contract.
              </div>
            </div>

            <button
              onClick={handleIssue}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Computing SHA-256 & Anchoring Block...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Digitally Sign & Anchor on AcadChain Ledger</span>
                </>
              )}
            </button>

          </div>
        ) : (
          /* Issuance Success Screen */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-base">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <span>Credential Successfully Issued & Anchored!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tamper-proof W3C Verifiable Credential has been issued to student wallet with non-repudiable university signature.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Credential ID:</span>
                <span className="text-white font-bold">{successResult.credential.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Block Height:</span>
                <span className="text-amber-400 font-bold">#{successResult.blockNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transaction Hash:</span>
                <span className="text-blue-400 truncate max-w-[200px]">{successResult.txHash}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Document Hash:</span>
                <span className="text-emerald-400 truncate max-w-[200px]">{successResult.credential.proof.documentHash}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Done & Return to Issuer Registry
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
