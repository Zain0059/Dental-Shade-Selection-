import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  Sparkles, 
  ShieldCheck,
  Send,
  AlertCircle
} from "lucide-react";
import { 
  CIELABColor, 
  ClinicalCase, 
  MunsellColor, 
  ShadeMatchResult, 
  SubstrateConfig, 
  ZoneData 
} from "../types/dental";
import { calculateCeramicRecipe } from "../lib/dentalShadesData";
import { copyToClipboard } from "../lib/validationSchemas";

interface LabPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: ClinicalCase;
  targetMatch: ShadeMatchResult;
  sampledLab: CIELABColor;
  munsell: MunsellColor;
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
  substrate: SubstrateConfig;
  crossPolarized: boolean;
}

export const LabPrescriptionModal: React.FC<LabPrescriptionModalProps> = ({
  isOpen,
  onClose,
  currentCase,
  targetMatch,
  sampledLab,
  munsell,
  zones,
  substrate,
  crossPolarized,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape key press & autofocus close button on open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus close button for accessible keyboard navigation
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const recipe = calculateCeramicRecipe(targetMatch.shade.code, substrate);

  const handleCopyText = async () => {
    setCopyError(null);
    const text = `
=== DENTAL LABORATORY SHADE PRESCRIPTION & CERAMIC WORK ORDER ===
Generated via Dental Shade-Selection Engine (CIELAB / CIEDE2000)

CASE INFORMATION:
- Patient Initials: ${currentCase.patientInitials}
- Tooth Number: ${currentCase.toothNumber}
- Indication: ${substrate.restorationType.replace("_", " ").toUpperCase()}
- Material: ${substrate.material.replace("_", " ").toUpperCase()}
- Layer Thickness: ${substrate.thicknessMm} mm
- Prep / Stump Die Shade: ${substrate.prepShade}

COLORIMETRIC TARGET (CIELAB & MUNSELL):
- Target Shade: ${targetMatch.shade.name} (${targetMatch.shade.code})
- CIELAB: L*=${sampledLab.L.toFixed(1)}, a*=${sampledLab.a.toFixed(1)}, b*=${sampledLab.b.toFixed(1)}
- Munsell: Hue=${munsell.hue}, Value=${munsell.value.toFixed(1)} (Primary Determinant), Chroma=${munsell.chroma.toFixed(1)}
- CIEDE2000 Match: ΔE₀₀ = ${Number.isFinite(targetMatch.deltaE00) ? targetMatch.deltaE00.toFixed(2) : "N/A"} (${targetMatch.trafficLight.toUpperCase()})
- Similarity Index: ${targetMatch.matchSimilarityScore ?? targetMatch.confidencePercent}%

3-ZONE ANATOMICAL SHADE MAP:
1. Cervical (Gingival 1/3): ${zones.cervical.matchedClassical.shade.code} (Warm Chroma: L*=${zones.cervical.sampledLab.L.toFixed(1)}, b*=+${zones.cervical.sampledLab.b.toFixed(1)})
2. Middle Body (Core 1/3): ${zones.middle.matchedClassical.shade.code} / ${zones.middle.matched3D.shade.code} (Base Shade)
3. Incisal (Edge 1/3): ${zones.incisal.matchedClassical.shade.code} (Translucency: ${zones.incisal.translucencyIndex}%, Opal Halo Effect)

CERAMIC FORMULATION & INVENTORY:
- Recommended Ingot/Disc: ${recipe.recommendedIngot} (Opacity: ${recipe.recommendedOpacity})
- Cervical Accentuation: ${recipe.cervicalRecipe}
- Core Body Powder: ${recipe.bodyRecipe}
- Incisal Enamel Powder: ${recipe.incisalRecipe}
- Firing Cycle Advice: ${recipe.firingAdvice}

SPECIAL CLINICAL NOTES:
${currentCase.clinicalNotes || "None specified."}
Cross-Polarization Verified: ${crossPolarized ? "YES (Glare-free internal anatomy)" : "NO"}
Illuminant: D65 Standard (6504K, CRI > 90, 2° Observer)
================================================================
    `.trim();

    const result = await copyToClipboard(text);
    if (result.success) {
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2500);
    } else {
      setCopyError(result.error || "Clipboard copy failed. Please select text manually.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-prescription-title"
      aria-describedby="lab-prescription-desc"
    >
      <div 
        id="modal-lab-prescription"
        className="bg-white border border-neutral-300 rounded-t-2xl sm:rounded-2xl max-w-3xl w-full p-6 text-neutral-900 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-600/30 flex items-center justify-center text-teal-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="lab-prescription-title" className="text-lg font-bold text-neutral-900">Laboratory Ceramic Prescription</h2>
              <p id="lab-prescription-desc" className="text-xs text-neutral-500">Standardized Work Order for Dental Master Ceramists</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close prescription modal"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / Viewable Work Order Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Top Case Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-100 p-3.5 rounded-xl border border-neutral-300 print-break-inside-avoid">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Patient / Tooth</div>
              <div className="text-sm font-bold text-neutral-900">{currentCase.patientInitials} &bull; {currentCase.toothNumber}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Restoration</div>
              <div className="text-sm font-bold text-neutral-900 capitalize">{substrate.restorationType.replace("_", " ")}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Material &amp; Thickness</div>
              <div className="text-sm font-bold text-teal-600">{substrate.thicknessMm} mm</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-mono">Prep Die Shade</div>
              <div className="text-sm font-bold text-amber-700 font-mono">{substrate.prepShade}</div>
            </div>
          </div>

          {/* Colorimetric Target & Match */}
          <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-200 space-y-2 print-break-inside-avoid">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800">Target Color Match:</span>
              <span className="font-mono text-teal-700 font-bold text-sm">{targetMatch.shade.name} ({targetMatch.shade.code})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-300/60 font-mono text-[11px] text-neutral-600">
              <div>L*: <strong>{Number.isFinite(sampledLab.L) ? sampledLab.L.toFixed(1) : "N/A"}</strong></div>
              <div>a*: <strong>{Number.isFinite(sampledLab.a) ? sampledLab.a.toFixed(1) : "N/A"}</strong></div>
              <div>b*: <strong>{Number.isFinite(sampledLab.b) ? sampledLab.b.toFixed(1) : "N/A"}</strong></div>
              <div>ΔE₀₀: <strong className="text-emerald-600">{Number.isFinite(targetMatch.deltaE00) ? targetMatch.deltaE00.toFixed(2) : "N/A"}</strong></div>
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">
              Munsell System: <strong>{munsell.notation}</strong> (Value Priority Index: {Number.isFinite(munsell.value) ? munsell.value.toFixed(1) : "N/A"}/10)
            </div>
          </div>

          {/* 3-Zone Layering Prescription Table */}
          <div className="space-y-2 print-break-inside-avoid">
            <div className="font-bold text-neutral-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>3-Zone Anatomical Layering Table</span>
            </div>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Zone</th>
                    <th className="p-2.5">Shade Code</th>
                    <th className="p-2.5">CIELAB (L* a* b*)</th>
                    <th className="p-2.5">Characteristics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white/60">
                  <tr>
                    <td className="p-2.5 font-bold text-amber-700">Cervical 1/3</td>
                    <td className="p-2.5 font-mono font-bold text-neutral-900">{zones.cervical.matchedClassical.shade.code}</td>
                    <td className="p-2.5 font-mono text-neutral-500">{zones.cervical.sampledLab.L.toFixed(1)} / +{zones.cervical.sampledLab.a.toFixed(1)} / +{zones.cervical.sampledLab.b.toFixed(1)}</td>
                    <td className="p-2.5 text-neutral-600">High chroma saturation (+b*), warm ochre modifier</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-teal-700">Middle Body 1/3</td>
                    <td className="p-2.5 font-mono font-bold text-neutral-900">{zones.middle.matchedClassical.shade.code}</td>
                    <td className="p-2.5 font-mono text-neutral-500">{zones.middle.sampledLab.L.toFixed(1)} / +{zones.middle.sampledLab.a.toFixed(1)} / +{zones.middle.sampledLab.b.toFixed(1)}</td>
                    <td className="p-2.5 text-neutral-600">True base dentin core, dominant aesthetic value</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-700">Incisal 1/3</td>
                    <td className="p-2.5 font-mono font-bold text-neutral-900">{zones.incisal.matchedClassical.shade.code}</td>
                    <td className="p-2.5 font-mono text-neutral-500">{zones.incisal.sampledLab.L.toFixed(1)} / {zones.incisal.sampledLab.a.toFixed(1)} / +{zones.incisal.sampledLab.b.toFixed(1)}</td>
                    <td className="p-2.5 text-neutral-600">Opalescent enamel (OE1), mamelon lobes, amber rim</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ceramic Recipe & Ingot Details */}
          <div className="bg-neutral-100/50 p-4 rounded-xl border border-neutral-300 space-y-2.5 print-break-inside-avoid">
            <div className="font-bold text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Ceramic Layering &amp; Ingot Recipe</span>
            </div>
            <div className="space-y-1.5 text-neutral-600">
              <p><strong>Substructure Ingot:</strong> <span className="font-mono text-teal-700">{recipe.recommendedIngot}</span> (Opacity: {recipe.recommendedOpacity})</p>
              <p><strong>Cervical Characterization:</strong> {recipe.cervicalRecipe}</p>
              <p><strong>Body Dentin:</strong> {recipe.bodyRecipe}</p>
              <p><strong>Incisal &amp; Opal Enamel:</strong> {recipe.incisalRecipe}</p>
              <p className="text-[11px] text-neutral-500"><strong>Firing Profile:</strong> {recipe.firingAdvice}</p>
            </div>
          </div>

          {/* Print/Laboratory Verification Section */}
          <div className="pt-2 border-t border-neutral-300/80 text-[11px] text-neutral-500 flex flex-col sm:flex-row justify-between gap-3 print-break-inside-avoid">
            <div>
              <span>Verification standard: <strong>ISO/TR 28642:2016 Dental Colorimetry</strong></span>
              <div className="text-[10px] text-neutral-400">Illuminant D65, 2° observer geometry, cross-polarized verification.</div>
            </div>
            <div className="pt-4 sm:pt-0 border-t sm:border-t-0 border-neutral-300 sm:text-right">
              <div className="text-[10px] text-neutral-400">Ceramist Signature &amp; Date</div>
              <div className="w-48 sm:ml-auto border-b border-neutral-400 mt-4"></div>
            </div>
          </div>
        </div>

        {/* Error Feedback if Clipboard fails */}
        {copyError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{copyError}</span>
          </div>
        )}

        {/* Footer Actions (Hidden on Print) */}
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between gap-3 print-actions-hidden">
          <button
            onClick={handleCopyText}
            aria-label="Copy standardized dental prescription to clipboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Work Order"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Print lab slip"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close prescription modal and return to case"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-sm transition focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

