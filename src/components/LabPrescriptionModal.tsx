import React, { useState } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { buildCaseReport, buildCaseReportText, exportReadiness } from '../lib/caseReport';
import { copyToClipboard } from '../lib/validationSchemas';
import { 
  CIELABColor, 
  ClinicalCase, 
  MunsellColor, 
  ShadeMatchResult, 
  SubstrateConfig, 
  ToothZone, 
  ZoneData 
} from '../types/dental';
import { 
  X, 
  Printer, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  Sliders, 
  User, 
  Hash, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCase: ClinicalCase;
  targetMatch: ShadeMatchResult;
  sampledLab: CIELABColor;
  munsell: MunsellColor;
  zones: Record<ToothZone, ZoneData>;
  substrate: SubstrateConfig;
  crossPolarized: boolean;
}

export const LabPrescriptionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  targetMatch, 
  zones 
}) => {
  const { state } = useCaseContext();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'card' | 'raw'>('card');

  if (!isOpen) return null;

  const text = buildCaseReportText(state, targetMatch, zones);
  const report = buildCaseReport(state, targetMatch, zones);
  const blocked = exportReadiness(state, targetMatch);

  const handleCopy = async () => {
    const result = await copyToClipboard(text);
    setMessage(result.success ? 'Copied' : result.error || 'Copy failed');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="lab-prescription-title" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
    >
      <div 
        id="modal-lab-prescription" 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl border border-neutral-300 relative text-neutral-900"
      >
        {/* Modal Top Header (Screen Only) */}
        <div className="print:hidden flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="lab-prescription-title" className="text-xl font-bold text-neutral-900">
                Laboratory shade report
              </h2>
              <p className="text-xs text-neutral-500">
                Official dental laboratory work order slip and colorimetric prescription.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-300 text-xs font-semibold mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'card'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Work Order Slip
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'raw'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Raw Data Text
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {blocked && (
            <p role="alert" className="text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-semibold">
              {blocked}
            </p>
          )}

          {message && (
            <p role="status" className="text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </p>
          )}

          {activeTab === 'raw' ? (
            <pre className="whitespace-pre-wrap break-words text-xs font-mono bg-neutral-900 text-neutral-100 p-5 rounded-xl leading-relaxed border border-neutral-800">
              {text}
            </pre>
          ) : (
            /* Printable Prescription Sheet */
            <div className="border border-neutral-300 rounded-2xl p-6 sm:p-8 space-y-6 bg-white shadow-sm print:border-none print:shadow-none print:p-0">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-neutral-900">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                    Clinical Prosthodontic Prescription
                  </div>
                  <h1 className="text-2xl font-black text-neutral-950 mt-1">
                    DENTAL LABORATORY WORK ORDER
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Certified Clinical Colorimetry &bull; ISO/TR 28642 Standards Compliant
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs space-y-1">
                  <div className="font-mono text-neutral-600">
                    Date: <strong className="text-neutral-900">{new Date().toLocaleDateString()}</strong>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    Case Ref: {state.caseSessionId.slice(0, 12)}
                  </div>
                </div>
              </div>

              {/* Patient & Prescription Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Patient Identification
                  </span>
                  <div className="text-sm font-bold text-neutral-900 font-mono">
                    {state.currentCase.patientInitials || 'Unassigned'}
                  </div>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Tooth Number (Universal / FDI)
                  </span>
                  <div className="text-sm font-bold text-neutral-900 font-mono">
                    {state.currentCase.toothNumber || 'Unassigned'}
                  </div>
                </div>

                <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    Target Classical Shade
                  </span>
                  <div className="text-sm font-black text-teal-950">
                    {targetMatch?.shade.name || 'Not sampled'}
                  </div>
                </div>
              </div>

              {/* Photographic & Optical Protocol Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
                  <strong className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">
                    Photographic Calibration
                  </strong>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Cross-Polarized Lighting:</span>
                    <strong className="font-mono">{state.crossPolarized ? 'Confirmed' : 'Not Confirmed'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">18% Neutral Gray Card:</span>
                    <strong className="font-mono">{state.isCalibrated ? 'Applied (Linear Light)' : 'Uncalibrated'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Image Source:</span>
                    <strong className="font-mono">{state.customImage ? 'Patient Photo' : 'Simulation Demo'}</strong>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
                  <strong className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">
                    Preparation &amp; Substrate Specs
                  </strong>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Stump (Die) Shade:</span>
                    <strong className="font-mono">{state.substrate.prepShade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Restoration Type:</span>
                    <strong className="font-mono capitalize">{state.substrate.restorationType.replace('_', ' ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Ceramic Material:</span>
                    <strong className="font-mono">{state.substrate.material}</strong>
                  </div>
                </div>
              </div>

              {/* Zonal Colorimetric Prescription Table */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-300 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Tooth Zone</th>
                      <th className="p-3">Sample Status</th>
                      <th className="p-3">CIE L*a*b* Coordinates</th>
                      <th className="p-3">Matching Shade</th>
                      <th className="p-3">ΔE₀₀ (CIEDE2000)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(['cervical', 'middle', 'incisal'] as ToothZone[]).map((key) => {
                      const z = zones[key];
                      const label = key === 'middle' ? 'Body (Middle)' : key[0].toUpperCase() + key.slice(1);
                      return (
                        <tr key={key} className="hover:bg-neutral-50/50">
                          <td className="p-3 font-bold text-neutral-900">{label}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              z.isMeasured ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              {z.isMeasured ? 'MEASURED' : 'UNMEASURED'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-neutral-700">
                            {z.isMeasured ? `L* ${z.sampledLab.L.toFixed(1)}, a* ${z.sampledLab.a.toFixed(1)}, b* ${z.sampledLab.b.toFixed(1)}` : '—'}
                          </td>
                          <td className="p-3 font-bold text-neutral-900 font-mono">
                            {z.isMeasured ? z.matchedClassical.shade.code : 'Not measured'}
                          </td>
                          <td className="p-3 font-mono text-neutral-700">
                            {z.isMeasured ? z.matchedClassical.deltaE00.toFixed(2) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ceramist Notes & Sign-off Section */}
              <div className="pt-4 border-t border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1 text-neutral-600">
                  <strong className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Special Instructions / Doctor Notes
                  </strong>
                  <p className="italic text-neutral-700 leading-snug">
                    {state.currentCase.clinicalNotes || 'No special notes supplied.'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-baseline border-b border-neutral-400 pb-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Clinician Signature:</span>
                    <span className="font-mono text-neutral-400 text-xs">_____________________</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-neutral-400 pb-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Ceramist Tech Sign-Off:</span>
                    <span className="font-mono text-neutral-400 text-xs">_____________________</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Screen Only) */}
        <div className="print-actions-hidden flex flex-wrap items-center justify-between gap-3 p-5 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              disabled={!!blocked}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold disabled:opacity-40 shadow-sm transition"
              onClick={handleCopy}
            >
              <Copy className="w-3.5 h-3.5 text-teal-600" />
              <span>Copy report</span>
            </button>

            <button
              disabled={!!blocked}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold disabled:opacity-40 shadow-sm transition"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 text-teal-600" />
              <span>Print report</span>
            </button>
          </div>

          <button
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
