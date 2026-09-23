import React from "react";
import { 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sun, 
  Sparkles, 
  Sliders, 
  ChevronLeft,
  Eye,
  Info
} from "lucide-react";
import { CeramicMaterial, RestorationType, RGBColor, ShadeMatchResult, SubstrateConfig, ZoneData } from "../../types/dental";
import { calculateCeramicRecipe } from "../../lib/dentalShadesData";

interface Step2SelectShadeProps {
  sampledRgb: RGBColor;
  topMatch: ShadeMatchResult;
  allClassicalMatches: ShadeMatchResult[];
  threeDMatch: ShadeMatchResult;
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
  substrate: SubstrateConfig;
  onChangeSubstrate: (updated: Partial<SubstrateConfig>) => void;
  onSelectShade: (match: ShadeMatchResult) => void;
  onOpenAiAnalysis: () => void;
  isAiLoading: boolean;
  activeZoneFilter: "all" | "cervical" | "middle" | "incisal";
  onSelectZoneFilter: (zone: "all" | "cervical" | "middle" | "incisal") => void;
  childrenCanvas?: React.ReactNode;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step2SelectShade: React.FC<Step2SelectShadeProps> = ({
  sampledRgb,
  topMatch,
  allClassicalMatches,
  threeDMatch,
  zones,
  substrate,
  onChangeSubstrate,
  onSelectShade,
  onOpenAiAnalysis,
  isAiLoading,
  activeZoneFilter,
  onSelectZoneFilter,
  childrenCanvas,
  onPrevStep,
  onNextStep,
}) => {
  const isInvalidMeasurement = !topMatch || topMatch.trafficLight === "invalid" || Number.isNaN(topMatch.deltaE00);
  const targetShadeCode = topMatch?.shade?.code || "A2";
  const dynamicRecipe = calculateCeramicRecipe(targetShadeCode, substrate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
      {/* Left Column: Visual Canvas & Zonal Comparison */}
      <div className="lg:col-span-6 space-y-4 min-w-0">
        {/* Real-time Tooth Canvas Viewport */}
        {childrenCanvas && (
          <div className="w-full">
            {childrenCanvas}
          </div>
        )}

        {/* 3-Zone Anatomical Layering Breakdown */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                3-Zone Colorimeter Mapping
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500">Click to focus on zone</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Cervical (Gingival) */}
            <button
              type="button"
              onClick={() => onSelectZoneFilter(activeZoneFilter === "cervical" ? "all" : "cervical")}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                activeZoneFilter === "cervical"
                  ? "bg-amber-50/80 border-amber-500 ring-1 ring-amber-500/40 shadow-sm"
                  : "bg-neutral-50/80 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" />
                  Cervical
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800">
                  {zones.cervical.isMeasured ? zones.cervical.matchedClassical.shade.code : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded-md border border-neutral-300 shadow-inner shrink-0"
                  style={{
                    backgroundColor: zones.cervical.isMeasured ? zones.cervical.sampledRgb.hex : "#e5e5e5",
                  }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-neutral-600 block truncate">
                    {zones.cervical.isMeasured ? `ΔE ${zones.cervical.matchedClassical.deltaE00.toFixed(2)}` : "Not measured"}
                  </span>
                </div>
              </div>
            </button>

            {/* Middle (Body) */}
            <button
              type="button"
              onClick={() => onSelectZoneFilter(activeZoneFilter === "middle" ? "all" : "middle")}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                activeZoneFilter === "middle"
                  ? "bg-teal-50/80 border-teal-600 ring-1 ring-teal-600/40 shadow-sm"
                  : "bg-neutral-50/80 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-teal-600" />
                  Body
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800">
                  {zones.middle.isMeasured ? zones.middle.matchedClassical.shade.code : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded-md border border-neutral-300 shadow-inner shrink-0"
                  style={{
                    backgroundColor: zones.middle.isMeasured ? zones.middle.sampledRgb.hex : "#e5e5e5",
                  }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-neutral-600 block truncate">
                    {zones.middle.isMeasured ? `ΔE ${zones.middle.matchedClassical.deltaE00.toFixed(2)}` : "Not measured"}
                  </span>
                </div>
              </div>
            </button>

            {/* Incisal */}
            <button
              type="button"
              onClick={() => onSelectZoneFilter(activeZoneFilter === "incisal" ? "all" : "incisal")}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                activeZoneFilter === "incisal"
                  ? "bg-sky-50/80 border-sky-500 ring-1 ring-sky-500/40 shadow-sm"
                  : "bg-neutral-50/80 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  Incisal
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800">
                  {zones.incisal.isMeasured ? zones.incisal.matchedClassical.shade.code : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded-md border border-neutral-300 shadow-inner shrink-0"
                  style={{
                    backgroundColor: zones.incisal.isMeasured ? zones.incisal.sampledRgb.hex : "#e5e5e5",
                  }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-neutral-600 block truncate">
                    {zones.incisal.isMeasured ? `ΔE ${zones.incisal.matchedClassical.deltaE00.toFixed(2)}` : "Not measured"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Match, Candidate Swatches, Substrate, AI Assistant */}
      <div className="lg:col-span-6 space-y-4 min-w-0">
        {/* Primary Match Hero Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Primary Clinical Match
                </span>
                {isInvalidMeasurement ? (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Invalid Measurement
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {topMatch.matchSimilarityScore ?? topMatch.confidencePercent}% Proximity Index
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-neutral-900 mt-1.5 tracking-tight flex items-baseline gap-2">
                {topMatch.shade.name}
                <span className="text-sm font-semibold text-neutral-500 font-mono">
                  (or {threeDMatch.shade.code} 3D-Master)
                </span>
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                {topMatch.shade.description} &bull; Group {topMatch.shade.categoryGroup}
              </p>
            </div>

            {/* Visual Swatch Comparison Pill */}
            <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200 shrink-0">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/60 shadow-inner"
                  style={{ backgroundColor: sampledRgb.hex }}
                />
                <span className="text-[10px] text-neutral-500 font-semibold block mt-1">Sampled</span>
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

          {/* Colorimetry & Candidate Shade Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                Closest Matching Tabs:
              </span>
              <div className="text-[11px] text-neutral-500 font-mono">
                CIEDE2000 ΔE₀₀ ={" "}
                {Number.isFinite(topMatch.deltaE00) ? (
                  <strong className="text-emerald-600 font-bold">{topMatch.deltaE00.toFixed(2)}</strong>
                ) : (
                  <strong className="text-red-600 font-bold">N/A (Invalid)</strong>
                )}{" "}
                <span className="text-neutral-400">
                  ({isInvalidMeasurement
                    ? "Review Coordinates"
                    : topMatch.trafficLight === "red"
                    ? "Outside acceptance threshold"
                    : topMatch.trafficLight === "yellow"
                    ? "Within acceptance threshold"
                    : "Below perceptibility threshold"})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {allClassicalMatches.slice(0, 6).map((match) => {
                const isSelected = topMatch.shade.id === match.shade.id;
                return (
                  <button
                    key={match.shade.id}
                    onClick={() => onSelectShade(match)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-teal-600 text-white shadow-sm font-bold ring-1 ring-teal-700"
                        : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-300"
                    }`}
                  >
                    <span>{match.shade.code}</span>
                    <span className={`text-[10px] ${isSelected ? "text-teal-100" : "text-neutral-500"}`}>
                      (ΔE {Number.isFinite(match.deltaE00) ? match.deltaE00.toFixed(1) : "—"})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Substrate Preparation & Restoration Parameters */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-teal-600" />
              Preparation Stump &amp; Substrate (ND)
            </span>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
              {substrate.prepShade}
            </span>
          </div>

          {/* Stump Shade Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {([
              { code: "ND1", label: "ND1 Bleach" },
              { code: "ND2", label: "ND2 Vital" },
              { code: "ND3", label: "ND3 Medium" },
              { code: "ND4", label: "ND4 Dark" },
              { code: "ND5", label: "ND5 Stained" },
              { code: "ND7", label: "ND7 Devital" },
            ] as const).map((item) => (
              <button
                key={item.code}
                onClick={() => onChangeSubstrate({ prepShade: item.code })}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition text-center ${
                  substrate.prepShade === item.code
                    ? "bg-teal-600 text-white border-teal-600 font-bold shadow-sm"
                    : "bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Ingot Opacity Recommendation */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Ceramic Ingot &amp; Opacity Recommendation
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                Opacity: {dynamicRecipe.recommendedOpacity} | Difficulty: {dynamicRecipe.maskingDifficulty}
              </span>
            </div>
            <div className="text-teal-950 font-semibold text-xs leading-relaxed">
              {dynamicRecipe.recommendedIngot}
            </div>
          </div>

          {/* Restoration Geometry Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Restoration</span>
              <select
                value={substrate.restorationType}
                onChange={(e) => {
                  const val = e.target.value as RestorationType;
                  let defaultThickness = 0.6;
                  if (val === "anterior_crown") defaultThickness = 1.0;
                  if (val === "posterior_crown") defaultThickness = 1.5;
                  if (val === "inlay_onlay") defaultThickness = 1.2;
                  if (val === "implant_crown") defaultThickness = 1.5;
                  onChangeSubstrate({ restorationType: val, thicknessMm: defaultThickness });
                }}
                className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-neutral-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
              >
                <option value="porcelain_veneer">Anterior Veneer (0.6mm)</option>
                <option value="anterior_crown">Anterior Crown (1.0mm)</option>
                <option value="posterior_crown">Posterior Crown (1.5mm)</option>
                <option value="inlay_onlay">Inlay / Onlay (1.2mm)</option>
                <option value="implant_crown">Implant Crown (1.5mm)</option>
              </select>
            </div>

            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Material</span>
              <select
                value={substrate.material}
                onChange={(e) => onChangeSubstrate({ material: e.target.value as CeramicMaterial })}
                className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-neutral-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
              >
                <option value="lithium_disilicate">IPS e.max (Disilicate)</option>
                <option value="zirconia_multilayer_5y">5Y High Translucent Zirconia</option>
                <option value="zirconia_multilayer_4y">4Y Aesthetic Zirconia</option>
                <option value="zirconia_opaque_3y">3Y Opaque Zirconia</option>
                <option value="feldspathic_porcelain">Feldspathic Porcelain</option>
                <option value="hybrid_ceramic">Hybrid Ceramic</option>
              </select>
            </div>

            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Thickness</span>
                <span className="text-teal-700 font-bold font-mono text-xs">
                  {substrate.thicknessMm.toFixed(1)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={substrate.thicknessMm}
                onChange={(e) => onChangeSubstrate({ thicknessMm: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-teal-600 my-1"
                aria-label="Restoration thickness in millimeters"
              />
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span>0.3mm</span>
                <span className="text-teal-800 font-semibold truncate text-[9px]">
                  {substrate.restorationType === "porcelain_veneer" ? "Veneer (0.6)" :
                   substrate.restorationType === "anterior_crown" ? "Ant. (1.0)" :
                   substrate.restorationType === "posterior_crown" ? "Post. (1.5)" :
                   substrate.restorationType === "inlay_onlay" ? "Inlay (1.2)" : "Implant (1.5)"}
                </span>
                <span>2.0mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Master Ceramist Formulation Callout */}
        <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-400">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h4 className="font-bold text-sm text-white">AI Master Ceramist Formulation</h4>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Generate an optical layering recipe including body dentin blends, incisal opalescent powders, and cervical modifiers.
          </p>
          <button
            id="btn-step2-ai-recipe"
            onClick={onOpenAiAnalysis}
            disabled={isAiLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : "text-teal-100"}`} />
            <span>{isAiLoading ? "Computing AI Recipe..." : "Generate AI Master Ceramist Recipe"}</span>
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition border border-neutral-300 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Step 1</span>
          </button>

          <button
            id="btn-step2-proceed"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
          >
            <span>Proceed to Step 3: Review &amp; Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
