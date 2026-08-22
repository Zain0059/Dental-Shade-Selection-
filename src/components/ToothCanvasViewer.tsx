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
import { CIELABColor, ClinicalCase, RGBColor } from "../types/dental";
import { drawToothOnCanvas } from "../lib/sampleCases";
import { sRGBToCIELAB, calculateDeltaE00 } from "../lib/colorScience";

interface ToothCanvasViewerProps {
  currentCase: ClinicalCase;
  crossPolarized: boolean;
  onTogglePolarized: () => void;
  isCalibrated: boolean;
  calibrationMultipliers: { r: number; g: number; b: number };
  onCalibrateFromPoint: (sampledRgb: RGBColor) => void;
  onResetCalibration: () => void;
  sampledPoint: { x: number; y: number } | null;
  onSelectSamplePoint: (point: { x: number; y: number }, rgb: RGBColor, lab: CIELABColor) => void;
  customImage: string | null;
  cases: ClinicalCase[];
  onSelectCase: (c: ClinicalCase) => void;
  activeZoneFilter: "all" | "cervical" | "middle" | "incisal";
  onSelectZoneFilter: (z: "all" | "cervical" | "middle" | "incisal") => void;
}

export const ToothCanvasViewer: React.FC<ToothCanvasViewerProps> = ({
  currentCase,
  crossPolarized,
  onTogglePolarized,
  isCalibrated,
  calibrationMultipliers,
  onCalibrateFromPoint,
  onResetCalibration,
  sampledPoint,
  onSelectSamplePoint,
  customImage,
  cases,
  onSelectCase,
  activeZoneFilter,
  onSelectZoneFilter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [showZones, setShowZones] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sampleRadius, setSampleRadius] = useState<number>(3); // 1, 3, 5, 15 pixels
  const [isCalibratingMode, setIsCalibratingMode] = useState(false);
  const [hoverColor, setHoverColor] = useState<{ rgb: RGBColor; lab: CIELABColor } | null>(null);

  const canvasWidth = 500;
  const canvasHeight = 440;

  // Render canvas whenever state changes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (customImage) {
      // Draw user uploaded image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = customImage;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // If heatmap overlay is active, apply semi-transparent optical gradient
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
      // Procedural synthetic dental case
      drawToothOnCanvas(
        ctx,
        canvasWidth,
        canvasHeight,
        currentCase.id,
        crossPolarized,
        calibrationMultipliers,
        showZones,
        showHeatmap
      );
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sample pixel or average area ROI
    const radius = sampleRadius;
    const startX = Math.max(0, x - Math.floor(radius / 2));
    const startY = Math.max(0, y - Math.floor(radius / 2));
    const size = Math.max(1, radius);

    const imgData = ctx.getImageData(startX, startY, size, size);
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

  // Hover tracker for instant live readout
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
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
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const data = ctx.getImageData(45, canvasHeight - 45, 10, 10).data;
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
    <div id="tooth-viewer-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Case Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Case:</span>
          <select
            id="select-dental-case"
            value={currentCase.id}
            onChange={(e) => {
              const selected = cases.find((c) => c.id === e.target.value);
              if (selected) onSelectCase(selected);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.toothNumber} &bull; {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Cross-Polarization Toggle */}
          <button
            id="btn-toggle-polarization"
            onClick={onTogglePolarized}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              crossPolarized
                ? "bg-cyan-500/20 border border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20 font-bold"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Cross-polarization removes surface specular reflection to show true internal dentin chroma & mamelons"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Glare Filter: {crossPolarized ? "POLARIZED (Clear)" : "UNPOLARIZED"}</span>
          </button>

          {/* 3-Zone Overlay Toggle */}
          <button
            id="btn-toggle-zones"
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
              showZones
                ? "bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold"
                : "bg-slate-800 border border-slate-700 text-slate-400"
            }`}
            title="Toggle Cervical, Middle, and Incisal zone guides"
          >
            {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Zone Lines</span>
          </button>

          {/* Optical Heatmap Toggle */}
          <button
            id="btn-toggle-heatmap"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
              showHeatmap
                ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold"
                : "bg-slate-800 border border-slate-700 text-slate-400"
            }`}
            title="Toggle ΔE color distribution heatmap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ΔE Heatmap</span>
          </button>
        </div>
      </div>

      {/* Quick Action Hint for Dentist */}
      <div className="flex items-center justify-between bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Pipette className="w-4 h-4 text-cyan-400" />
          <span>Click anywhere on the tooth or select a zone:</span>
        </div>

        <div className="flex items-center gap-1.5">
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
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "cervical"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30"
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
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "middle"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/30"
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
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              activeZoneFilter === "incisal"
                ? "bg-blue-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-800 text-blue-300 hover:bg-slate-700 border border-blue-500/30"
            }`}
          >
            Incisal Edge
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        ref={containerRef}
        className="relative mx-auto bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner max-w-full flex items-center justify-center cursor-crosshair group"
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
            <div className="w-6 h-6 rounded-full border-2 border-cyan-400 ring-2 ring-cyan-500/40 animate-ping absolute" />
            <div className="w-5 h-5 rounded-full border-2 border-white bg-cyan-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            </div>
          </div>
        )}

        {/* Live Hover Lens Badge */}
        {hoverColor && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-2 text-xs flex items-center gap-2.5 shadow-xl pointer-events-none">
            <div
              className="w-5 h-5 rounded-md border border-white/20 shadow-inner shrink-0"
              style={{ backgroundColor: hoverColor.rgb.hex }}
            />
            <div className="font-mono text-[11px] space-y-0.5">
              <div className="text-slate-200 font-semibold">
                L*:{hoverColor.lab.L.toFixed(1)} a*:{hoverColor.lab.a.toFixed(1)} b*:{hoverColor.lab.b.toFixed(1)}
              </div>
              <div className="text-slate-400 text-[10px]">
                {hoverColor.rgb.hex.toUpperCase()} &bull; C*:{hoverColor.lab.chroma?.toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Calibration Sampling Banner Notice */}
        {isCalibratingMode && (
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 animate-bounce shadow-lg">
            <Target className="w-4 h-4" />
            <span>Click on the 18% Gray Reference Patch to Calibrate</span>
          </div>
        )}
      </div>

      {/* Canvas Bottom Sub-Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        {/* Pixel ROI Sampling Size */}
        <div className="flex items-center gap-2">
          <Pipette className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">ROI Sample Window:</span>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {[1, 3, 5, 15].map((size) => (
              <button
                key={size}
                onClick={() => setSampleRadius(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition ${
                  sampleRadius === size
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {size}&times;{size}px
              </button>
            ))}
          </div>
        </div>

        {/* Gray Reference Card Calibration Controls */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">18% Gray Card:</span>
          {isCalibrated ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Calibrated (D65)
              </span>
              <button
                onClick={onResetCalibration}
                className="text-slate-400 hover:text-white p-1 rounded bg-slate-800 border border-slate-700"
                title="Reset Calibration Multipliers"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-auto-calibrate-gray"
                onClick={handleQuickAutoCalibrate}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition font-medium"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Calibrate</span>
              </button>
              <button
                id="btn-manual-calibrate-gray"
                onClick={() => setIsCalibratingMode(true)}
                className="flex items-center gap-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40 transition font-medium"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Manual Sample</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
