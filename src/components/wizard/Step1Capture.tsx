import React from "react";
import { Camera, Layers, ShieldCheck, ArrowRight, Upload } from "lucide-react";
import { ClinicalCase, ClinicalProtocolChecklist, RGBColor, ShadeMatchResult } from "../../types/dental";

interface Step1CaptureProps {
  currentCase: ClinicalCase;
  cases: ClinicalCase[];
  onSelectCase: (c: ClinicalCase) => void;
  crossPolarized: boolean;
  onTogglePolarized: () => void;
  checklist: ClinicalProtocolChecklist;
  onUpdateChecklist: (updated: Partial<ClinicalProtocolChecklist>) => void;
  onUploadClick: () => void;
  hasPatientPhoto: boolean;
  sampledRgb: RGBColor;
  topMatch: ShadeMatchResult;
  childrenCanvas: React.ReactNode;
  onNextStep: () => void;
}

export const Step1Capture: React.FC<Step1CaptureProps> = ({
  currentCase,
  cases,
  onSelectCase,
  crossPolarized,
  onTogglePolarized,
  checklist,
  onUpdateChecklist,
  onUploadClick,
  hasPatientPhoto,
  sampledRgb,
  topMatch,
  childrenCanvas,
  onNextStep,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-4">
        {childrenCanvas}
      </div>

      <div className="lg:col-span-5 space-y-4 min-w-0">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 w-full min-w-0">
          <div className="flex items-center gap-2 text-teal-600">
            <Camera className="w-5 h-5" />
            <h3 className="font-bold text-base text-neutral-900">Step 1: Patient Intraoral Photo</h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Ensure proper cross-polarization to remove specular surface reflection, click anywhere on the tooth to sample, or use the quick-zone buttons.
          </p>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2 w-full min-w-0">
            <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
              Select Clinical Case or Upload
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
              <div className="relative min-w-0 flex-1 w-full">
                <select
                  value={cases.some(c => c.id === currentCase.id) ? currentCase.id : ""}
                  onChange={(e) => {
                    const found = cases.find((c) => c.id === e.target.value);
                    if (found) onSelectCase(found);
                  }}
                  className="w-full min-w-0 max-w-full bg-white border border-neutral-300 text-xs text-neutral-900 rounded-lg p-2 font-medium focus:ring-1 focus:ring-teal-600 focus:outline-none truncate"
                >
                  <option value="" disabled>Uploaded patient image</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.toothNumber} • {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onUploadClick}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-300 transition shrink-0 w-full sm:w-auto"
                title={hasPatientPhoto ? "Replace patient photo while keeping case details" : "Upload patient intraoral photo"}
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>{hasPatientPhoto ? "Replace photo" : "Upload"}</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                Photo captured with cross-polarizers?
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                crossPolarized ? "bg-teal-600/15 text-teal-700 border border-teal-600/30" : "bg-amber-500/20 text-amber-700 border border-amber-500/30"
              }`}>
                {crossPolarized ? "POLARIZED (Recommended)" : "UNPOLARIZED"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {crossPolarized 
                ? "Marked as captured with physical cross-polarizers. This setting does not modify the photograph."
                : "Not confirmed. Only enable this if cross-polarizers were used during capture."}
            </p>
            <button
              onClick={onTogglePolarized}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                crossPolarized
                  ? "bg-teal-50 border border-teal-600/50 text-teal-700 hover:bg-teal-100"
                  : "bg-neutral-100 border border-neutral-300 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Capture status: {crossPolarized ? "Mark not confirmed" : "Confirm cross-polarized capture"}</span>
            </button>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hydration &amp; Lighting Verification
              </span>
              <button
                onClick={() => {
                  onUpdateChecklist({
                    hydrationChecked: true,
                    daylightLighting5500KChecked: true,
                    neutralBibChecked: true,
                    lipstickRemovedChecked: true,
                  });
                }}
                className="text-[10px] text-teal-600 hover:underline font-medium"
              >
                Quick Verify All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-1.5 text-neutral-600 cursor-pointer bg-white p-2 rounded-lg border border-neutral-200">
                <input
                  type="checkbox"
                  checked={checklist.hydrationChecked}
                  onChange={(e) => onUpdateChecklist({ hydrationChecked: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-0 bg-neutral-100 border-neutral-300"
                />
                <span>Tooth Hydrated</span>
              </label>

              <label className="flex items-center gap-1.5 text-neutral-600 cursor-pointer bg-white p-2 rounded-lg border border-neutral-200">
                <input
                  type="checkbox"
                  checked={checklist.daylightLighting5500KChecked}
                  onChange={(e) => onUpdateChecklist({ daylightLighting5500KChecked: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-0 bg-neutral-100 border-neutral-300"
                />
                <span>5500K Daylight</span>
              </label>

              <label className="flex items-center gap-1.5 text-neutral-600 cursor-pointer bg-white p-2 rounded-lg border border-neutral-200">
                <input
                  type="checkbox"
                  checked={checklist.neutralBibChecked}
                  onChange={(e) => onUpdateChecklist({ neutralBibChecked: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-0 bg-neutral-100 border-neutral-300"
                />
                <span>Neutral Gray Bib</span>
              </label>

              <label className="flex items-center gap-1.5 text-neutral-600 cursor-pointer bg-white p-2 rounded-lg border border-neutral-200">
                <input
                  type="checkbox"
                  checked={checklist.lipstickRemovedChecked}
                  onChange={(e) => onUpdateChecklist({ lipstickRemovedChecked: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-0 bg-neutral-100 border-neutral-300"
                />
                <span>Lipstick Removed</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0" 
                style={{ backgroundColor: sampledRgb.hex }}
              />
              <div>
                <span className="text-[11px] font-bold text-neutral-800 block">Sampled Live</span>
                <span className="text-[10px] text-teal-600 font-mono">
                  Matched: <strong>{topMatch?.shade?.code || "N/A"}</strong> ({topMatch?.confidencePercent || 0}%)
                </span>
              </div>
            </div>

            <button
              id="btn-step1-proceed"
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition"
            >
              <span>Step 2: Select Shade</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
