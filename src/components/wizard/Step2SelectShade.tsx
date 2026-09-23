import React from "react";
import { Stethoscope, AlertCircle, CheckCircle2, ArrowRight, Layers, Sun, Sparkles, Sliders, ChevronLeft } from "lucide-react";
import { RGBColor, ShadeMatchResult, SubstrateConfig, ZoneData } from "../../types/dental";

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
  onPrevStep,
  onNextStep,
}) => {
  const isInvalidMeasurement = !topMatch || topMatch.trafficLight === "invalid" || Number.isNaN(topMatch.deltaE00);
  const isDarkPrep = ["ND4", "ND5", "ND6", "ND7", "ND8", "ND9"].includes(substrate.prepShade);
  const recommendedIngot = "Material-specific selection required; confirm with the ceramist";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 hidden" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
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
                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {topMatch.matchSimilarityScore ?? topMatch.confidencePercent}% Similarity Index
                  </span>
                )}
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
                      ({match.matchSimilarityScore ?? match.confidencePercent}%)
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-neutral-500 font-mono">
              CIEDE2000 ΔE₀₀ ={" "}
              {Number.isFinite(topMatch.deltaE00) ? (
                <strong className="text-emerald-600 font-bold">{topMatch.deltaE00.toFixed(2)}</strong>
              ) : (
                <strong className="text-red-600 font-bold">N/A (Invalid)</strong>
              )}{" "}
              ({isInvalidMeasurement ? "Review Coordinates" : topMatch.trafficLight === "red" ? "Outside acceptance threshold" : topMatch.trafficLight === "yellow" ? "Within acceptance threshold" : "Below perceptibility threshold"})
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-neutral-900">3-Zone Anatomical Layering Breakdown</h3>
            </div>
            <span className="text-[11px] text-neutral-500">Sample each zone in Step 1</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                {zones.cervical.description}
              </p>
            </button>

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
                {zones.middle.description}
              </p>
            </button>

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
                  {zones.incisal.matchedClassical.shade.code}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-snug">
                {zones.incisal.description}
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
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

          <div className="grid grid-cols-3 gap-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Restoration</span>
              <select
                value={substrate.restorationType}
                onChange={(e) => onChangeSubstrate({ restorationType: e.target.value as any })}
                className="w-full bg-transparent border-b border-neutral-300 pb-1 text-neutral-800 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="porcelain_veneer">VENEER</option>
                <option value="anterior_crown">ANTERIOR CROWN</option>
                <option value="posterior_crown">POSTERIOR CROWN</option>
                <option value="inlay_onlay">INLAY/ONLAY</option>
                <option value="implant_crown">IMPLANT CROWN</option>
              </select>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Material</span>
              <select
                value={substrate.material}
                onChange={(e) => onChangeSubstrate({ material: e.target.value as any })}
                className="w-full bg-transparent border-b border-neutral-300 pb-1 text-neutral-800 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="lithium_disilicate">IPS e.max</option>
                <option value="zirconia_multilayer_5y">5Y Zirconia</option>
                <option value="zirconia_multilayer_4y">4Y Zirconia</option>
                <option value="zirconia_opaque_3y">3Y Zirconia</option>
                <option value="feldspathic_porcelain">Feldspathic</option>
                <option value="hybrid_ceramic">Hybrid</option>
              </select>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Thickness</span>
              <span className="text-teal-700 font-semibold font-mono flex items-center justify-between">
                {substrate.thicknessMm} mm
              </span>
            </div>
          </div>
        </div>

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

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onPrevStep}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Step 1</span>
          </button>

          <button
            id="btn-step2-proceed"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition"
          >
            <span>Proceed to Step 3: Export &amp; Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
