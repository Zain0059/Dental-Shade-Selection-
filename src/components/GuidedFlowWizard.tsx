import React, { useState } from "react";
import { 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Sun, 
  Layers, 
  Eye, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Stethoscope, 
  RotateCcw, 
  Download, 
  HelpCircle,
  Upload,
  Info,
  Sliders,
  CheckCheck
} from "lucide-react";
import { 
  CIELABColor, 
  ClinicalCase, 
  ClinicalProtocolChecklist, 
  RGBColor, 
  ShadeMatchResult, 
  SubstrateConfig, 
  ZoneData 
} from "../types/dental";

interface GuidedFlowWizardProps {
  currentCase: ClinicalCase;
  cases: ClinicalCase[];
  onSelectCase: (c: ClinicalCase) => void;
  crossPolarized: boolean;
  onTogglePolarized: () => void;
  sampledLab: CIELABColor;
  sampledRgb: RGBColor;
  topMatch: ShadeMatchResult;
  allClassicalMatches: ShadeMatchResult[];
  threeDMatch: ShadeMatchResult;
  bleachMatches: ShadeMatchResult[];
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
  substrate: SubstrateConfig;
  onChangeSubstrate: (updated: Partial<SubstrateConfig>) => void;
  onSelectShade: (match: ShadeMatchResult) => void;
  checklist: ClinicalProtocolChecklist;
  onUpdateChecklist: (updated: Partial<ClinicalProtocolChecklist>) => void;
  onOpenChecklistModal: () => void;
  onOpenCameraGuide: () => void;
  onUploadClick: () => void;
  onOpenAiAnalysis: () => void;
  onOpenLabPrescription: () => void;
  isAiLoading: boolean;
  activeZoneFilter: "all" | "cervical" | "middle" | "incisal";
  onSelectZoneFilter: (zone: "all" | "cervical" | "middle" | "incisal") => void;
  childrenCanvas: React.ReactNode;
}

export const GuidedFlowWizard: React.FC<GuidedFlowWizardProps> = ({
  currentCase,
  cases,
  onSelectCase,
  crossPolarized,
  onTogglePolarized,
  sampledLab,
  sampledRgb,
  topMatch,
  allClassicalMatches,
  threeDMatch,
  bleachMatches,
  zones,
  substrate,
  onChangeSubstrate,
  onSelectShade,
  checklist,
  onUpdateChecklist,
  onOpenChecklistModal,
  onOpenCameraGuide,
  onUploadClick,
  onOpenAiAnalysis,
  onOpenLabPrescription,
  isAiLoading,
  activeZoneFilter,
  onSelectZoneFilter,
  childrenCanvas,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedFullSlip, setCopiedFullSlip] = useState(false);

  const allChecklistPassed = 
    checklist.hydrationChecked && 
    checklist.daylightLighting5500KChecked && 
    checklist.neutralBibChecked && 
    checklist.lipstickRemovedChecked;

  const isDarkPrep = ["ND4", "ND5", "ND6", "ND7", "ND8", "ND9"].includes(substrate.prepShade);

  // Ingot recommendation string
  const recommendedIngot = isDarkPrep 
    ? (substrate.thicknessMm < 0.8 ? "IPS e.max HO (High Opacity)" : "IPS e.max MO 1 (Medium Opacity)")
    : (substrate.thicknessMm >= 1.2 ? "IPS e.max MT (Medium Translucency)" : "IPS e.max LT (Low Translucency)");

  const handleCopyNote = () => {
    const text = `
=== DENTAL LAB SHADE PRESCRIPTION ===
Patient: ${currentCase.patientInitials} | Tooth: ${currentCase.toothNumber}
Indication: ${substrate.restorationType.replace("_", " ").toUpperCase()} (${substrate.material.replace("_", " ")}, ${substrate.thicknessMm}mm)
Target Base Shade: ${topMatch.shade.name} (${topMatch.shade.code})
3D-Master Alternative: ${threeDMatch.shade.code}
Match Confidence: ${topMatch.confidencePercent}% (CIEDE2000 ΔE00: ${topMatch.deltaE00.toFixed(2)})
Prep Stump Shade: ${substrate.prepShade} (${isDarkPrep ? "Dark Discolored Prep" : "Normal Vital Dentin"})
Recommended Ingot: ${recommendedIngot}

3-ZONE ANATOMICAL RECIPE:
1. Cervical (Gingival 1/3): ${zones.cervical.matchedClassical.shade.code} (Warm saturation modifier)
2. Middle Body 1/3: ${zones.middle.matchedClassical.shade.code} (Base dentin shade)
3. Incisal 1/3: ${zones.incisal.matchedClassical.shade.code} / Enamel Opal (Translucent halo)

Lighting & Photography: Calibrated D65 5500K, Cross-Polarized photography verified.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  const handleDownloadCaseReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      patient: currentCase.patientInitials,
      tooth: currentCase.toothNumber,
      selectedShade: {
        code: topMatch.shade.code,
        name: topMatch.shade.name,
        system: topMatch.shade.system,
        deltaE00: topMatch.deltaE00,
        confidencePercent: topMatch.confidencePercent,
        cielab: topMatch.shade.lab,
      },
      sampledCoordinates: {
        rgb: sampledRgb,
        cielab: sampledLab,
      },
      zoneFormulation: {
        cervical: {
          shade: zones.cervical.matchedClassical.shade.code,
          deltaE00: zones.cervical.matchedClassical.deltaE00,
        },
        middle: {
          shade: zones.middle.matchedClassical.shade.code,
          deltaE00: zones.middle.matchedClassical.deltaE00,
        },
        incisal: {
          shade: zones.incisal.matchedClassical.shade.code,
          deltaE00: zones.incisal.matchedClassical.deltaE00,
        },
      },
      restorationConfig: {
        prepShade: substrate.prepShade,
        restorationType: substrate.restorationType,
        material: substrate.material,
        thicknessMm: substrate.thicknessMm,
        recommendedIngot,
      },
      crossPolarizedUsed: crossPolarized,
      protocolVerified: allChecklistPassed,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DentalShade_${currentCase.patientInitials}_Tooth${currentCase.toothNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 3-Step Guided Progress Header */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stepper Tabs */}
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-2 sm:gap-3">
            {/* Step 1 */}
            <button
              id="step-tab-1"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                currentStep === 1
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : currentStep > 1
                  ? "bg-neutral-100 text-emerald-600 border-emerald-500/30"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 1 ? "bg-neutral-50 text-teal-700" : currentStep > 1 ? "bg-emerald-500/20 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
              </div>
              <span>Step 1: Capture &amp; Align</span>
            </button>

            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 hidden sm:block" />

            {/* Step 2 */}
            <button
              id="step-tab-2"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                currentStep === 2
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : currentStep > 2
                  ? "bg-neutral-100 text-emerald-600 border-emerald-500/30"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 2 ? "bg-neutral-50 text-teal-700" : currentStep > 2 ? "bg-emerald-500/20 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
              </div>
              <span>Step 2: Select Shade</span>
            </button>

            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 hidden sm:block" />

            {/* Step 3 */}
            <button
              id="step-tab-3"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                currentStep === 3
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 3 ? "bg-neutral-50 text-teal-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                3
              </div>
              <span>Step 3: Export &amp; Order</span>
            </button>
          </div>

          {/* Quick Flow Navigator */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                id="btn-next-step"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-restart-flow"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Case Flow</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CAPTURE & ALIGN */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Tooth Viewport & Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {childrenCanvas}
          </div>

          {/* Right: Step 1 Guided Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Step 1 Introduction Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-teal-600">
                <Camera className="w-5 h-5" />
                <h3 className="font-bold text-base text-neutral-900">Step 1: Patient Intraoral Photo</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ensure proper cross-polarization to remove specular surface reflection, click anywhere on the tooth to sample, or use the quick-zone buttons.
              </p>

              {/* Patient Case Selector */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                  Select Clinical Case or Upload
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={currentCase.id}
                    onChange={(e) => {
                      const found = cases.find((c) => c.id === e.target.value);
                      if (found) onSelectCase(found);
                    }}
                    className="flex-1 bg-white border border-neutral-300 text-xs text-neutral-900 rounded-lg p-2 font-medium focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.toothNumber})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={onUploadClick}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-300 transition shrink-0"
                    title="Upload patient intraoral photo"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Cross-Polarization Toggle */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-teal-600" />
                    Cross-Polarization Filter (Anti-Glare)
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    crossPolarized ? "bg-teal-600/15 text-teal-700 border border-teal-600/30" : "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                  }`}>
                    {crossPolarized ? "POLARIZED (Recommended)" : "UNPOLARIZED"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  {crossPolarized 
                    ? "Active: Eliminates enamel flash glare to accurately measure underlying dentin chroma and mamelons."
                    : "Inactive: Shows external enamel texture and gloss, but specular reflections may distort color coordinates."}
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
                  <span>Toggle Glare Filter: {crossPolarized ? "Switch to Unpolarized" : "Turn ON Cross-Polarizer"}</span>
                </button>
              </div>

              {/* Clinical Protocol Fast-Check */}
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

              {/* Sampled Live Preview & Next Step CTA */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0" 
                    style={{ backgroundColor: sampledRgb.hex }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-neutral-800 block">Sampled Live</span>
                    <span className="text-[10px] text-teal-600 font-mono">
                      Matched: <strong>{topMatch.shade.code}</strong> ({topMatch.confidencePercent}%)
                    </span>
                  </div>
                </div>

                <button
                  id="btn-step1-proceed"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition"
                >
                  <span>Step 2: Select Shade</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT & REFINE SHADE */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Recommended Shade & 3-Zone Layering (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Recommended Shade Hero Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 hidden" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Primary Clinical Match
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {topMatch.confidencePercent}% Confidence
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900 mt-1 tracking-tight">
                    {topMatch.shade.name}
                    <span className="text-sm font-normal text-neutral-500 ml-2 font-mono">
                      (or {threeDMatch.shade.code} 3D-Master)
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {topMatch.shade.description} &bull; Group {topMatch.shade.categoryGroup}
                  </p>
                </div>

                {/* Swatch Comparison */}
                <div className="flex items-center gap-3 bg-neutral-100 p-2.5 rounded-xl border border-neutral-300 shrink-0">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-inner"
                      style={{ backgroundColor: sampledRgb.hex }}
                    />
                    <span className="text-[10px] text-neutral-500 font-medium block mt-1">Sampled Tooth</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-400" />

                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-teal-600 shadow-sm"
                      style={{
                        backgroundColor: `rgb(${Math.round(topMatch.shade.lab.L * 2.55)}, ${Math.round(topMatch.shade.lab.L * 2.35)}, ${Math.round(topMatch.shade.lab.L * 2.05)})`,
                      }}
                    />
                    <span className="text-[10px] text-teal-700 font-bold block mt-1">{topMatch.shade.code} Tab</span>
                  </div>
                </div>
              </div>

              {/* Alternative Shade Tabs */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-neutral-500 mr-1">Alternative tabs:</span>
                  {allClassicalMatches.slice(0, 5).map((match) => {
                    const isSelected = topMatch.shade.id === match.shade.id;
                    return (
                      <button
                        key={match.shade.id}
                        onClick={() => onSelectShade(match)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-sm font-bold"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300"
                        }`}
                      >
                        <span>{match.shade.code}</span>
                        <span className={`text-[10px] ${isSelected ? "text-neutral-900" : "text-neutral-500"}`}>
                          ({match.confidencePercent}%)
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-neutral-500 font-mono">
                  CIEDE2000 ΔE₀₀ = <strong className="text-emerald-600 font-bold">{topMatch.deltaE00.toFixed(2)}</strong> (Optimal Blend)
                </div>
              </div>
            </div>

            {/* 3-Zone Layering Tooth Map */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-sm text-neutral-900">3-Zone Anatomical Layering Breakdown</h3>
                </div>
                <span className="text-[11px] text-neutral-500">Click a zone to review</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cervical */}
                <button
                  onClick={() => onSelectZoneFilter(activeZoneFilter === "cervical" ? "all" : "cervical")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    activeZoneFilter === "cervical"
                      ? "bg-amber-50 border-amber-600 ring-1 ring-amber-600/50"
                      : "bg-neutral-100 border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      Gingival 1/3
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded">
                      {zones.cervical.matchedClassical.shade.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug">
                    Warmer cervical chroma with subtle ochre/copper emergence.
                  </p>
                </button>

                {/* Middle Body */}
                <button
                  onClick={() => onSelectZoneFilter(activeZoneFilter === "middle" ? "all" : "middle")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    activeZoneFilter === "middle"
                      ? "bg-teal-50 border-teal-600 ring-1 ring-teal-600/50"
                      : "bg-neutral-100 border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Middle Body
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded">
                      {zones.middle.matchedClassical.shade.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug">
                    Base dentin core shade. Controls primary smile brightness and hue.
                  </p>
                </button>

                {/* Incisal Edge */}
                <button
                  onClick={() => onSelectZoneFilter(activeZoneFilter === "incisal" ? "all" : "incisal")}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    activeZoneFilter === "incisal"
                      ? "bg-neutral-50 border-neutral-400 ring-1 ring-neutral-400/40"
                      : "bg-neutral-100 border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Incisal 1/3
                    </span>
                    <span className="text-[11px] font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded">
                      {zones.incisal.matchedClassical.shade.code} / Opal
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug">
                    Translucent enamel with opalescent amber-blue halo scattering.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Substrate Preparation & AI Formulation (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Substrate / Prepared Die Stump Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  Prepared Stump / Die Shade
                </span>
                <span className="text-xs font-mono font-bold text-teal-700 bg-neutral-100 px-2 py-0.5 rounded">
                  {substrate.prepShade}
                </span>
              </div>

              {/* Quick Prep Selection Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "ND1", label: "ND1 Bleach" },
                  { code: "ND2", label: "ND2 Vital" },
                  { code: "ND3", label: "ND3 Medium" },
                  { code: "ND4", label: "ND4 Dark" },
                  { code: "ND5", label: "ND5 Stained" },
                  { code: "ND7", label: "ND7 Devital" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => onChangeSubstrate({ prepShade: item.code })}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition ${
                      substrate.prepShade === item.code
                        ? "bg-teal-600 text-white border-teal-600 font-bold"
                        : "bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Ingot Recommendation Box */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Recommended Ceramic Ingot Opacity
                </span>
                <div className="text-teal-700 font-mono font-bold text-sm">
                  {recommendedIngot}
                </div>
                <p className="text-[11px] text-neutral-500">
                  {isDarkPrep
                    ? "Dark stump requires Medium Opacity (MO) ingot to mask underlying substrate discoloration."
                    : "Vital stump allows Low Translucency (LT) ingot for optimal depth of translucency."}
                </p>
              </div>

              {/* Restoration & Thickness Check */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Restoration</span>
                  <span className="text-neutral-800 font-semibold">{substrate.restorationType.replace("_", " ").toUpperCase()}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Thickness</span>
                  <span className="text-teal-700 font-semibold font-mono">{substrate.thicknessMm} mm</span>
                </div>
              </div>
            </div>

            {/* AI Master Ceramist Assistant Trigger */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-sm text-neutral-900">AI Ceramic Layering Assistant</h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generate a lab ceramist recipe including dentin powder blends, cervical modifiers, and firing temperatures.
              </p>
              <button
                id="btn-step2-ai-recipe"
                onClick={onOpenAiAnalysis}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : "text-teal-100"}`} />
                <span>{isAiLoading ? "Computing AI Recipe..." : "Generate AI Master Ceramist Recipe"}</span>
              </button>
            </div>

            {/* Navigation CTA */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Step 1</span>
              </button>

              <button
                id="btn-step2-proceed"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition"
              >
                <span>Proceed to Step 3: Export &amp; Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: EXPORT & LAB WORK ORDER */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Complete Prescription Summary Card (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Dental Lab Shade Work Order
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Ready for Export
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 mt-1">
                    Patient {currentCase.patientInitials} &bull; Tooth #{currentCase.toothNumber}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block">Indication</span>
                  <span className="text-xs font-bold text-neutral-800">{substrate.restorationType.replace("_", " ").toUpperCase()}</span>
                </div>
              </div>

              {/* Prescription Key Parameters Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Target Base Shade</span>
                  <div className="text-teal-700 font-black text-lg">
                    {topMatch.shade.name}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    VITA Classical {topMatch.shade.code} (or {threeDMatch.shade.code} 3D-Master)
                  </p>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Prep &amp; Ingot Specification</span>
                  <div className="text-amber-700 font-black text-lg font-mono">
                    Prep: {substrate.prepShade}
                  </div>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Ingot: <strong className="text-neutral-800">{recommendedIngot}</strong>
                  </p>
                </div>
              </div>

              {/* 3-Zone Layering Prescription Table */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  3-Zone Ceramic Formulation Table
                </span>
                <div className="divide-y divide-neutral-200 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      Gingival 1/3 (Cervical):
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded mr-2">
                        {zones.cervical.matchedClassical.shade.code}
                      </span>
                      <span className="text-[11px] text-neutral-500">Warm copper/ochre modifier</span>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-teal-700 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Middle Body (Core):
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded mr-2">
                        {zones.middle.matchedClassical.shade.code}
                      </span>
                      <span className="text-[11px] text-neutral-500">Base dentin value &amp; chroma</span>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-700 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Incisal 1/3 (Edge):
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded mr-2">
                        {zones.incisal.matchedClassical.shade.code}
                      </span>
                      <span className="text-[11px] text-neutral-500">Translucent Enamel Opal (OE1)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality & Protocol Attestation */}
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Color difference verified (CIEDE2000 ΔE₀₀ = {topMatch.deltaE00.toFixed(2)})</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">D65 Illuminant</span>
              </div>
            </div>
          </div>

          {/* Right: Export Actions & Lab Work Order Dispatch (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Export Actions */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Export &amp; Lab Communication
              </h3>
              <p className="text-xs text-neutral-600">
                Copy the text slip for your electronic dental records (Dentrix/Open Dental) or generate the full official PDF order.
              </p>

              <div className="space-y-2.5 pt-1">
                {/* 1-Click Copy Slip */}
                <button
                  id="btn-step3-copy-slip"
                  onClick={handleCopyNote}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs font-bold transition shadow-sm"
                >
                  {copiedNote ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-teal-600" />}
                  <span>{copiedNote ? "Prescription Copied to Clipboard!" : "Copy Formatted Lab Slip"}</span>
                </button>

                {/* Open Official Lab Prescription Modal */}
                <button
                  id="btn-step3-open-prescription"
                  onClick={onOpenLabPrescription}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Full Digital Lab Prescription</span>
                </button>

                {/* Download Case File JSON */}
                <button
                  id="btn-step3-download-report"
                  onClick={handleDownloadCaseReport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-300 text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4 text-neutral-500" />
                  <span>Download Digital Case File (.JSON)</span>
                </button>
              </div>
            </div>

            {/* AI Ceramist Recipe Quick Trigger */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Ceramic Firing Protocol
                </span>
                <span className="text-[10px] text-teal-700 font-mono">Vacuum 750°C</span>
              </div>
              <p className="text-xs text-neutral-500">
                Detailed powder layering notes, slow cooling stage instructions, and try-in paste recommendations.
              </p>
              <button
                onClick={onOpenAiAnalysis}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : "text-teal-100"}`} />
                <span>{isAiLoading ? "Loading Recipe..." : "View AI Ceramic Recipe"}</span>
              </button>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Step 2</span>
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition border border-neutral-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Case</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
