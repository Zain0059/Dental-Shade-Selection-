import React from "react";
import { 
  Activity, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { CIELABColor, MunsellColor, RGBColor, ShadeMatchResult } from "../types/dental";

interface ColorMetricsPanelProps {
  sampledLab: CIELABColor;
  sampledRgb: RGBColor;
  munsell: MunsellColor;
  classicalMatches: ShadeMatchResult[];
  threeDMatches: ShadeMatchResult[];
  bleachMatches: ShadeMatchResult[];
  activeSystemTab: "classical" | "3d_master" | "bleach";
  onSelectSystemTab: (tab: "classical" | "3d_master" | "bleach") => void;
  onSelectSpecificMatch: (match: ShadeMatchResult) => void;
  selectedMatch: ShadeMatchResult | null;
}

export const ColorMetricsPanel: React.FC<ColorMetricsPanelProps> = ({
  sampledLab,
  sampledRgb,
  munsell,
  classicalMatches,
  threeDMatches,
  bleachMatches,
  activeSystemTab,
  onSelectSystemTab,
  onSelectSpecificMatch,
  selectedMatch,
}) => {
  const topMatch = 
    activeSystemTab === "classical"
      ? classicalMatches[0]
      : activeSystemTab === "3d_master"
      ? threeDMatches[0]
      : bleachMatches[0];

  const currentMatch = selectedMatch || topMatch;

  return (
    <div id="color-metrics-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            Color Science &amp; Quantified Metrics
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          CIEDE2000 &bull; ΔE₀₀
        </span>
      </div>

      {/* Traffic Light Accuracy & Match Banner */}
      {currentMatch && (
        <div 
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
            currentMatch.trafficLight === "green"
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              : currentMatch.trafficLight === "yellow"
              ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
              : "bg-rose-950/30 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Traffic Light Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
              currentMatch.trafficLight === "green"
                ? "bg-emerald-500 shadow-emerald-500/30"
                : currentMatch.trafficLight === "yellow"
                ? "bg-amber-500 shadow-amber-500/30"
                : "bg-rose-500 shadow-rose-500/30"
            }`}>
              {currentMatch.trafficLight === "green" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : currentMatch.trafficLight === "yellow" ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-100">{currentMatch.shade.name}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  currentMatch.trafficLight === "green"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : currentMatch.trafficLight === "yellow"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}>
                  {currentMatch.trafficLight === "green"
                    ? "Good Match (ΔE ≤ 1.6)"
                    : currentMatch.trafficLight === "yellow"
                    ? "Acceptable Match (ΔE ≤ 3.2)"
                    : "Adjust / Unacceptable (ΔE > 3.2)"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{currentMatch.shade.description}</p>
            </div>
          </div>

          {/* Color Difference Numbers */}
          <div className="flex items-center gap-4 text-right self-end sm:self-center font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">CIEDE2000</div>
              <div className="text-base font-bold text-slate-100">ΔE₀₀ {currentMatch.deltaE00.toFixed(2)}</div>
            </div>
            <div className="border-l border-slate-700 pl-4">
              <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
              <div className="text-base font-bold text-cyan-400">{currentMatch.confidencePercent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Dual Coordinate Grid: CIELAB (Left) + Munsell System (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. CIELAB Coordinate Card */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              CIELAB (L* a* b*) Space
            </span>
            <span className="text-[10px] font-mono text-slate-400">D65 / 2° Standard</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">L* (Lightness)</div>
              <div className="text-sm font-bold text-slate-100">{sampledLab.L.toFixed(1)}</div>
              <div className="text-[9px] text-slate-500">0..100</div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">a* (Red-Green)</div>
              <div className="text-sm font-bold text-emerald-400">{sampledLab.a >= 0 ? `+${sampledLab.a.toFixed(1)}` : sampledLab.a.toFixed(1)}</div>
              <div className="text-[9px] text-slate-500">Red (+) / Grn (-)</div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">b* (Yellow-Blue)</div>
              <div className="text-sm font-bold text-amber-400">{sampledLab.b >= 0 ? `+${sampledLab.b.toFixed(1)}` : sampledLab.b.toFixed(1)}</div>
              <div className="text-[9px] text-slate-500">Yel (+) / Blu (-)</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Chroma C*ab: <strong className="text-slate-200">{sampledLab.chroma?.toFixed(1)}</strong></span>
            <span>Hue Angle hab: <strong className="text-slate-200">{sampledLab.hueAngle?.toFixed(1)}°</strong></span>
          </div>
        </div>

        {/* 2. Munsell System Translation (Value prioritized) */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Munsell System Translation
            </span>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
              Value Priority #1
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Value (Lightness / Darkness) - Highlighted */}
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
              <div className="text-[10px] text-amber-300 font-sans font-bold">Value (0-10)</div>
              <div className="text-sm font-extrabold text-white">{munsell.value.toFixed(1)}</div>
              <div className="text-[9px] text-amber-400/80">Lightness Step</div>
            </div>

            {/* Chroma (Saturation) */}
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Chroma (Sat)</div>
              <div className="text-sm font-bold text-slate-100">{munsell.chroma.toFixed(1)}</div>
              <div className="text-[9px] text-slate-500">Intensity</div>
            </div>

            {/* Hue (Color Family) */}
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Hue Family</div>
              <div className="text-xs font-bold text-slate-100 truncate">{munsell.hue.split(" ")[0]}</div>
              <div className="text-[9px] text-slate-500">Yellow-Red</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Notation: <strong className="text-amber-300">{munsell.notation}</strong></span>
            <span className="text-[10px] text-slate-400 italic">Value dictates eye acceptance</span>
          </div>
        </div>
      </div>

      {/* Visual Swatch Comparison: Sampled Pixel vs Matched Shade */}
      {currentMatch && (
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center space-y-1">
              <div
                className="w-12 h-10 rounded-lg border border-white/20 shadow-inner"
                style={{ backgroundColor: sampledRgb.hex }}
              />
              <span className="text-[10px] text-slate-400 font-medium block">Sampled Point</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500" />

            <div className="text-center space-y-1">
              <div
                className="w-12 h-10 rounded-lg border border-white/20 shadow-inner"
                style={{
                  backgroundColor: `rgb(${Math.round(currentMatch.shade.lab.L * 2.5)}, ${Math.round(currentMatch.shade.lab.L * 2.3)}, ${Math.round(currentMatch.shade.lab.L * 2.0)})`,
                }}
              />
              <span className="text-[10px] text-cyan-300 font-bold block">{currentMatch.shade.code}</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-0.5">
            <div>Recommended Ingot: <strong className="text-cyan-300">{currentMatch.shade.recommendedIngot || "IPS e.max LT"}</strong></div>
            <div className="text-[11px] text-slate-400">Calculated under standard dental Illuminant D65 (5500K-6500K CRI&gt;90).</div>
          </div>
        </div>
      )}

      {/* Standard Dental Database Tabs: VITA Classical vs 3D-Master vs Bleach */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ranked Database Matches
          </span>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onSelectSystemTab("classical")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "classical"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              VITA Classical (A1–D4)
            </button>
            <button
              onClick={() => onSelectSystemTab("3d_master")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "3d_master"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              VITA 3D-Master
            </button>
            <button
              onClick={() => onSelectSystemTab("bleach")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "bleach"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bleach Guides
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-2">
          {(activeSystemTab === "classical"
            ? classicalMatches
            : activeSystemTab === "3d_master"
            ? threeDMatches
            : bleachMatches
          ).map((m, idx) => (
            <div
              key={m.shade.id}
              onClick={() => onSelectSpecificMatch(m)}
              className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                currentMatch?.shade.id === m.shade.id
                  ? "bg-cyan-950/30 border-cyan-500/50 shadow-sm"
                  : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center justify-center font-bold">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                    <span>{m.shade.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({m.shade.categoryGroup})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    L*:{m.shade.lab.L} a*:{m.shade.lab.a} b*:{m.shade.lab.b} &bull; Munsell: {m.shade.munsell.notation}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    m.trafficLight === "green"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : m.trafficLight === "yellow"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    ΔE₀₀ {m.deltaE00.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Match {m.confidencePercent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
