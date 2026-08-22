import React from "react";
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Upload, 
  Stethoscope,
  Microscope,
  Compass
} from "lucide-react";
import { ClinicalProtocolChecklist } from "../types/dental";

interface NavbarProps {
  checklist: ClinicalProtocolChecklist;
  onOpenChecklist: () => void;
  onOpenLabPrescription: () => void;
  onOpenAiAnalysis: () => void;
  onOpenCameraGuide: () => void;
  onUploadClick: () => void;
  isAiLoading: boolean;
  viewMode: "guided" | "chairside" | "advanced";
  onToggleViewMode: (mode: "guided" | "chairside" | "advanced") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  checklist,
  onOpenChecklist,
  onOpenLabPrescription,
  onOpenAiAnalysis,
  onOpenCameraGuide,
  onUploadClick,
  isAiLoading,
  viewMode,
  onToggleViewMode,
}) => {
  const allChecklistPassed = 
    checklist.hydrationChecked && 
    checklist.daylightLighting5500KChecked && 
    checklist.neutralBibChecked && 
    checklist.lipstickRemovedChecked;

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-bold text-base">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-100 tracking-tight">Dental Shade Engine</h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
                VITA &bull; D65
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Chairside Shade Matching &amp; Lab Work Order</p>
          </div>
        </div>

        {/* View Mode Switcher (Guided Flow Wizard vs Chairside vs Lab / Colorimetry) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner gap-1">
          <button
            id="btn-mode-guided"
            onClick={() => onToggleViewMode("guided")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "guided"
                ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Guided Flow (3-Step Wizard)</span>
          </button>

          <button
            id="btn-mode-chairside"
            onClick={() => onToggleViewMode("chairside")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "chairside"
                ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Chairside Quick View</span>
          </button>

          <button
            id="btn-mode-advanced"
            onClick={() => onToggleViewMode("advanced")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "advanced"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab &amp; Colorimetry</span>
            <span className="sm:hidden">Lab</span>
          </button>
        </div>

        {/* Right Action Badges */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Clinical Protocol Indicator */}
          <button
            id="btn-protocol-checklist"
            onClick={onOpenChecklist}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              allChecklistPassed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            }`}
            title="Hydration & Lighting Protocol"
          >
            {allChecklistPassed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-medium hidden sm:inline">
              {allChecklistPassed ? "Protocol OK" : "Protocol Check"}
            </span>
          </button>

          {/* Camera Settings Helper */}
          <button
            id="btn-camera-guide"
            onClick={onOpenCameraGuide}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Recommended Smartphone Camera Settings: 1/125s, f/22, ISO 100"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Camera</span>
          </button>

          {/* Custom Photo Upload */}
          <button
            id="btn-upload-photo"
            onClick={onUploadClick}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload</span>
          </button>

          {/* AI Master Ceramist Button */}
          <button
            id="btn-ai-analysis"
            onClick={onOpenAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : "text-cyan-200"}`} />
            <span>{isAiLoading ? "Analyzing..." : "AI Ceramist"}</span>
          </button>

          {/* Dental Lab Work Order Button */}
          <button
            id="btn-lab-prescription"
            onClick={onOpenLabPrescription}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lab Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
