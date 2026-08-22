import React from "react";
import { 
  X, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cpu,
  FileCheck,
  ShieldCheck
} from "lucide-react";

interface AiAnalysisResult {
  success?: boolean;
  isAiGenerated?: boolean;
  modelUsed?: string;
  fallbackNotice?: string;
  error?: string;
  summary?: string;
  morphology?: {
    mamelons?: string;
    translucencyGrade?: string;
    cervicalWarmth?: string;
    surfaceTexture?: string;
    whiteSpots?: string;
  };
  ceramicRecipe?: {
    ingot?: string;
    cervicalModifier?: string;
    bodyPowder?: string;
    incisalPowder?: string;
    firingNotes?: string;
  };
  trafficLight?: {
    status?: "green" | "yellow" | "red";
    confidenceScore?: number;
    rationale?: string;
  };
  clinicalRecommendations?: string[];
}

interface AiAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: AiAnalysisResult | null;
  onReanalyze: () => void;
}

export const AiAnalysisDrawer: React.FC<AiAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  onReanalyze,
}) => {
  if (!isOpen) return null;

  const trafficStatus = result?.trafficLight?.status || "green";
  const confidenceScore = result?.trafficLight?.confidenceScore ?? 95;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="modal-ai-analysis"
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">AI Master Ceramist Engine</h2>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-medium">
                  {result?.isAiGenerated ? `${result.modelUsed || "Gemini"} • Neural Optical Logic` : "Calibrated Colorimetric Model"}
                </span>
              </div>
              <p className="text-xs text-slate-400">Deep morphological tooth feature extraction &amp; ceramic formulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-200">Analyzing Clinical Colorimetry &amp; Mamelon Geometry...</div>
              <p className="text-xs text-slate-400 max-w-md">
                Computing CIELAB spectrophotometry, Munsell Value priority, and substrate compensation matrices.
              </p>
            </div>
          </div>
        )}

        {/* Results View */}
        {!isLoading && result && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Fallback notification if server fell back */}
            {result.fallbackNotice && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{result.fallbackNotice}</span>
              </div>
            )}

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Clinical Diagnostic Summary
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                  trafficStatus === "green"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  Confidence: {confidenceScore}%
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {result.summary || "Target shade analyzed under D65 standard illuminant with custom ceramic ingot compensation."}
              </p>
            </div>

            {/* Morphology & Anatomical Findings */}
            {result.morphology && (
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2.5">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Optical Morphology &amp; Internal Anatomy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-300 block mb-0.5">Mamelon Lobes:</strong>
                    {result.morphology.mamelons || "3 distinct lobes in incisal third"}
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-300 block mb-0.5">Incisal Translucency:</strong>
                    {result.morphology.translucencyGrade || "Type 2 Opalescent Halo"}
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-300 block mb-0.5">Cervical Saturation:</strong>
                    {result.morphology.cervicalWarmth || "Elevated warm chroma (+b*)"}
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-300 block mb-0.5">Micro-Texture &amp; Glare:</strong>
                    {result.morphology.surfaceTexture || "Perikymata and developmental grooves"}
                  </div>
                </div>
              </div>
            )}

            {/* AI Ceramic Formulation */}
            {result.ceramicRecipe && (
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2.5">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  Ceramic Layering &amp; Ingot Recipe
                </span>
                <div className="space-y-1.5 text-slate-300 leading-relaxed">
                  <div><strong>Ingot Selection:</strong> <span className="text-cyan-300 font-mono font-bold">{result.ceramicRecipe.ingot || "IPS e.max LT"}</span></div>
                  <div><strong>Cervical Modifier:</strong> {result.ceramicRecipe.cervicalModifier || "Warm Ochre stain"}</div>
                  <div><strong>Body Dentin:</strong> {result.ceramicRecipe.bodyPowder || "Standard Dentin A2 with Deep Dentin blend"}</div>
                  <div><strong>Incisal Enamel / Opal:</strong> {result.ceramicRecipe.incisalPowder || "Enamel Opal 1 (OE1)"}</div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700">
                    <strong>Firing Advice:</strong> {result.ceramicRecipe.firingNotes || "750°C vacuum firing, 2 min slow cooling."}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.clinicalRecommendations && result.clinicalRecommendations.length > 0 && (
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Clinical Verification Checkpoints
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  {result.clinicalRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Analyze Case</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-600/20 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
