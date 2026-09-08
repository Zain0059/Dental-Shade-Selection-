import React, { useRef, useEffect, useState, useCallback } from "react";
import { 
  Layers, 
  Sparkles, 
  Pipette, 
  Target, 
  Sliders, 
  RefreshCw, 
  Maximize2, 
  Eye, 
  EyeOff,
  Sun,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { CIELABColor, RGBColor } from "../types/dental";
import { CLINICAL_CASES, drawToothOnCanvas } from "../lib/sampleCases";
import { sRGBToCIELAB, calculateDeltaE00 } from "../lib/colorScience";
import { useCaseContext } from "../context/CaseContext";

export const ToothCanvasViewer: React.FC = () => {
  const { state, dispatch } = useCaseContext();
  const {
    currentCase,
    crossPolarized,
    isCalibrated,
    calibrationMultipliers,
    sampledPoint,
    customImage,
    activeZoneFilter
  } = state;

  const onTogglePolarized = () => dispatch({ type: "TOGGLE_POLARIZATION" });
  
  const onCalibrateFromPoint = (sampledGrayRgb: RGBColor) => {
    const target = 119;
    const rMult = sampledGrayRgb.r > 0 ? target / sampledGrayRgb.r : 1.0;
    const gMult = sampledGrayRgb.g > 0 ? target / sampledGrayRgb.g : 1.0;
    const bMult = sampledGrayRgb.b > 0 ? target / sampledGrayRgb.b : 1.0;
    dispatch({ type: "APPLY_CALIBRATION", payload: { multipliers: { r: rMult, g: gMult, b: bMult } } });
  };
  
  const onResetCalibration = () => dispatch({ type: "RESET_CALIBRATION" });
  
  const onSelectSamplePoint = (point: { x: number; y: number }, rawRgb: RGBColor, _lab?: CIELABColor) => {
    dispatch({ type: "SAMPLE_POINT", payload: { point, rawRgb } });
  };
  
  const cases = CLINICAL_CASES;
  const onSelectCase = (c: any) => dispatch({ type: "LOAD_CASE", payload: { caseItem: c } });
  const onSelectZoneFilter = (z: "all" | "cervical" | "middle" | "incisal") => dispatch({ type: "SET_ZONE_FILTER", payload: z });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [showZones, setShowZones] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sampleRadius, setSampleRadius] = useState<number>(3); // 1, 3, 5, 15 pixels
  const [isCalibratingMode, setIsCalibratingMode] = useState(false);
  const [hoverColor, setHoverColor] = useState<{ rgb: RGBColor; lab: CIELABColor } | null>(null);
  const [showAdvancedImaging, setShowAdvancedImaging] = useState(false);

  const canvasWidth = 500;
  const canvasHeight = 440;

  const getCleanCanvas = () => {
    if (!cleanCanvasRef.current) {
      cleanCanvasRef.current = document.createElement("canvas");
      cleanCanvasRef.current.width = canvasWidth;
      cleanCanvasRef.current.height = canvasHeight;
    }
    return cleanCanvasRef.current;
  };

  // Render canvas whenever state changes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cleanCanvas = getCleanCanvas();
    const cleanCtx = cleanCanvas.getContext("2d");
    if (!cleanCtx) return;

    if (customImage) {
      // Draw user uploaded image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = customImage;
      img.onload = () => {
        // 1. Offscreen clean canvas receives raw un-overlayed image
        cleanCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        cleanCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // 2. Visible canvas receives clean image first
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(cleanCanvas, 0, 0, canvasWidth, canvasHeight);

        // 3. Draw overlays only on visible canvas
        if (showHeatmap) {
          const grad = ctx.createLinearGradient(canvasWidth * 0.5, 50, canvasWidth * 0.5, canvasHeight - 50);
          grad.addColorStop(0, "rgba(239, 68, 68, 0.35)");
          grad.addColorStop(0.3, "rgba(245, 158, 11, 0.35)");
          grad.addColorStop(0.65, "rgba(34, 197, 94, 0.35)");
          grad.addColorStop(0.9, "rgba(59, 130, 246, 0.35)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // Draw zone guidelines
        if (showZones) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);

          ctx.beginPath();
          ctx.moveTo(30, canvasHeight * 0.33);
          ctx.lineTo(canvasWidth - 30, canvasHeight * 0.33);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(30, canvasHeight * 0.66);
          ctx.lineTo(canvasWidth - 30, canvasHeight * 0.66);
          ctx.stroke();

          ctx.setLineDash([]);
        }
      };
    } else {
      // 1. Draw pure tooth without overlays to clean canvas for isolated sampling
      drawToothOnCanvas(
        cleanCtx,
        canvasWidth,
        canvasHeight,
        currentCase.id,
        crossPolarized,
        calibrationMultipliers,
        false,
        false
      );

      // 2. Mirror clean image to visible canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(cleanCanvas, 0, 0, canvasWidth, canvasHeight);

      // 3. Draw visible overlays on display context
      if (showHeatmap) {
        const grad = ctx.createLinearGradient(canvasWidth * 0.5, 50, canvasWidth * 0.5, canvasHeight - 50);
        grad.addColorStop(0, "rgba(239, 68, 68, 0.35)");
        grad.addColorStop(0.3, "rgba(245, 158, 11, 0.35)");
        grad.addColorStop(0.65, "rgba(34, 197, 94, 0.35)");
        grad.addColorStop(0.9, "rgba(59, 130, 246, 0.35)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      if (showZones) {
        ctx.save();
        ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        const toothY = 55;
        const toothH = canvasHeight * 0.72;
        const toothX = canvasWidth * 0.5;
        const toothW = canvasWidth * 0.44;

        const y1 = toothY + toothH * 0.33;
        ctx.beginPath();
        ctx.moveTo(toothX - toothW * 0.55, y1);
        ctx.lineTo(toothX + toothW * 0.55, y1);
        ctx.stroke();

        const y2 = toothY + toothH * 0.66;
        ctx.beginPath();
        ctx.moveTo(toothX - toothW * 0.55, y2);
        ctx.lineTo(toothX + toothW * 0.55, y2);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillStyle = "#60a5fa";
        ctx.fillText("CERVICAL (Warmer Chroma)", toothX + toothW * 0.58, toothY + toothH * 0.18);
        ctx.fillText("BODY / MIDDLE (Base Shade)", toothX + toothW * 0.58, toothY + toothH * 0.5);
        ctx.fillText("INCISAL (Translucency/Opal)", toothX + toothW * 0.58, toothY + toothH * 0.82);
        ctx.restore();
      }
    }
  }, [
    customImage,
    currentCase.id,
    crossPolarized,
    calibrationMultipliers,
    showZones,
    showHeatmap,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Canvas Click to sample color or calibrate reference card
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    // Sample from clean canvas to prevent overlay contamination (heatmaps, zone dividers)
    const samplingCtx = cleanCanvasRef.current?.getContext("2d") || canvas.getContext("2d");
    if (!samplingCtx) return;

    // Sample pixel or average area ROI
    const radius = sampleRadius;
    const startX = Math.max(0, x - Math.floor(radius / 2));
    const startY = Math.max(0, y - Math.floor(radius / 2));
    const size = Math.max(1, radius);

    const imgData = samplingCtx.getImageData(startX, startY, size, size);
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    const count = imgData.data.length / 4;

    for (let i = 0; i < imgData.data.length; i += 4) {
      totalR += imgData.data[i];
      totalG += imgData.data[i + 1];
      totalB += imgData.data[i + 2];
    }

    const r = Math.round(totalR / count);
    const g = Math.round(totalG / count);
    const b = Math.round(totalB / count);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    const rgb: RGBColor = { r, g, b, hex };
    const lab = sRGBToCIELAB(r, g, b);

    if (isCalibratingMode) {
      onCalibrateFromPoint(rgb);
      setIsCalibratingMode(false);
    } else {
      onSelectSamplePoint({ x, y }, rgb, lab);
    }
  };

  // Hover tracker for instant live readout (from clean context)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    const samplingCtx = cleanCanvasRef.current?.getContext("2d") || canvas.getContext("2d");
    if (!samplingCtx) return;

    const pixel = samplingCtx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    const rgb: RGBColor = { r, g, b, hex };
    const lab = sRGBToCIELAB(r, g, b);

    setHoverColor({ rgb, lab });
  };

  const handleQuickAutoCalibrate = () => {
    // Standard target for 18% gray card located at (45, 410)
    const samplingCtx = cleanCanvasRef.current?.getContext("2d") || canvasRef.current?.getContext("2d");
    if (samplingCtx) {
      const data = samplingCtx.getImageData(45, canvasHeight - 45, 10, 10).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const count = data.length / 4;
      const sampledRgb: RGBColor = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
        hex: "#777777",
      };
      onCalibrateFromPoint(sampledRgb);
    }
  };

  return (
    <div id="tooth-viewer-container" className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Top Controls Bar — responsive layout with truncated, max-w bounded dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-200 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 w-full sm:w-auto">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider shrink-0 hidden sm:inline">Case:</span>
          <select
            id="select-dental-case"
            value={currentCase.id}
            onChange={(e) => {
              const selected = cases.find((c) => c.id === e.target.value);
              if (selected) onSelectCase(selected);
            }}
            className="w-full sm:w-auto sm:max-w-xs min-w-0 max-w-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium truncate"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.toothNumber} • {c.title}
              </option>
            ))}
          </select>
        </div>

        <button
          id="btn-toggle-polarization"
          onClick={onTogglePolarized}
          className={`flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 w-full sm:w-auto ${
            crossPolarized
              ? "bg-teal-600/15 border border-teal-600 text-teal-700 font-bold"
              : "bg-neutral-100 border border-neutral-300 text-neutral-500 hover:text-neutral-800"
          }`}
          title="Cross-polarization removes surface specular reflection to show true internal dentin chroma & mamelons"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{crossPolarized ? "Polarized (clear)" : "Unpolarized"}</span>
        </button>
      </div>

      {/* Quick Action Hint for Dentist */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs gap-2 w-full min-w-0">
        <div className="flex items-center gap-2 text-neutral-600 min-w-0">
          <Pipette className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">Sample point or select zone:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={() => {
              onSelectZoneFilter("cervical");
              // Jump sample to cervical third
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) {
                const sampleY = Math.round(canvasHeight * 0.22);
                const sampleX = Math.round(canvasWidth * 0.5);
                const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
                const rgb: RGBColor = { r: pixel[0], g: pixel[1], b: pixel[2], hex: `#${pixel[0].toString(16).padStart(2,"0")}${pixel[1].toString(16).padStart(2,"0")}${pixel[2].toString(16).padStart(2,"0")}` };
                onSelectSamplePoint({ x: sampleX, y: sampleY }, rgb, sRGBToCIELAB(rgb.r, rgb.g, rgb.b));
              }
            }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "cervical"
                ? "bg-amber-500 text-white font-bold shadow-sm"
                : "bg-neutral-100 text-amber-700 hover:bg-neutral-200 border border-amber-500/30"
            }`}
          >
            Gingival 1/3
          </button>

          <button
            onClick={() => {
              onSelectZoneFilter("middle");
              // Jump sample to middle body
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) {
                const sampleY = Math.round(canvasHeight * 0.5);
                const sampleX = Math.round(canvasWidth * 0.5);
                const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
                const rgb: RGBColor = { r: pixel[0], g: pixel[1], b: pixel[2], hex: `#${pixel[0].toString(16).padStart(2,"0")}${pixel[1].toString(16).padStart(2,"0")}${pixel[2].toString(16).padStart(2,"0")}` };
                onSelectSamplePoint({ x: sampleX, y: sampleY }, rgb, sRGBToCIELAB(rgb.r, rgb.g, rgb.b));
              }
            }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "middle"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "bg-neutral-100 text-teal-700 hover:bg-neutral-200 border border-teal-600/30"
            }`}
          >
            Body (Core)
          </button>

          <button
            onClick={() => {
              onSelectZoneFilter("incisal");
              // Jump sample to incisal third
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) {
                const sampleY = Math.round(canvasHeight * 0.82);
                const sampleX = Math.round(canvasWidth * 0.5);
                const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
                const rgb: RGBColor = { r: pixel[0], g: pixel[1], b: pixel[2], hex: `#${pixel[0].toString(16).padStart(2,"0")}${pixel[1].toString(16).padStart(2,"0")}${pixel[2].toString(16).padStart(2,"0")}` };
                onSelectSamplePoint({ x: sampleX, y: sampleY }, rgb, sRGBToCIELAB(rgb.r, rgb.g, rgb.b));
              }
            }}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "incisal"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
            }`}
          >
            Incisal Edge
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        ref={containerRef}
        className="relative mx-auto bg-black rounded-xl overflow-hidden border border-neutral-200 shadow-inner max-w-full flex items-center justify-center cursor-crosshair group"
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoverColor(null)}
          className="max-w-full h-auto object-contain block"
        />

        {/* Visual Target Reticle on Sampled Point */}
        {sampledPoint && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-in zoom-in-50 duration-150"
            style={{
              left: `${(sampledPoint.x / canvasWidth) * 100}%`,
              top: `${(sampledPoint.y / canvasHeight) * 100}%`,
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-teal-600 ring-2 ring-teal-600/40 animate-ping absolute" />
            <div className="w-5 h-5 rounded-full border-2 border-white bg-teal-600/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-700" />
            </div>
          </div>
        )}

        {/* Live Hover Lens Badge */}
        {hoverColor && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-neutral-300 rounded-xl p-2 text-xs flex items-center gap-2.5 shadow-sm pointer-events-none">
            <div
              className="w-5 h-5 rounded-md border border-white/20 shadow-inner shrink-0"
              style={{ backgroundColor: hoverColor.rgb.hex }}
            />
            <div className="font-mono text-[11px] space-y-0.5">
              <div className="text-neutral-800 font-semibold">
                L*:{hoverColor.lab.L.toFixed(1)} a*:{hoverColor.lab.a.toFixed(1)} b*:{hoverColor.lab.b.toFixed(1)}
              </div>
              <div className="text-neutral-500 text-[10px]">
                {hoverColor.rgb.hex.toUpperCase()} &bull; C*:{hoverColor.lab.chroma?.toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Calibration Sampling Banner Notice */}
        {isCalibratingMode && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 animate-bounce shadow-sm">
            <Target className="w-4 h-4" />
            <span>Click on the 18% Gray Reference Patch to Calibrate</span>
          </div>
        )}
      </div>

      {/* Calibration status — always visible, it affects color accuracy */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-neutral-100 p-3 rounded-xl border border-neutral-200">
        <span className="text-neutral-500">18% gray card:</span>
        {isCalibrated ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Calibrated (D65)
            </span>
            <button
              onClick={onResetCalibration}
              className="text-neutral-500 hover:text-neutral-900 p-1 rounded bg-white border border-neutral-300"
              title="Reset calibration multipliers"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              id="btn-auto-calibrate-gray"
              onClick={handleQuickAutoCalibrate}
              className="flex items-center gap-1 bg-white hover:bg-neutral-50 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-300 transition font-medium"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-calibrate</span>
            </button>
            <button
              id="btn-manual-calibrate-gray"
              onClick={() => setIsCalibratingMode(true)}
              className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-600/40 transition font-medium"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Manual sample</span>
            </button>
          </div>
        )}
      </div>

      {/* Progressive disclosure: power-user imaging controls, tucked away by default */}
      <div className="border-t border-neutral-200 pt-3">
        <button
          onClick={() => setShowAdvancedImaging((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Advanced imaging options</span>
          <span className="text-neutral-400">{showAdvancedImaging ? "– hide" : "+ show"}</span>
        </button>

        {showAdvancedImaging && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <button
              id="btn-toggle-zones"
              onClick={() => setShowZones(!showZones)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition border ${
                showZones
                  ? "bg-teal-600/10 border-teal-600/40 text-teal-700 font-bold"
                  : "bg-neutral-100 border-neutral-300 text-neutral-500"
              }`}
              title="Toggle cervical, middle, and incisal zone guides"
            >
              {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Zone lines</span>
            </button>

            <button
              id="btn-toggle-heatmap"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition border ${
                showHeatmap
                  ? "bg-neutral-900 border-neutral-900 text-white font-bold"
                  : "bg-neutral-100 border-neutral-300 text-neutral-500"
              }`}
              title="Toggle ΔE color distribution heatmap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ΔE heatmap</span>
            </button>

            <div className="flex items-center gap-2 pl-1">
              <Pipette className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-500">Sample window:</span>
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-300">
                {[1, 3, 5, 15].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSampleRadius(size)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition ${
                      sampleRadius === size
                        ? "bg-teal-600 text-white"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {size}&times;{size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
