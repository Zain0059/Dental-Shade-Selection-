import React, { useEffect, useRef, useState } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { CLINICAL_CASES, drawToothOnCanvas } from '../lib/sampleCases';
import { sampleRegion } from '../lib/imageSampling';
import { sRGBToLinear } from '../lib/colorScience';
import { ToothZone } from '../types/dental';
import { Camera, Pipette, RotateCcw, Sliders, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToothCanvasViewer: React.FC = () => {
  const { state, dispatch } = useCaseContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [imageError, setImageError] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [sampleSize, setSampleSize] = useState(5);
  const [dimensions, setDimensions] = useState({ width: 500, height: 440 });
  const zone = state.activeZoneFilter === 'all' ? 'middle' : state.activeZoneFilter;

  useEffect(() => {
    let cancelled = false;
    setReady(false); setImageError(''); setCalibrating(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const finish = (width: number, height: number) => {
      setDimensions({ width, height }); setReady(true);
    };
    if (state.customImage) {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        // Native image resolution, with a bounded preview that preserves aspect ratio.
        const scale = Math.min(1, 2400 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        finish(canvas.width, canvas.height);
      };
      image.onerror = () => { if (!cancelled) setImageError('Cannot decode photograph. Upload a valid JPEG, PNG or WebP image.'); };
      image.src = state.customImage;
    } else {
      canvas.width = 500; canvas.height = 440;
      drawToothOnCanvas(ctx, 500, 440, state.currentCase.id, false, { r: 1, g: 1, b: 1 }, false, false);
      finish(500, 440);
    }
    return () => { cancelled = true; };
  }, [state.customImage, state.currentCase.id, state.caseSessionId]);

  const sample = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) * canvas.width / rect.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) * canvas.height / rect.height)));
    const rgb = sampleRegion(canvas.getContext('2d')!, x, y, sampleSize);
    if (!rgb) return;
    if (calibrating) {
      if ([rgb.r, rgb.g, rgb.b].some(v => v <= 5 || v >= 250)) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Reference is clipped or too dark. Select a properly exposed gray card patch.' } });
        return;
      }
      dispatch({ type: 'APPLY_CALIBRATION', payload: { multipliers: {
        r: 0.18 / sRGBToLinear(rgb.r), g: 0.18 / sRGBToLinear(rgb.g), b: 0.18 / sRGBToLinear(rgb.b),
      } } });
      setCalibrating(false);
    } else {
      dispatch({ type: 'SAMPLE_POINT', payload: { point: { x, y }, rawRgb: rgb, zone } });
    }
  };

  return (
    <section id="tooth-viewer-container" className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Intraoral Viewport
            </h3>
            <span className="text-[11px] text-neutral-500">
              {state.customImage ? 'Patient photograph' : 'Illustrated demo — not a patient measurement'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-neutral-600 flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide shrink-0">Reference demo</span>
            <select
              aria-label="Reference demo"
              className="bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 w-full sm:w-auto font-medium"
              value={state.customImage ? '' : state.currentCase.id}
              onChange={e => {
                const caseItem = CLINICAL_CASES.find(c => c.id === e.target.value);
                if (caseItem) dispatch({ type: 'LOAD_CASE', payload: { caseItem } });
              }}
            >
              <option value="" disabled>Uploaded patient image</option>
              {CLINICAL_CASES.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Zone Selector Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">Target Zone:</span>
          {(['cervical', 'middle', 'incisal'] as ToothZone[]).map(key => {
            const isSelected = zone === key;
            const isMeasured = !!state.zoneSamples[key];
            const label = key === 'middle' ? 'Body' : key[0].toUpperCase() + key.slice(1);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setCalibrating(false);
                  dispatch({ type: 'SET_ZONE_FILTER', payload: key });
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-teal-600 border-teal-700 text-white shadow-sm'
                    : isMeasured
                    ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1 rounded ${
                  isSelected ? 'bg-teal-700 text-white' : isMeasured ? 'bg-emerald-100 text-emerald-800' : 'text-neutral-400'
                }`}>
                  {isMeasured ? '✓' : '—'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-600 font-medium" role="status">
            {calibrating ? 'Click a known 18% gray reference patch.' : `Click the ${zone} third in the photo. Each zone is measured separately.`}
          </p>
        </div>
      </div>

      {imageError && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{imageError}</span>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="relative w-fit max-w-full mx-auto bg-neutral-900 rounded-xl overflow-hidden shadow-inner border border-neutral-300">
        <canvas
          ref={canvasRef}
          onClick={sample}
          aria-label={`Sample ${zone} tooth region`}
          className="block max-w-full h-auto cursor-crosshair transition-opacity duration-200"
          style={{ width: dimensions.width, opacity: ready ? 1 : 0.4 }}
        />

        {/* Calibration Banner Overlay */}
        {calibrating && (
          <div className="absolute top-3 left-3 right-3 bg-amber-500/90 text-neutral-950 px-3 py-2 rounded-lg text-xs font-bold text-center backdrop-blur-sm shadow-md animate-pulse">
            🎯 Calibration Active: Click an 18% gray reference patch in the photograph
          </div>
        )}

        {/* Zone Pins Overlay */}
        {Object.entries(state.zoneSamples).map(([key, value]) => {
          if (!value) return null;
          const letter = key === 'middle' ? 'B' : key[0].toUpperCase();
          const isCurrentActive = zone === key;
          return (
            <span
              key={key}
              className={`absolute pointer-events-none rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg -translate-x-1/2 -translate-y-1/2 transition-transform ${
                isCurrentActive
                  ? 'w-6 h-6 border-2 border-white bg-teal-600 text-white ring-2 ring-teal-400/50 scale-110'
                  : 'w-5 h-5 border-2 border-white bg-neutral-800 text-white'
              }`}
              style={{
                left: `${(value.point.x / dimensions.width) * 100}%`,
                top: `${(value.point.y / dimensions.height) * 100}%`,
              }}
              title={`${key} zone sampled`}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Tool Strip & Calibration Bar */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between text-xs pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-neutral-700 font-medium">
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Sample window</span>
            <select
              aria-label="Sample window"
              value={sampleSize}
              onChange={e => setSampleSize(Number(e.target.value))}
              className="bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {[1, 3, 5, 15].map(size => (
                <option key={size} value={size}>{size} × {size}</option>
              ))}
            </select>
          </label>

          <button
            disabled={!ready}
            onClick={() => setCalibrating(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              calibrating
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>{calibrating ? 'Cancel calibration' : 'Select gray card'}</span>
          </button>

          <button
            disabled={!state.isCalibrated}
            onClick={() => dispatch({ type: 'RESET_CALIBRATION' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset calibration</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
            state.isCalibrated
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-neutral-100 border-neutral-200 text-neutral-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state.isCalibrated ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
            {state.isCalibrated ? 'Gray reference applied' : 'Uncalibrated'}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed border-t border-neutral-100 pt-2 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>Preview capped at 2400 pixels. Gray-card correction is an image estimate; it does not establish camera color accuracy or measure translucency.</span>
      </p>
    </section>
  );
};
