import React, { useState } from "react";
import { 
  Activity, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers,
  ArrowRight,
  TrendingUp,
  Info,
  X
} from "lucide-react";
import { DATABASE_MEASUREMENT_STANDARDS } from "../lib/dentalShadesData";
import { useCaseContext } from "../context/CaseContext";

export const ColorMetricsPanel: React.FC = () => {
  const { state, dispatch, classicalMatches, threeDMatches, bleachMatches } = useCaseContext();
  const { sampledLab, sampledRgb, munsell, activeSystemTab, selectedMatch } = state;
  
  const onSelectSystemTab = (tab: "classical" | "3d_master" | "bleach") => dispatch({ type: "SET_SYSTEM_TAB", payload: tab });
  const onSelectSpecificMatch = (match: any) => dispatch({ type: "SELECT_SHADE", payload: match });
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  const topMatch = 
    activeSystemTab === "classical"
      ? classicalMatches[0]
      : activeSystemTab === "3d_master"
      ? threeDMatches[0]
      : bleachMatches[0];

  const currentMatch = selectedMatch || topMatch;
  const isInvalid = !currentMatch || currentMatch.trafficLight === "invalid" || Number.isNaN(currentMatch?.deltaE00);

  return (
    <div id="color-metrics-panel" className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
            Color Science &amp; Quantified Metrics
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStandardsModal(true)}
            className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-1 rounded transition"
            title="View ISO/TR 28642 Measurement Standards and Database Conditions"
            aria-label="View Database Standards and Measurement Conditions"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Standards &amp; Conditions</span>
          </button>
          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
            CIEDE2000 &bull; ΔE₀₀
          </span>
        </div>
      </div>

      {/* Traffic Light Accuracy & Match Banner */}
      {isInvalid ? (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 flex items-center gap-3">
          <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-rose-900">Measurement Invalid / Non-Finite Coordinate</div>
            <p className="text-xs text-rose-700 mt-0.5">
              The sampled point or color space calculation returned non-finite coordinates. Click a valid tooth pixel region to measure CIEDE2000 difference accurately.
            </p>
          </div>
        </div>
      ) : currentMatch && (
        <div 
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
            currentMatch.trafficLight === "green"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : currentMatch.trafficLight === "yellow"
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "bg-rose-50 border-rose-300 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Traffic Light Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-neutral-900 shadow-sm ${
              currentMatch.trafficLight === "green"
                ? "bg-emerald-500 text-white"
                : currentMatch.trafficLight === "yellow"
                ? "bg-amber-500 text-white"
                : "bg-rose-500 text-white"
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-neutral-900">{currentMatch.shade.name}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  currentMatch.trafficLight === "green"
                    ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/40"
                    : currentMatch.trafficLight === "yellow"
                    ? "bg-amber-500/20 text-amber-700 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-700 border border-rose-500/40"
                }`}>
                  {currentMatch.trafficLight === "green"
                    ? "Good Match (ΔE ≤ 0.8)"
                    : currentMatch.trafficLight === "yellow"
                    ? "Acceptable Match (ΔE ≤ 1.8)"
                    : "Adjust / Unacceptable (ΔE > 1.8)"}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">{currentMatch.shade.description}</p>
            </div>
          </div>

          {/* Color Difference Numbers */}
          <div className="flex items-center gap-4 text-right self-end sm:self-center font-mono">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">CIEDE2000</div>
              <div className="text-base font-bold text-neutral-900">ΔE₀₀ {currentMatch.deltaE00.toFixed(2)}</div>
            </div>
            <div className="border-l border-neutral-300 pl-4">
              <div className="text-[10px] text-neutral-500 uppercase">Similarity Score</div>
              <div className="text-base font-bold text-teal-600" title="Linear proximity index derived from CIEDE2000 (not a Bayesian probability)">
                {currentMatch.matchSimilarityScore ?? currentMatch.confidencePercent}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dual Coordinate Grid: CIELAB (Left) + Munsell System (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. CIELAB Coordinate Card */}
        <div className="bg-neutral-100 border border-neutral-300/70 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              CIELAB (L* a* b*) Space
            </span>
            <span className="text-[10px] font-mono text-neutral-500">D65 / 2° Standard</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-white p-2 rounded-lg border border-neutral-200">
              <div className="text-[10px] text-neutral-500 font-sans">L* (Lightness)</div>
              <div className="text-sm font-bold text-neutral-900">
                {Number.isFinite(sampledLab.L) ? sampledLab.L.toFixed(1) : "N/A"}
              </div>
              <div className="text-[9px] text-neutral-400">0..100</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-neutral-200">
              <div className="text-[10px] text-neutral-500 font-sans">a* (Red-Green)</div>
              <div className="text-sm font-bold text-emerald-600">
                {Number.isFinite(sampledLab.a)
                  ? sampledLab.a >= 0 ? `+${Number.isFinite(sampledLab.a) ? sampledLab.a.toFixed(1) : "N/A"}` : sampledLab.a.toFixed(1)
                  : "N/A"}
              </div>
              <div className="text-[9px] text-neutral-400">Red (+) / Grn (-)</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-neutral-200">
              <div className="text-[10px] text-neutral-500 font-sans">b* (Yellow-Blue)</div>
              <div className="text-sm font-bold text-amber-600">
                {Number.isFinite(sampledLab.b)
                  ? sampledLab.b >= 0 ? `+${Number.isFinite(sampledLab.b) ? sampledLab.b.toFixed(1) : "N/A"}` : sampledLab.b.toFixed(1)
                  : "N/A"}
              </div>
              <div className="text-[9px] text-neutral-400">Yel (+) / Blu (-)</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-neutral-300/50">
            <span>Chroma C*ab: <strong className="text-neutral-800">{Number.isFinite(sampledLab.chroma) ? sampledLab.chroma?.toFixed(1) : "N/A"}</strong></span>
            <span>Hue Angle hab: <strong className="text-neutral-800">{Number.isFinite(sampledLab.hueAngle) ? `${sampledLab.hueAngle?.toFixed(1)}°` : "N/A"}</strong></span>
          </div>
        </div>

        {/* 2. Munsell System Translation (Value prioritized) */}
        <div className="bg-neutral-100 border border-neutral-300/70 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Munsell System Translation
            </span>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/30">
              Value Priority #1
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Value (Lightness / Darkness) - Highlighted */}
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
              <div className="text-[10px] text-amber-700 font-sans font-bold">Value (0-10)</div>
              <div className="text-sm font-extrabold text-neutral-900">
                {Number.isFinite(munsell.value) ? munsell.value.toFixed(1) : "N/A"}
              </div>
              <div className="text-[9px] text-amber-600/80">Lightness Step</div>
            </div>

            {/* Chroma (Saturation) */}
            <div className="bg-white p-2 rounded-lg border border-neutral-200">
              <div className="text-[10px] text-neutral-500 font-sans">Chroma (Sat)</div>
              <div className="text-sm font-bold text-neutral-900">
                {Number.isFinite(munsell.chroma) ? munsell.chroma.toFixed(1) : "N/A"}
              </div>
              <div className="text-[9px] text-neutral-400">Intensity</div>
            </div>

            {/* Hue (Color Family) */}
            <div className="bg-white p-2 rounded-lg border border-neutral-200">
              <div className="text-[10px] text-neutral-500 font-sans">Hue Family</div>
              <div className="text-xs font-bold text-neutral-900 truncate">{munsell.hue.split(" ")[0]}</div>
              <div className="text-[9px] text-neutral-400">Yellow-Red</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-neutral-300/50">
            <span>Notation: <strong className="text-amber-700">{munsell.notation}</strong></span>
            <span className="text-[10px] text-neutral-500 italic">Value dictates clinical eye acceptance</span>
          </div>
        </div>
      </div>

      {/* Visual Swatch Comparison: Sampled Pixel vs Matched Shade */}
      {!isInvalid && currentMatch && (
        <div className="bg-neutral-100 p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center space-y-1">
              <div
                className="w-12 h-10 rounded-lg border border-white/20 shadow-inner"
                style={{ backgroundColor: sampledRgb.hex }}
              />
              <span className="text-[10px] text-neutral-500 font-medium block">Sampled Point</span>
            </div>

            <ArrowRight className="w-4 h-4 text-neutral-400" />

            <div className="text-center space-y-1">
              <div
                className="w-12 h-10 rounded-lg border border-white/20 shadow-inner"
                style={{
                  backgroundColor: `rgb(${Math.round(currentMatch.shade.lab.L * 2.5)}, ${Math.round(currentMatch.shade.lab.L * 2.3)}, ${Math.round(currentMatch.shade.lab.L * 2.0)})`,
                }}
              />
              <span className="text-[10px] text-teal-700 font-bold block">{currentMatch.shade.code}</span>
            </div>
          </div>

          <div className="text-xs text-neutral-600 space-y-0.5">
            <div>Recommended Ingot: <strong className="text-teal-700">{currentMatch.shade.recommendedIngot || "IPS e.max LT"}</strong></div>
            <div className="text-[11px] text-neutral-500">Calculated under standard dental Illuminant D65 (6504K, 2° observer, SCE cross-polarized).</div>
          </div>
        </div>
      )}

      {/* Standard Dental Database Tabs: VITA Classical vs 3D-Master vs Bleach */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Ranked Database Matches
          </span>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-300">
            <button
              onClick={() => onSelectSystemTab("classical")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "classical"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              VITA Classical (A1–D4)
            </button>
            <button
              onClick={() => onSelectSystemTab("3d_master")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "3d_master"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              VITA 3D-Master
            </button>
            <button
              onClick={() => onSelectSystemTab("bleach")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                activeSystemTab === "bleach"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
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
          ).map((m, idx) => {
            const mIsInvalid = m.trafficLight === "invalid" || Number.isNaN(m.deltaE00);
            return (
              <div
                key={m.shade.id}
                onClick={() => onSelectSpecificMatch(m)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                  currentMatch?.shade.id === m.shade.id
                    ? "bg-teal-50 border-teal-600/50 shadow-sm"
                    : "bg-neutral-100 border-neutral-300/60 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-600 text-[11px] font-mono flex items-center justify-center font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900">
                      <span>{m.shade.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">({m.shade.categoryGroup})</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      L*:{m.shade.lab.L} a*:{m.shade.lab.a} b*:{m.shade.lab.b} &bull; Munsell: {m.shade.munsell.notation}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    {mIsInvalid ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-700 border border-rose-300">
                        Invalid
                      </span>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        m.trafficLight === "green"
                          ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                          : m.trafficLight === "yellow"
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-600 border border-rose-500/30"
                      }`}>
                        ΔE₀₀ {m.deltaE00.toFixed(2)}
                      </span>
                    )}
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      Similarity {mIsInvalid ? "N/A" : `${m.matchSimilarityScore ?? m.confidencePercent}%`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Measurement Standards Documentation Modal */}
      {showStandardsModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="standards-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                <h3 id="standards-modal-title" className="font-bold text-base text-neutral-900">
                  Shade Database &amp; Measurement Standards
                </h3>
              </div>
              <button
                onClick={() => setShowStandardsModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition"
                aria-label="Close standards modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700">
              <p className="leading-relaxed">
                Dental shade matching colorimetry is computed in compliance with <strong>{DATABASE_MEASUREMENT_STANDARDS.standard}</strong>:
              </p>

              <div className="bg-neutral-50 rounded-xl p-3.5 space-y-2 border border-neutral-200 font-mono text-[11px]">
                <div><span className="text-neutral-500">Illuminant:</span> <strong className="text-neutral-900">{DATABASE_MEASUREMENT_STANDARDS.illuminant}</strong></div>
                <div><span className="text-neutral-500">Standard Observer:</span> <strong className="text-neutral-900">{DATABASE_MEASUREMENT_STANDARDS.observer}</strong></div>
                <div><span className="text-neutral-500">Geometry:</span> <strong className="text-neutral-900">{DATABASE_MEASUREMENT_STANDARDS.measuringGeometry}</strong></div>
                <div><span className="text-neutral-500">Polarization:</span> <strong className="text-neutral-900">{DATABASE_MEASUREMENT_STANDARDS.specularComponent}</strong></div>
                <div><span className="text-neutral-500">Perceptibility Threshold (PT):</span> <strong className="text-emerald-700">ΔE₀₀ ≤ {DATABASE_MEASUREMENT_STANDARDS.perceptibilityThresholdDeltaE00}</strong></div>
                <div><span className="text-neutral-500">Acceptability Threshold (AT):</span> <strong className="text-amber-700">ΔE₀₀ ≤ {DATABASE_MEASUREMENT_STANDARDS.acceptabilityThresholdDeltaE00}</strong></div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
                <strong>Similarity Score Disclosure:</strong>
                <p className="mt-1 text-[11px] leading-relaxed text-teal-800">
                  {DATABASE_MEASUREMENT_STANDARDS.disclaimer}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowStandardsModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
