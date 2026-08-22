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
  Compass,
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

const MODES: { key: "guided" | "chairside" | "advanced"; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { key: "guided", label: "Guided Flow", shortLabel: "Guided", icon: Compass },
  { key: "chairside", label: "Chairside Quick View", shortLabel: "Chairside", icon: Stethoscope },
  { key: "advanced", label: "Lab & Colorimetry", shortLabel: "Lab", icon: Microscope },
];

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
    <header id="app-header" className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      {/* Row 1 — identity + protocol status + primary action. Always one line, compact. */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 lg:px-6 h-14">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
            DS
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-[15px] text-neutral-900 tracking-tight leading-tight truncate">
              Dental Shade Engine
            </h1>
            <p className="text-[11px] text-neutral-500 leading-tight hidden sm:block">
              VITA &bull; D65 Daylight Reference
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Protocol status — informational, not a call to action */}
          <button
            id="btn-protocol-checklist"
            onClick={onOpenChecklist}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 h-9 rounded-lg border transition ${
              allChecklistPassed
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
            title="Hydration & lighting protocol"
          >
            {allChecklistPassed ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span className="font-medium">{allChecklistPassed ? "Protocol OK" : "Check protocol"}</span>
          </button>

          {/* Single primary action for the whole bar */}
          <button
            id="btn-lab-prescription"
            onClick={onOpenLabPrescription}
            className="flex items-center gap-1.5 text-xs px-3.5 h-9 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab Order</span>
          </button>
        </div>
      </div>

      {/* Row 2 — workflow switcher (left) + secondary utility icons (right). Scrolls, never wraps. */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-4 lg:px-6 pb-2.5 -mt-0.5">
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg gap-0.5 overflow-x-auto">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const active = viewMode === mode.key;
            return (
              <button
                key={mode.key}
                id={`btn-mode-${mode.key}`}
                onClick={() => onToggleViewMode(mode.key)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{mode.label}</span>
                <span className="md:hidden">{mode.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-camera-guide"
            onClick={onOpenCameraGuide}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            title="Recommended camera settings"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            id="btn-upload-photo"
            onClick={onUploadClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            title="Upload patient photo"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            id="btn-ai-analysis"
            onClick={onOpenAiAnalysis}
            disabled={isAiLoading}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition disabled:opacity-50"
            title={isAiLoading ? "Analyzing…" : "AI Ceramist assistant"}
          >
            <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
