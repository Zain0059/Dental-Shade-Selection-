import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { buildCaseReport, buildCaseReportText, exportReadiness } from '../../lib/caseReport';
import { copyToClipboard, isChecklistComplete } from '../../lib/validationSchemas';
import { 
  ClinicalCase, 
  SubstrateConfig, 
  ShadeMatchResult, 
  ZoneData, 
  CIELABColor, 
  RGBColor, 
  ToothZone 
} from '../../types/dental';
import { 
  FileText, 
  Download, 
  Copy, 
  Printer, 
  RotateCcw, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  User,
  Hash,
  Activity
} from 'lucide-react';

interface Step3ExportOrderProps {
  currentCase: ClinicalCase;
  substrate: SubstrateConfig;
  topMatch: ShadeMatchResult;
  threeDMatch: ShadeMatchResult;
  zones: Record<ToothZone, ZoneData>;
  sampledLab: CIELABColor;
  sampledRgb: RGBColor;
  crossPolarized: boolean;
  allChecklistPassed: boolean;
  onOpenLabPrescription: () => void;
  onOpenAiAnalysis: () => void;
  isAiLoading: boolean;
  onStartNewCase?: () => void;
  onPrevStep: () => void;
  aiResult?: any;
  isAiRecipeStale?: boolean;
  childrenCanvas?: React.ReactNode;
}

export const Step3ExportOrder: React.FC<Step3ExportOrderProps> = ({ 
  topMatch, 
  threeDMatch,
  zones, 
  onOpenLabPrescription, 
  onPrevStep, 
  onStartNewCase 
}) => {
  const { state } = useCaseContext();
  const [message, setMessage] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const blocked = exportReadiness(state, topMatch);
  const reportText = buildCaseReportText(state, topMatch, zones);
  const report = buildCaseReport(state, topMatch, zones);
  const protocolPassed = isChecklistComplete(state.checklist);

  const download = () => {
    if (blocked) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `DentalShade_${state.currentCase.patientInitials}_${state.currentCase.toothNumber}`.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopy = async () => {
    const result = await copyToClipboard(reportText);
    setMessage(result.success ? 'Prescription copied to clipboard!' : result.error || 'Copy failed');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 space-y-6 shadow-sm min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Review &amp; Export Laboratory Prescription
            </h2>
            <p className="text-xs text-neutral-500">
              Validated spectrophotometric data, substrate masking parameters, and CAD/CAM fabrication record.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            state.customImage
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state.customImage ? 'bg-teal-600' : 'bg-amber-500'}`} />
            {state.customImage ? 'Patient Photograph Verified' : 'Illustrated Demo Simulation'}
          </span>
        </div>
      </div>

      {/* Readiness Alert if Blocked */}
      {blocked && (
        <div role="alert" className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{blocked}</span>
        </div>
      )}

      {/* Copy / Action Status Feedback */}
      {message && (
        <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Structured Clinical Prescription Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Case Identifiers & Diagnostic Protocol */}
        <div className="md:col-span-4 space-y-4">
          {/* Patient Details Card */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Patient &amp; Case Record
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  Patient ID:
                </span>
                <span className="font-bold text-neutral-900 font-mono">
                  {state.currentCase.patientInitials || 'Not entered'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-neutral-400" />
                  Tooth Number:
                </span>
                <span className="font-bold text-neutral-900 font-mono">
                  {state.currentCase.toothNumber || 'Not entered'}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200/60 text-neutral-600">
                <strong className="text-[10px] text-neutral-400 uppercase tracking-wide block mb-0.5">Clinical Notes:</strong>
                <p className="italic text-neutral-700 leading-snug">
                  {state.currentCase.clinicalNotes || 'None entered'}
                </p>
              </div>
            </div>
          </div>

          {/* Photographic Protocol Card */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Photographic Protocol Status
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Cross-Polarization:</span>
                <span className={`font-semibold font-mono text-[11px] px-2 py-0.5 rounded ${
                  state.crossPolarized 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {state.crossPolarized ? 'CONFIRMED' : 'NOT CONFIRMED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">18% Gray Calibration:</span>
                <span className={`font-semibold font-mono text-[11px] px-2 py-0.5 rounded ${
                  state.isCalibrated 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {state.isCalibrated ? 'APPLIED (LINEAR)' : 'UNREF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Protocol Checklist:</span>
                <span className={`font-semibold font-mono text-[11px] px-2 py-0.5 rounded ${
                  protocolPassed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {protocolPassed ? 'COMPLETE' : 'INCOMPLETE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Zonal Match Matrix & Substrate Prescription */}
        <div className="md:col-span-8 space-y-4">
          {/* Primary Target Shade Prescription */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Primary Prescribed Target Shade
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-teal-950">
                  {topMatch.shade.name}
                </span>
                <span className="text-xs font-mono text-teal-700">
                  ({topMatch.shade.system})
                </span>
              </div>
              <p className="text-xs text-teal-800 mt-0.5">
                Proximity Index: {topMatch.matchSimilarityScore ?? topMatch.confidencePercent}% &bull; CIEDE2000 ΔE₀₀ = {Number.isFinite(topMatch.deltaE00) ? topMatch.deltaE00.toFixed(2) : 'N/A'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-teal-600 shadow-sm"
                  style={{
                    backgroundColor: `rgb(${Math.round(topMatch.shade.lab.L * 2.55)}, ${Math.round(topMatch.shade.lab.L * 2.35)}, ${Math.round(topMatch.shade.lab.L * 2.05)})`,
                  }}
                />
                <span className="text-[9px] font-bold text-teal-800 block mt-1">Prescribed Tab</span>
              </div>
            </div>
          </div>

          {/* 3-Zone Spectrophotometric Table */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Zonal Colorimetric Coordinates (CIE L*a*b*)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['cervical', 'middle', 'incisal'] as ToothZone[]).map((key) => {
                const z = zones[key];
                const label = key === 'middle' ? 'Body' : key[0].toUpperCase() + key.slice(1);
                return (
                  <div key={key} className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-700">{label} Third</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        z.isMeasured ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {z.isMeasured ? z.matchedClassical.shade.code : 'Not measured'}
                      </span>
                    </div>
                    {z.isMeasured ? (
                      <div className="space-y-1 pt-1 text-[11px] text-neutral-600 font-mono">
                        <div>L*: {z.sampledLab.L.toFixed(1)} | a*: {z.sampledLab.a.toFixed(1)} | b*: {z.sampledLab.b.toFixed(1)}</div>
                        <div className="text-[10px] text-neutral-500">ΔE₀₀: {z.matchedClassical.deltaE00.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div className="pt-2 text-[10px] text-neutral-400 italic">
                        Not sampled in session
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Substrate & Material Spec */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Substrate &amp; Material Fabrication Specification
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Preparation Stump</span>
                <span className="font-bold text-neutral-900 font-mono">{state.substrate.prepShade}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Restoration</span>
                <span className="font-semibold text-neutral-900 capitalize">{state.substrate.restorationType.replace('_', ' ')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Material</span>
                <span className="font-semibold text-neutral-900">{state.substrate.material}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Thickness</span>
                <span className="font-bold text-teal-700 font-mono">{state.substrate.thicknessMm} mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Master Ceramist Formulation (if computed) */}
      {state.aiResult?.ceramicRecipe && (
        <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-teal-400">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Ceramist Layering Formulation</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300 pt-1">
            <div><strong className="text-white">Ingot:</strong> {state.aiResult.ceramicRecipe.ingot}</div>
            <div><strong className="text-white">Dentin:</strong> {state.aiResult.ceramicRecipe.bodyPowder}</div>
            <div><strong className="text-white">Incisal Enamel:</strong> {state.aiResult.ceramicRecipe.incisalPowder}</div>
          </div>
        </div>
      )}

      {/* Disclaimer / Limitations */}
      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
        <strong>Clinical Advisory:</strong> Color conversion assumes sRGB/D65 illuminant. Actual capture illuminant has not been spectrophotometrically measured. Confirm material-specific manufacturer instructions and firing cycles with the laboratory technician.
      </div>

      {/* Collapsible Raw Machine-Readable Report Text */}
      <div className="pt-2 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => setShowRawText(!showRawText)}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showRawText ? 'Hide Raw Text Report' : 'Show Raw Text Machine Report'}</span>
        </button>

        {showRawText && (
          <div className="mt-3">
            <pre className="whitespace-pre-wrap break-words text-xs font-mono bg-neutral-900 text-neutral-200 p-4 rounded-xl leading-relaxed max-h-72 overflow-y-auto">
              {reportText}
            </pre>
          </div>
        )}
      </div>

      {/* Primary Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition border border-neutral-300 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            disabled={!!blocked}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition border border-neutral-300 disabled:opacity-40"
          >
            <Copy className="w-4 h-4 text-teal-600" />
            <span>Copy report</span>
          </button>

          <button
            disabled={!!blocked}
            id="btn-step3-download-report"
            onClick={download}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition border border-neutral-300 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Download JSON</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLabPrescription}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print preview</span>
          </button>

          {onStartNewCase && (
            <button
              onClick={onStartNewCase}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition border border-neutral-300 shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-neutral-500" />
              <span>New case</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
