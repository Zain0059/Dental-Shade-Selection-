import React from "react";
import { 
  Sliders, 
  Layers, 
  ShieldAlert, 
  HelpCircle, 
  Sparkles, 
  CheckCircle,
  FileCheck
} from "lucide-react";
import { 
  CeramicMaterial, 
  DieShadeND, 
  RestorationType, 
  SubstrateConfig 
} from "../types/dental";
import { STUMP_DIE_SHADES, calculateCeramicRecipe } from "../lib/dentalShadesData";

interface SubstratePreparationPanelProps {
  substrate: SubstrateConfig;
  onChangeSubstrate: (updated: Partial<SubstrateConfig>) => void;
  targetShadeCode: string;
}

export const SubstratePreparationPanel: React.FC<SubstratePreparationPanelProps> = ({
  substrate,
  onChangeSubstrate,
  targetShadeCode,
}) => {
  const recipe = calculateCeramicRecipe(targetShadeCode, substrate);

  return (
    <div id="substrate-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            Substrate &amp; Material Compensation
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Stump Shade ND1–ND9 &bull; Opacity Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Substrate & Preparation Controls */}
        <div className="space-y-3.5">
          {/* 1. Stump / Die Shade Selector (ND1 - ND9) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Stump / Prep Die Shade (ND System):</span>
              <span className="font-mono text-cyan-400 font-bold">{substrate.prepShade}</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
              {(Object.keys(STUMP_DIE_SHADES) as DieShadeND[]).map((nd) => {
                const info = STUMP_DIE_SHADES[nd];
                const isSelected = substrate.prepShade === nd;

                return (
                  <button
                    key={nd}
                    onClick={() => onChangeSubstrate({ prepShade: nd })}
                    className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition ${
                      isSelected
                        ? "bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-sm"
                        : "bg-slate-800/40 border-slate-700 hover:bg-slate-800"
                    }`}
                    title={`${info.label}: ${info.description}`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border border-black/30 shadow-inner mb-1"
                      style={{ backgroundColor: info.hex }}
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-200">{nd}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {STUMP_DIE_SHADES[substrate.prepShade].description}
            </p>
          </div>

          {/* 2. Restoration Indication */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Restoration Type:</label>
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
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="porcelain_veneer">Porcelain Veneer (Minimal Prep 0.3–0.7mm)</option>
              <option value="anterior_crown">Anterior Full Crown (Aesthetic Zone 1.0–1.2mm)</option>
              <option value="posterior_crown">Posterior Crown (High Strength 1.5–2.0mm)</option>
              <option value="inlay_onlay">Inlay / Onlay Partial Restoration (1.0–1.5mm)</option>
              <option value="implant_crown">Implant Abutment Crown (Titanium/Zirconia Custom)</option>
            </select>
          </div>

          {/* 3. Ceramic Material Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ceramic Material Choice:</label>
            <select
              value={substrate.material}
              onChange={(e) => onChangeSubstrate({ material: e.target.value as CeramicMaterial })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="lithium_disilicate">IPS e.max (Lithium Disilicate Press / CAD)</option>
              <option value="zirconia_multilayer_5y">Katana UTML (5Y-PSZ Ultra-Translucent Zirconia)</option>
              <option value="zirconia_multilayer_4y">Katana STML (4Y-PSZ Universal Aesthetic Zirconia)</option>
              <option value="zirconia_opaque_3y">Katana HTML / 3Y-TZP (High Masking Zirconia)</option>
              <option value="feldspathic_porcelain">Feldspathic Porcelain (Refractory Master Veneer)</option>
              <option value="hybrid_ceramic">Hybrid Polymer-Infiltrated Ceramic (VITA Enamic)</option>
            </select>
          </div>

          {/* 4. Layer Thickness Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Restoration Thickness:</span>
              <span className="font-mono font-bold text-cyan-400">{substrate.thicknessMm.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={substrate.thicknessMm}
              onChange={(e) => onChangeSubstrate({ thicknessMm: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.3mm (Ultra-Thin)</span>
              <span>1.0mm (Standard Crown)</span>
              <span>2.0mm (Posterior)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Laboratory Ceramic Ingot & Masking Prescription */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Laboratory Ingot Selection
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                recipe.maskingDifficulty === "Low"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : recipe.maskingDifficulty === "Moderate"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}>
                Masking Difficulty: {recipe.maskingDifficulty}
              </span>
            </div>

            {/* Ingot Code Box */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Recommended Ingot &amp; Opacity:</div>
              <div className="text-sm font-bold text-slate-100 font-mono text-cyan-300">
                {recipe.recommendedIngot}
              </div>
              <div className="text-[11px] text-slate-400">
                Opacity Grade: <strong>{recipe.recommendedOpacity}</strong> (High Translucent HT vs Medium Opacity MO)
              </div>
            </div>

            {/* Substrate Compensation Explanation */}
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong>Substrate Factor:</strong> Under vital stump <strong>{substrate.prepShade}</strong> with a <strong>{substrate.thicknessMm}mm</strong> thickness, the laboratory must employ <strong>{recipe.recommendedOpacity}</strong> opacity to prevent underlying core show-through while matching target <strong>{targetShadeCode}</strong>.
              </p>
              <p className="text-[11px] text-slate-400">
                <strong>Try-In Paste:</strong> Recommend verifying with <em>Neutral</em> or <em>Warm +1</em> water-soluble try-in paste prior to final resin cementation.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Target Match: {targetShadeCode}</span>
            <span>Prep: {substrate.prepShade}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
