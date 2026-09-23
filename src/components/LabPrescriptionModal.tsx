import React, { useState } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { buildCaseReportText, exportReadiness } from '../lib/caseReport';
import { copyToClipboard } from '../lib/validationSchemas';
import { CIELABColor, ClinicalCase, MunsellColor, ShadeMatchResult, SubstrateConfig, ToothZone, ZoneData } from '../types/dental';
interface Props {
  isOpen: boolean; onClose: () => void; currentCase: ClinicalCase; targetMatch: ShadeMatchResult;
  sampledLab: CIELABColor; munsell: MunsellColor; zones: Record<ToothZone, ZoneData>;
  substrate: SubstrateConfig; crossPolarized: boolean;
}
export const LabPrescriptionModal: React.FC<Props> = ({ isOpen, onClose, targetMatch, zones }) => {
  const { state } = useCaseContext();
  const [message, setMessage] = useState('');
  if (!isOpen) return null;
  const text = buildCaseReportText(state, targetMatch, zones);
  const blocked = exportReadiness(state, targetMatch);
  return <div role="dialog" aria-modal="true" aria-labelledby="lab-prescription-title" className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
    <div id="modal-lab-prescription" className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto space-y-4">
      <h2 id="lab-prescription-title" className="text-xl font-bold">Laboratory shade report</h2>
      <pre className="whitespace-pre-wrap break-words text-sm font-sans leading-relaxed">{text}</pre>
      {blocked && <p role="alert" className="text-amber-800">{blocked}</p>}
      <p role="status">{message}</p>
      <div className="print-actions-hidden flex flex-wrap gap-3">
        <button disabled={!!blocked} className="border rounded-lg p-2 disabled:opacity-40" onClick={async () => {
          const result = await copyToClipboard(text); setMessage(result.success ? 'Copied' : result.error || 'Copy failed');
        }}>Copy report</button>
        <button disabled={!!blocked} className="border rounded-lg p-2 disabled:opacity-40" onClick={() => window.print()}>Print report</button>
        <button className="bg-teal-600 text-white rounded-lg p-2" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>;
};
