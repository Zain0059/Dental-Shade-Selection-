import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { buildCaseReport, buildCaseReportText, exportReadiness } from '../../lib/caseReport';
import { copyToClipboard } from '../../lib/validationSchemas';
import { ClinicalCase, SubstrateConfig, ShadeMatchResult, ZoneData, CIELABColor, RGBColor, ToothZone } from '../../types/dental';
interface Step3ExportOrderProps {
  currentCase: ClinicalCase; substrate: SubstrateConfig; topMatch: ShadeMatchResult; threeDMatch: ShadeMatchResult;
  zones: Record<ToothZone, ZoneData>; sampledLab: CIELABColor; sampledRgb: RGBColor;
  crossPolarized: boolean; allChecklistPassed: boolean; onOpenLabPrescription: () => void;
  onOpenAiAnalysis: () => void; isAiLoading: boolean; onStartNewCase?: () => void; onPrevStep: () => void;
}
export const Step3ExportOrder: React.FC<Step3ExportOrderProps> = ({ topMatch, zones, onOpenLabPrescription, onPrevStep, onStartNewCase }) => {
  const { state } = useCaseContext();
  const [message, setMessage] = useState('');
  const blocked = exportReadiness(state, topMatch);
  const reportText = buildCaseReportText(state, topMatch, zones);
  const download = () => {
    if (blocked) return;
    const report = buildCaseReport(state, topMatch, zones);
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url;
    a.download = `DentalShade_${state.currentCase.patientInitials}_${state.currentCase.toothNumber}`.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="bg-white rounded-2xl border p-5 space-y-4">
    <h2 className="text-xl font-bold">Review and export shade report</h2>
    <pre className="whitespace-pre-wrap break-words text-sm font-sans leading-relaxed">{reportText}</pre>
    {blocked && <p className="text-amber-800" role="alert">{blocked}</p>}
    <p role="status">{message}</p>
    <div className="flex flex-wrap gap-2">
      <button onClick={onPrevStep} className="border rounded-lg p-2">Back</button>
      <button disabled={!!blocked} onClick={async () => { const result = await copyToClipboard(reportText); setMessage(result.success ? 'Copied' : result.error || 'Copy failed'); }} className="border rounded-lg p-2 disabled:opacity-40">Copy report</button>
      <button disabled={!!blocked} id="btn-step3-download-report" onClick={download} className="border rounded-lg p-2 disabled:opacity-40">Download JSON</button>
      <button onClick={onOpenLabPrescription} className="bg-teal-600 text-white rounded-lg p-2">Print preview</button>
      <button onClick={onStartNewCase} className="border rounded-lg p-2">New case</button>
    </div>
  </section>;
};
