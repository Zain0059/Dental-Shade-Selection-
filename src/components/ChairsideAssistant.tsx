import React, { useState } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Sun, 
  Layers, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Send,
  Zap,
  Info
} from "lucide-react";
import { 
  CIELABColor, 
  ClinicalCase, 
  RGBColor, 
  ShadeMatchResult, 
  SubstrateConfig, 
  ZoneData 
} from "../types/dental";

interface ChairsideAssistantProps {
  currentCase: ClinicalCase;
  sampledLab: CIELABColor;
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
  onOpenLabPrescription: () => void;
  isAiLoading: boolean;
  activeZoneFilter: "all" | "cervical" | "middle" | "incisal";
  onSelectZoneFilter: (zone: "all" | "cervical" | "middle" | "incisal") => void;
  crossPolarized: boolean;
  onTogglePolarized: () => void;
}

export const ChairsideAssistant: React.FC<ChairsideAssistantProps> = ({
  currentCase,
  sampledLab,
  sampledRgb,
  topMatch,
  allClassicalMatches,
  threeDMatch,
  zones,
  substrate,
  onChangeSubstrate,
  onSelectShade,
  onOpenAiAnalysis,
  onOpenLabPrescription,
  isAiLoading,
  activeZoneFilter,
  onSelectZoneFilter,
  crossPolarized,
  onTogglePolarized,
}) => {
  const [copiedNote, setCopiedNote] = useState(false);

  // Is substrate dark?
  const isDarkPrep = ["ND4", "ND5", "ND6", "ND7", "ND8", "ND9"].includes(substrate.prepShade);

  const handleCopyChairsideNote = () => {
    const text = `
DENTAL LAB SHADE ORDER
Patient: ${currentCase.patientInitials} | Tooth: ${currentCase.toothNumber}
Indication: ${substrate.restorationType.replace("_", " ").toUpperCase()} (${substrate.material.replace("_", " ")})
Target Shade: ${topMatch.shade.name} (${topMatch.shade.code}) | 3D-Master: ${threeDMatch.shade.code}
Prep Shade: ${substrate.prepShade} (${isDarkPrep ? "Dark prep - Needs Medium Opacity Ingot" : "Normal Vital Dentin"})
3-Zone Map:
- Gingival 1/3: ${zones.cervical.matchedClassical.shade.code} (Warm saturation)
- Middle Body 1/3: ${zones.middle.matchedClassical.shade.code} (Base shade)
- Incisal 1/3: ${zones.incisal.matchedClassical.shade.code} (Translucent Enamel / Opal)
Match Confidence: ${topMatch.confidencePercent}% (ΔE00: ${topMatch.deltaE00.toFixed(2)})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* 1. Primary Recommended Shade Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                Recommended Clinical Shade
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {topMatch.confidencePercent}% Match Quality
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {topMatch.shade.name}
              <span className="text-sm font-normal text-slate-400 ml-2 font-mono">
                (or {threeDMatch.shade.code} 3D-Master)
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {topMatch.shade.description} &bull; Category {topMatch.shade.categoryGroup}
            </p>
          </div>

          {/* Side-by-Side Visual Comparison Swatch */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 shrink-0">
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-inner"
                style={{ backgroundColor: sampledRgb.hex }}
              />
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Sampled</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500" />

            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg border-2 border-cyan-400/80 shadow-md shadow-cyan-500/20"
                style={{
                  backgroundColor: `rgb(${Math.round(topMatch.shade.lab.L * 2.55)}, ${Math.round(topMatch.shade.lab.L * 2.35)}, ${Math.round(topMatch.shade.lab.L * 2.05)})`,
                }}
              />
              <span className="text-[10px] text-cyan-300 font-bold block mt-1">{topMatch.shade.code}</span>
            </div>
          </div>
        </div>

        {/* Quick Alternative Shade Switcher */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Closest alternatives:</span>
            {allClassicalMatches.slice(0, 4).map((match) => {
              const isSelected = topMatch.shade.id === match.shade.id;
              return (
                <button
                  key={match.shade.id}
                  onClick={() => onSelectShade(match)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <span>{match.shade.code}</span>
                  <span className={`text-[10px] ${isSelected ? "text-slate-900" : "text-slate-400"}`}>
                    ({match.confidencePercent}%)
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            ΔE₀₀ = <strong className="text-emerald-400">{topMatch.deltaE00.toFixed(2)}</strong> (Imperceptible Blend)
          </div>
        </div>
      </div>

      {/* 2. 3-Zone Simple Clinical Layering Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">3-Zone Tooth Recipe (For Lab Ceramists)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Click a zone to isolate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cervical */}
          <button
            onClick={() => onSelectZoneFilter(activeZoneFilter === "cervical" ? "all" : "cervical")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
              activeZoneFilter === "cervical"
                ? "bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50"
                : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                Gingival 1/3
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-100 bg-slate-900/80 px-2 py-0.5 rounded">
                {zones.cervical.matchedClassical.shade.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Warmer emergence profile with elevated natural dentin chroma.
            </p>
          </button>

          {/* Middle Body */}
          <button
            onClick={() => onSelectZoneFilter(activeZoneFilter === "middle" ? "all" : "middle")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
              activeZoneFilter === "middle"
                ? "bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50"
                : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Middle Body
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-100 bg-slate-900/80 px-2 py-0.5 rounded">
                {zones.middle.matchedClassical.shade.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Main base dentin shade. Dictates overall smile value &amp; brightness.
            </p>
          </button>

          {/* Incisal Edge */}
          <button
            onClick={() => onSelectZoneFilter(activeZoneFilter === "incisal" ? "all" : "incisal")}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
              activeZoneFilter === "incisal"
                ? "bg-blue-950/40 border-blue-400 ring-1 ring-blue-400/50"
                : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Incisal 1/3
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-100 bg-slate-900/80 px-2 py-0.5 rounded">
                {zones.incisal.matchedClassical.shade.code} / Opal
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              High translucency with natural opalescent halo &amp; mamelon lobes.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Prep Shade / Substrate Quick Toggle & 1-Click Lab Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Prep Stump Shade Quick Check */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Prepared Stump / Die Shade</span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              {substrate.prepShade}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeSubstrate({ prepShade: "ND2" })}
              className={`flex-1 p-2 rounded-xl border text-xs font-medium transition ${
                substrate.prepShade === "ND2" || substrate.prepShade === "ND1"
                  ? "bg-cyan-950/50 border-cyan-400 text-cyan-300 font-bold"
                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Light / Vital (ND1-ND2)
            </button>
            <button
              onClick={() => onChangeSubstrate({ prepShade: "ND5" })}
              className={`flex-1 p-2 rounded-xl border text-xs font-medium transition ${
                isDarkPrep
                  ? "bg-amber-950/50 border-amber-400 text-amber-300 font-bold"
                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
              }`}
            >
              Dark / Stained (ND5)
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            {isDarkPrep
              ? "Dark stump detected: We recommend an IPS e.max MO 1 (Medium Opacity) ingot to mask the substrate."
              : "Light vital stump: Standard Low Translucency (LT A2) ingot will blend seamlessly."}
          </p>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-200 block mb-1">Chairside Lab &amp; AI Tools</span>
            <p className="text-[11px] text-slate-400">
              Copy note for your lab prescription or generate an AI ceramic formulation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-chairside-copy-note"
              onClick={handleCopyChairsideNote}
              className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {copiedNote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedNote ? "Copied to Clipboard!" : "Copy Lab Note"}</span>
            </button>

            <button
              id="btn-chairside-ai-advice"
              onClick={onOpenAiAnalysis}
              disabled={isAiLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : "text-cyan-200"}`} />
              <span>{isAiLoading ? "Analyzing..." : "AI Recipe"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
