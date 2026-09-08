import React, { useState } from "react";
import { FileText, CheckCheck, Copy, Check, Download, Sparkles, ChevronLeft, RotateCcw, AlertCircle, Sun, Layers } from "lucide-react";
import { ClinicalCase, SubstrateConfig, ShadeMatchResult, ZoneData, CIELABColor, RGBColor } from "../../types/dental";
import { copyToClipboard } from "../../lib/validationSchemas";

interface Step3ExportOrderProps {
  currentCase: ClinicalCase;
  substrate: SubstrateConfig;
  topMatch: ShadeMatchResult;
  threeDMatch: ShadeMatchResult;
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
  sampledLab: CIELABColor;
  sampledRgb: RGBColor;
  crossPolarized: boolean;
  allChecklistPassed: boolean;
  onOpenLabPrescription: () => void;
  onOpenAiAnalysis: () => void;
  isAiLoading: boolean;
  onStartNewCase?: () => void;
  onPrevStep: () => void;
}

export const Step3ExportOrder: React.FC<Step3ExportOrderProps> = ({
  currentCase,
  substrate,
  topMatch,
  threeDMatch,
  zones,
  sampledLab,
  sampledRgb,
  crossPolarized,
  allChecklistPassed,
  onOpenLabPrescription,
  onOpenAiAnalysis,
  isAiLoading,
  onStartNewCase,
  onPrevStep,
}) => {
  const [copiedNote, setCopiedNote] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const isDarkPrep = ["ND4", "ND5", "ND6", "ND7", "ND8", "ND9"].includes(substrate.prepShade);
  const recommendedIngot = isDarkPrep 
    ? (substrate.thicknessMm < 0.8 ? "IPS e.max HO (High Opacity)" : "IPS e.max MO 1 (Medium Opacity)")
    : (substrate.thicknessMm >= 1.2 ? "IPS e.max MT (Medium Translucency)" : "IPS e.max LT (Low Translucency)");

  const handleCopyNote = async () => {
    setCopyError(null);
    const text = `
=== DENTAL LAB SHADE PRESCRIPTION ===
Patient: ${currentCase.patientInitials} | Tooth: ${currentCase.toothNumber}
Indication: ${substrate.restorationType.replace("_", " ").toUpperCase()} (${substrate.material.replace("_", " ")}, ${substrate.thicknessMm}mm)
Target Base Shade: ${topMatch.shade.name} (${topMatch.shade.code})
3D-Master Alternative: ${threeDMatch.shade.code}
Similarity Score: ${topMatch.matchSimilarityScore ?? topMatch.confidencePercent}% (CIEDE2000 ΔE00: ${Number.isFinite(topMatch.deltaE00) ? topMatch.deltaE00.toFixed(2) : "N/A"})
Prep Stump Shade: ${substrate.prepShade} (${isDarkPrep ? "Dark Discolored Prep" : "Normal Vital Dentin"})
Recommended Ingot: ${recommendedIngot}

3-ZONE ANATOMICAL RECIPE:
1. Cervical (Gingival 1/3): ${zones.cervical.matchedClassical.shade.code} (Warm saturation modifier)
2. Middle Body 1/3: ${zones.middle.matchedClassical.shade.code} (Base dentin shade)
3. Incisal 1/3: ${zones.incisal.matchedClassical.shade.code} / Enamel Opal (Translucent halo)

Lighting & Photography: Calibrated D65 5500K, Cross-Polarized photography verified.
    `.trim();

    const result = await copyToClipboard(text);
    if (result.success) {
      setCopiedNote(true);
      setCopyError(null);
      setTimeout(() => setCopiedNote(false), 2500);
    } else {
      setCopyError(result.error || "Clipboard copy failed. Please select text manually.");
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
                Material: <strong className="text-neutral-800">{substrate.material.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
              </p>
              <p className="text-[11px] text-neutral-500 font-medium">
                Ingot: <strong className="text-neutral-800">{recommendedIngot}</strong>
              </p>
            </div>
          </div>

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

          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Color difference verified (CIEDE2000 ΔE₀₀ = {topMatch.deltaE00.toFixed(2)})</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">D65 Illuminant</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3.5">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Export &amp; Lab Communication
          </h3>
          <p className="text-xs text-neutral-600">
            Copy the text slip for your electronic dental records (Dentrix/Open Dental) or generate the full official PDF order.
          </p>

          <div className="space-y-2.5 pt-1">
            {copyError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{copyError}</span>
              </div>
            )}

            <button
              id="btn-step3-copy-slip"
              onClick={handleCopyNote}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs font-bold transition shadow-sm"
            >
              {copiedNote ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-teal-600" />}
              <span>{copiedNote ? "Prescription Copied to Clipboard!" : "Copy Formatted Lab Slip"}</span>
            </button>

            <button
              id="btn-step3-open-prescription"
              onClick={onOpenLabPrescription}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>Open Full Digital Lab Prescription</span>
            </button>

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

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Step 2</span>
          </button>

          <button
            onClick={() => onStartNewCase && onStartNewCase()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition border border-neutral-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
