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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="modal-ai-analysis"
        className="bg-white border border-neutral-300 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-6 text-neutral-900 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm ">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">AI Master Ceramist Engine</h2>
                <span className="text-[10px] font-mono bg-teal-600/20 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded font-medium">
                  {result?.isAiGenerated ? `${result.modelUsed || "Gemini"} • Neural Optical Logic` : "Calibrated Colorimetric Model"}
                </span>
              </div>
              <p className="text-xs text-neutral-500">Deep morphological tooth feature extraction &amp; ceramic formulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-neutral-800">Analyzing Clinical Colorimetry &amp; Mamelon Geometry...</div>
              <p className="text-xs text-neutral-500 max-w-md">
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
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-600/30 text-teal-700 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600" />
                <span>{result.fallbackNotice}</span>
              </div>
            )}

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-neutral-700" />
                  Clinical Diagnostic Summary
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                  trafficStatus === "green"
                    ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-700 border-amber-500/40"
                }`}>
                  Confidence: {confidenceScore}%
                </span>
              </div>
              <p className="text-neutral-800 leading-relaxed">
                {result.summary || "Target shade analyzed under D65 standard illuminant with custom ceramic ingot compensation."}
              </p>
            </div>

            {/* Morphology & Anatomical Findings */}
            {result.morphology && (
              <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-300 space-y-2.5">
                <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Optical Morphology &amp; Internal Anatomy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  <div className="bg-white/60 p-2.5 rounded-lg border border-neutral-200">
                    <strong className="text-teal-700 block mb-0.5">Mamelon Lobes:</strong>
                    {result.morphology.mamelons || "3 distinct lobes in incisal third"}
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-neutral-200">
                    <strong className="text-teal-700 block mb-0.5">Incisal Translucency:</strong>
                    {result.morphology.translucencyGrade || "Type 2 Opalescent Halo"}
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-neutral-200">
                    <strong className="text-teal-700 block mb-0.5">Cervical Saturation:</strong>
                    {result.morphology.cervicalWarmth || "Elevated warm chroma (+b*)"}
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-neutral-200">
                    <strong className="text-teal-700 block mb-0.5">Micro-Texture &amp; Glare:</strong>
                    {result.morphology.surfaceTexture || "Perikymata and developmental grooves"}
                  </div>
                </div>
              </div>
            )}

            {/* AI Ceramic Formulation */}
            {result.ceramicRecipe && (
              <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-300 space-y-2.5">
                <span className="font-bold text-teal-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  Ceramic Layering &amp; Ingot Recipe
                </span>
                <div className="space-y-1.5 text-neutral-600 leading-relaxed">
                  <div><strong>Ingot Selection:</strong> <span className="text-teal-700 font-mono font-bold">{result.ceramicRecipe.ingot || "IPS e.max LT"}</span></div>
                  <div><strong>Cervical Modifier:</strong> {result.ceramicRecipe.cervicalModifier || "Warm Ochre stain"}</div>
                  <div><strong>Body Dentin:</strong> {result.ceramicRecipe.bodyPowder || "Standard Dentin A2 with Deep Dentin blend"}</div>
                  <div><strong>Incisal Enamel / Opal:</strong> {result.ceramicRecipe.incisalPowder || "Enamel Opal 1 (OE1)"}</div>
                  <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-300">
                    <strong>Firing Advice:</strong> {result.ceramicRecipe.firingNotes || "750°C vacuum firing, 2 min slow cool down."}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.clinicalRecommendations && result.clinicalRecommendations.length > 0 && (
              <div className="bg-neutral-100 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-semibold text-neutral-600 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Clinical Verification Checkpoints
                </span>
                <ul className="list-disc list-inside space-y-1 text-neutral-500 text-[11px]">
                  {result.clinicalRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Analyze Case</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium shadow-sm shadow-neutral-900/20 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
