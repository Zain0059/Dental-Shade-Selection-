import React from "react";
import { 
  X, 
  Droplet, 
  Sun, 
  Palette, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  ShieldCheck, 
  Clock,
  Sparkles
} from "lucide-react";
import { ClinicalProtocolChecklist } from "../types/dental";

interface ClinicalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: ClinicalProtocolChecklist;
  onUpdateChecklist: (updated: Partial<ClinicalProtocolChecklist>) => void;
}

export const ClinicalChecklistModal: React.FC<ClinicalChecklistModalProps> = ({
  isOpen,
  onClose,
  checklist,
  onUpdateChecklist,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(checklist.hydrationElapsedSeconds / 60);
  const seconds = checklist.hydrationElapsedSeconds % 60;
  const isDehydrationRisk = checklist.hydrationElapsedSeconds > 180; // > 3 minutes

  const handleToggle = (key: keyof ClinicalProtocolChecklist) => {
    onUpdateChecklist({ [key]: !checklist[key] });
  };

  const handleVerifyAll = () => {
    onUpdateChecklist({
      hydrationChecked: true,
      daylightLighting5500KChecked: true,
      criAbove90Checked: true,
      neutralBibChecked: true,
      lipstickRemovedChecked: true,
      crossPolarizerMountedChecked: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="modal-clinical-protocol"
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Clinical Protocol Checklist</h2>
              <p className="text-xs text-slate-400">Eliminate environmental bias and human perceptual error</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hydration Warning Banner */}
        <div className={`mt-5 p-4 rounded-xl border flex items-start gap-3.5 transition ${
          isDehydrationRisk 
            ? "bg-rose-950/40 border-rose-500/40 text-rose-200" 
            : "bg-cyan-950/30 border-cyan-500/30 text-cyan-200"
        }`}>
          <Droplet className={`w-5 h-5 mt-0.5 shrink-0 ${isDehydrationRisk ? "text-rose-400" : "text-cyan-400"}`} />
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className={isDehydrationRisk ? "text-rose-300" : "text-cyan-300"}>
                Tooth Hydration Protocol ({minutes}:{seconds.toString().padStart(2, "0")})
              </span>
              {isDehydrationRisk && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                  Dehydration Risk
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed">
              Enamel begins losing water within 2–3 minutes of air drying and rubber dam isolation. Dehydration scatters light, creating a false spike in Lightness (L* / Value) and masking natural chroma.
              <strong> Always acquire shade photos at the very start of the appointment.</strong>
            </p>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="mt-4 space-y-3">
          {/* 1. Hydration status */}
          <div 
            onClick={() => handleToggle("hydrationChecked")}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition"
          >
            <div className="mt-0.5 text-cyan-400">
              {checklist.hydrationChecked ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">1. Pre-Isolation Shade Selection (Hydration Intact)</div>
              <p className="text-slate-400">Tooth has not been dehydrated under high-vacuum suction, air syringe, or dental dam.</p>
            </div>
          </div>

          {/* 2. Daylight Lighting */}
          <div 
            onClick={() => handleToggle("daylightLighting5500KChecked")}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition"
          >
            <div className="mt-0.5 text-cyan-400">
              {checklist.daylightLighting5500KChecked ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">2. Daylight-Corrected Lighting (5500K – 6500K)</div>
              <p className="text-slate-400">Dental operatory overhead light switched off; ambient balanced light or calibrated ring flash utilized.</p>
            </div>
          </div>

          {/* 3. CRI > 90 */}
          <div 
            onClick={() => handleToggle("criAbove90Checked")}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition"
          >
            <div className="mt-0.5 text-cyan-400">
              {checklist.criAbove90Checked ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">3. High Color Rendering Index (CRI &gt; 90)</div>
              <p className="text-slate-400">Ensures full spectral distribution without yellowish or bluish spectral gaps.</p>
            </div>
          </div>

          {/* 4. Neutral Bib & Surroundings */}
          <div 
            onClick={() => handleToggle("neutralBibChecked")}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition"
          >
            <div className="mt-0.5 text-cyan-400">
              {checklist.neutralBibChecked ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">4. Neutral Grey / Pale Bib Placement</div>
              <p className="text-slate-400">Prevents reflected color casting from patient clothing and operatory wall tints.</p>
            </div>
          </div>

          {/* 5. Lipstick Removal */}
          <div 
            onClick={() => handleToggle("lipstickRemovedChecked")}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition"
          >
            <div className="mt-0.5 text-cyan-400">
              {checklist.lipstickRemovedChecked ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">5. Bright Lipstick & Heavy Makeup Removed</div>
              <p className="text-slate-400">Eliminates simultaneous color contrast and retinal rod fatigue.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleVerifyAll}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Mark All as Verified
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            Save & Continue to Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
