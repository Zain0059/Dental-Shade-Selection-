import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { CLINICAL_CASES, drawToothOnCanvas } from '../lib/sampleCases';
import { sampleRegion } from '../lib/imageSampling';
import { sRGBToLinear } from '../lib/colorScience';
import { ToothZone } from '../types/dental';
import { 
  Camera, 
  Pipette, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop,
  Check,
  X,
  Move,
  Scan
} from 'lucide-react';

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectPreset = 'free' | 'tooth' | 'square';

export const ToothCanvasViewer: React.FC = () => {
  const { state, dispatch } = useCaseContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [imageError, setImageError] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [sampleSize, setSampleSize] = useState(5);
  const [dimensions, setDimensions] = useState({ width: 500, height: 440 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPanRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cropping State
  const [isCropping, setIsCropping] = useState(false);
  const [cropBox, setCropBox] = useState<CropRect>({ x: 80, y: 40, width: 340, height: 360 });
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('free');

  const zone = state.activeZoneFilter === 'all' ? 'middle' : state.activeZoneFilter;

  const resetZoomAndPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetZoomAndPan();
    setIsCropping(false);
  }, [state.customImage, state.currentCase.id, state.caseSessionId]);

  const handleZoomIn = () => {
    if (isCropping) return;
    setZoom(prev => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    if (isCropping) return;
    setZoom(prev => {
      const next = Math.max(1, Math.round((prev - 0.25) * 100) / 100);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      if (isCropping) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom(prev => {
        const next = Math.min(4, Math.max(1, Math.round((prev + delta) * 100) / 100));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, [isCropping]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping) return;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    initialPanRef.current = { ...pan };
    if (zoom > 1) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping) return;
    if (!isDragging && zoom <= 1) return;
    if (event.buttons !== 1) {
      if (isDragging) setIsDragging(false);
      return;
    }
    const dist = Math.hypot(event.clientX - dragStartRef.current.x, event.clientY - dragStartRef.current.y);
    if (dist > 4) {
      hasDraggedRef.current = true;
      if (zoom > 1) {
        const maxPanX = (dimensions.width * (zoom - 1)) / (2 * zoom) + 150;
        const maxPanY = (dimensions.height * (zoom - 1)) / (2 * zoom) + 150;
        const dx = (event.clientX - dragStartRef.current.x) / zoom;
        const dy = (event.clientY - dragStartRef.current.y) / zoom;
        setPan({
          x: Math.max(-maxPanX, Math.min(maxPanX, initialPanRef.current.x + dx)),
          y: Math.max(-maxPanY, Math.min(maxPanY, initialPanRef.current.y + dy)),
        });
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping) return;
    setIsDragging(false);
    if (!hasDraggedRef.current) {
      sample(event);
    }
  };

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
        sourceImageRef.current = image;
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
      sourceImageRef.current = null;
      canvas.width = 500; canvas.height = 440;
      drawToothOnCanvas(ctx, 500, 440, state.currentCase.id, false, { r: 1, g: 1, b: 1 }, false, false);
      finish(500, 440);
    }
    return () => { cancelled = true; };
  }, [state.customImage, state.currentCase.id, state.caseSessionId]);

  const sample = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ready || isCropping) return;
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

  // Start Crop Mode: initialize smart tooth frame
  const handleStartCropping = () => {
    if (!ready) return;
    resetZoomAndPan();
    setCalibrating(false);

    const w = dimensions.width;
    const h = dimensions.height;

    // If demo case with known tooth bounds, use them with slight framing padding
    if (!state.customImage && state.currentCase.toothBounds) {
      const tb = state.currentCase.toothBounds;
      const padX = 15;
      const padY = 15;
      const x = Math.max(0, tb.x - padX);
      const y = Math.max(0, tb.y - padY);
      const width = Math.min(w - x, tb.width + padX * 2);
      const height = Math.min(h - y, tb.height + padY * 2);
      setCropBox({ x, y, width, height });
    } else {
      // For uploaded images: default to central 65% width × 75% height
      const boxW = Math.round(w * 0.65);
      const boxH = Math.round(h * 0.75);
      setCropBox({
        x: Math.round((w - boxW) / 2),
        y: Math.round((h - boxH) / 2),
        width: boxW,
        height: boxH,
      });
    }

    setAspectPreset('free');
    setIsCropping(true);
  };

  // Change Aspect Ratio Preset
  const handleAspectChange = (preset: AspectPreset) => {
    setAspectPreset(preset);
    if (preset === 'free') return;

    const ratio = preset === 'tooth' ? 0.75 : 1.0; // 3:4 width-to-height for tooth, 1:1 for square
    setCropBox(prev => {
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;
      let newW = prev.width;
      let newH = Math.round(newW / ratio);

      if (newH > dimensions.height) {
        newH = Math.round(dimensions.height * 0.85);
        newW = Math.round(newH * ratio);
      }
      if (newW > dimensions.width) {
        newW = Math.round(dimensions.width * 0.85);
        newH = Math.round(newW / ratio);
      }

      let newX = Math.round(centerX - newW / 2);
      let newY = Math.round(centerY - newH / 2);

      newX = Math.max(0, Math.min(dimensions.width - newW, newX));
      newY = Math.max(0, Math.min(dimensions.height - newH, newY));

      return { x: newX, y: newY, width: newW, height: newH };
    });
  };

  // Center the current frame
  const handleCenterFrame = () => {
    setCropBox(prev => {
      const newX = Math.round((dimensions.width - prev.width) / 2);
      const newY = Math.round((dimensions.height - prev.height) / 2);
      return { ...prev, x: Math.max(0, newX), y: Math.max(0, newY) };
    });
  };

  // Apply Crop: cuts the image at high-resolution and updates state
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sx = Math.max(0, Math.min(canvas.width - 20, Math.round(cropBox.x)));
    const sy = Math.max(0, Math.min(canvas.height - 20, Math.round(cropBox.y)));
    const sw = Math.max(20, Math.min(canvas.width - sx, Math.round(cropBox.width)));
    const sh = Math.max(20, Math.min(canvas.height - sy, Math.round(cropBox.height)));

    const offscreen = document.createElement('canvas');

    if (state.customImage && sourceImageRef.current) {
      // High-resolution crop from the original uncompressed uploaded image
      const source = sourceImageRef.current;
      const scaleX = source.naturalWidth / canvas.width;
      const scaleY = source.naturalHeight / canvas.height;

      const nativeX = Math.round(sx * scaleX);
      const nativeY = Math.round(sy * scaleY);
      const nativeW = Math.max(20, Math.round(sw * scaleX));
      const nativeH = Math.max(20, Math.round(sh * scaleY));

      offscreen.width = nativeW;
      offscreen.height = nativeH;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(source, nativeX, nativeY, nativeW, nativeH, 0, 0, nativeW, nativeH);
        const croppedBase64 = offscreen.toDataURL('image/png');
        dispatch({
          type: 'CROP_IMAGE_SUCCESS',
          payload: { croppedImageBase64: croppedBase64 },
        });
      }
    } else {
      // Demo case: crop from the canvas representation
      offscreen.width = sw;
      offscreen.height = sh;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        const croppedBase64 = offscreen.toDataURL('image/png');
        dispatch({
          type: 'CROP_IMAGE_SUCCESS',
          payload: { croppedImageBase64: croppedBase64, isDemoCase: true },
        });
      }
    }

    setIsCropping(false);
  };

  // Revert back to original full uncropped photograph
  const handleRevertCrop = () => {
    dispatch({ type: 'REVERT_ORIGINAL_IMAGE' });
    setIsCropping(false);
  };

  // Crop Drag Handling (Moving and Resizing the framing box)
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'create' | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const overlay = overlayRef.current;
    if (!overlay) return;

    const rect = overlay.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialBox = { ...cropBox };

    const clickCanvasX = (e.clientX - rect.left) * scaleX;
    const clickCanvasY = (e.clientY - rect.top) * scaleY;

    let createOrigin = { x: clickCanvasX, y: clickCanvasY };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startClientX) * scaleX;
      const dy = (moveEvent.clientY - startClientY) * scaleY;

      setCropBox(prev => {
        let x = prev.x;
        let y = prev.y;
        let w = prev.width;
        let h = prev.height;

        const minSize = 25;

        if (mode === 'move') {
          x = Math.max(0, Math.min(dimensions.width - initialBox.width, initialBox.x + dx));
          y = Math.max(0, Math.min(dimensions.height - initialBox.height, initialBox.y + dy));
          return { x, y, width: initialBox.width, height: initialBox.height };
        }

        if (mode === 'create') {
          const currentX = Math.max(0, Math.min(dimensions.width, (moveEvent.clientX - rect.left) * scaleX));
          const currentY = Math.max(0, Math.min(dimensions.height, (moveEvent.clientY - rect.top) * scaleY));
          x = Math.min(createOrigin.x, currentX);
          y = Math.min(createOrigin.y, currentY);
          w = Math.max(minSize, Math.abs(currentX - createOrigin.x));
          h = Math.max(minSize, Math.abs(currentY - createOrigin.y));

          if (aspectPreset !== 'free') {
            const ratio = aspectPreset === 'tooth' ? 0.75 : 1.0;
            h = Math.round(w / ratio);
          }
          return { x, y, width: w, height: h };
        }

        // Resizing handles
        let newLeft = initialBox.x;
        let newTop = initialBox.y;
        let newRight = initialBox.x + initialBox.width;
        let newBottom = initialBox.y + initialBox.height;

        if (mode.includes('w')) {
          newLeft = Math.max(0, Math.min(newRight - minSize, initialBox.x + dx));
        }
        if (mode.includes('e')) {
          newRight = Math.min(dimensions.width, Math.max(newLeft + minSize, initialBox.x + initialBox.width + dx));
        }
        if (mode.includes('n')) {
          newTop = Math.max(0, Math.min(newBottom - minSize, initialBox.y + dy));
        }
        if (mode.includes('s')) {
          newBottom = Math.min(dimensions.height, Math.max(newTop + minSize, initialBox.y + initialBox.height + dy));
        }

        let calcW = Math.max(minSize, newRight - newLeft);
        let calcH = Math.max(minSize, newBottom - newTop);

        if (aspectPreset !== 'free') {
          const ratio = aspectPreset === 'tooth' ? 0.75 : 1.0;
          if (mode === 'e' || mode === 'w') {
            calcH = Math.round(calcW / ratio);
          } else {
            calcW = Math.round(calcH * ratio);
          }
        }

        return {
          x: Math.max(0, Math.min(dimensions.width - calcW, newLeft)),
          y: Math.max(0, Math.min(dimensions.height - calcH, newTop)),
          width: calcW,
          height: calcH,
        };
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isImageCurrentlyCropped = !!state.originalImage;

  return (
    <section id="tooth-viewer-container" className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Intraoral Viewport
              </h3>
              {isImageCurrentlyCropped && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Framed Tooth
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-500">
              {state.customImage 
                ? (isImageCurrentlyCropped ? 'Framed clinical photograph (Target region isolated)' : 'Patient photograph')
                : 'Illustrated demo — not a patient measurement'}
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

      {/* Cropping Active Mode Banner & Presets */}
      {isCropping && (
        <div className="bg-teal-50/90 border border-teal-200 rounded-xl p-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-teal-700" />
              <div>
                <h4 className="text-xs font-bold text-teal-950">Frame Tooth Region for Analysis</h4>
                <p className="text-[11px] text-teal-800">
                  Drag the box or corner handles to tightly frame the crown. Eliminates lips, gums, and background glare for accurate colorimetry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Frame (Crop)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-200/60 text-xs">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wide mr-1">Aspect:</span>
              <button
                type="button"
                onClick={() => handleAspectChange('free')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  aspectPreset === 'free' ? 'bg-teal-700 text-white' : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100/50'
                }`}
              >
                Freeform
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange('tooth')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  aspectPreset === 'tooth' ? 'bg-teal-700 text-white' : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100/50'
                }`}
                title="Standard central incisor 75% width-to-height ratio"
              >
                Tooth (3:4)
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange('square')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  aspectPreset === 'square' ? 'bg-teal-700 text-white' : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100/50'
                }`}
              >
                Square (1:1)
              </button>

              <button
                type="button"
                onClick={handleCenterFrame}
                className="px-2 py-1 rounded text-[11px] font-medium bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100 ml-1 transition"
              >
                Center Frame
              </button>
            </div>

            <div className="text-[11px] font-mono font-medium text-teal-900">
              Box: {Math.round(cropBox.width)} × {Math.round(cropBox.height)} px
            </div>
          </div>
        </div>
      )}

      {/* Zone Selector Strip */}
      {!isCropping && (
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
      )}

      {imageError && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{imageError}</span>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div 
        ref={viewportRef}
        className="relative w-fit max-w-full mx-auto bg-neutral-900 rounded-xl overflow-hidden shadow-inner border border-neutral-300 select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          aria-label={`Sample ${zone} tooth region`}
          className={`block max-w-full h-auto transition-opacity duration-200 origin-center ${
            isCropping 
              ? 'cursor-default'
              : zoom > 1 && isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-crosshair'
          }`}
          style={{ 
            width: dimensions.width, 
            opacity: ready ? 1 : 0.4,
            transform: isCropping ? 'none' : `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        />

        {/* Cropping Interactive Overlay Layer */}
        {isCropping && (
          <div
            ref={overlayRef}
            className="absolute inset-0 z-20 touch-none"
            onPointerDown={e => handlePointerDown(e, 'create')}
          >
            {/* Darkened Mask Outside the Crop Rectangle */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={`M 0 0 H ${dimensions.width} V ${dimensions.height} H 0 Z M ${cropBox.x} ${cropBox.y} V ${cropBox.y + cropBox.height} H ${cropBox.x + cropBox.width} V ${cropBox.y} Z`}
                fill="rgba(0, 0, 0, 0.58)"
                fillRule="evenodd"
              />
            </svg>

            {/* The Active Crop Box */}
            <div
              className="absolute border-2 border-teal-400 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_0_15px_rgba(20,184,166,0.35)]"
              style={{
                left: `${cropBox.x}px`,
                top: `${cropBox.y}px`,
                width: `${cropBox.width}px`,
                height: `${cropBox.height}px`,
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              {/* Center Drag & Move Area */}
              <div
                className="absolute inset-0 cursor-move flex items-center justify-center group"
                onPointerDown={e => handlePointerDown(e, 'move')}
                title="Drag to reposition frame over tooth"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 text-teal-300 text-[10px] font-bold px-2 py-1 rounded-md border border-neutral-700 flex items-center gap-1 shadow-md pointer-events-none">
                  <Move className="w-3 h-3" />
                  <span>Move Frame</span>
                </div>
              </div>

              {/* Clinical Dental Thirds Division Guides */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {/* Cervical Third (Top 1/3) */}
                <div className="h-1/3 border-b border-teal-300/40 border-dashed relative">
                  <span className="absolute top-1 left-1.5 text-[9px] font-bold text-teal-200/80 bg-neutral-900/70 px-1 py-0.2 rounded leading-tight select-none">
                    Cervical 1/3
                  </span>
                </div>

                {/* Body / Middle Third (Middle 1/3) */}
                <div className="h-1/3 border-b border-teal-300/40 border-dashed relative">
                  <span className="absolute top-1 left-1.5 text-[9px] font-bold text-teal-200/80 bg-neutral-900/70 px-1 py-0.2 rounded leading-tight select-none">
                    Body 1/3
                  </span>
                </div>

                {/* Incisal Third (Bottom 1/3) */}
                <div className="h-1/3 relative">
                  <span className="absolute top-1 left-1.5 text-[9px] font-bold text-teal-200/80 bg-neutral-900/70 px-1 py-0.2 rounded leading-tight select-none">
                    Incisal 1/3
                  </span>
                </div>
              </div>

              {/* 4 Corner Resize Handles */}
              <div
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-sm cursor-nwse-resize shadow-md"
                onPointerDown={e => handlePointerDown(e, 'nw')}
              />
              <div
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-sm cursor-nesw-resize shadow-md"
                onPointerDown={e => handlePointerDown(e, 'ne')}
              />
              <div
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-sm cursor-nesw-resize shadow-md"
                onPointerDown={e => handlePointerDown(e, 'sw')}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-sm cursor-nwse-resize shadow-md"
                onPointerDown={e => handlePointerDown(e, 'se')}
              />

              {/* 4 Edge Midpoint Handles */}
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white border-2 border-teal-600 rounded-sm cursor-ns-resize shadow-sm"
                onPointerDown={e => handlePointerDown(e, 'n')}
              />
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white border-2 border-teal-600 rounded-sm cursor-ns-resize shadow-sm"
                onPointerDown={e => handlePointerDown(e, 's')}
              />
              <div
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-5 bg-white border-2 border-teal-600 rounded-sm cursor-ew-resize shadow-sm"
                onPointerDown={e => handlePointerDown(e, 'w')}
              />
              <div
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-5 bg-white border-2 border-teal-600 rounded-sm cursor-ew-resize shadow-sm"
                onPointerDown={e => handlePointerDown(e, 'e')}
              />
            </div>
          </div>
        )}

        {/* Calibration Banner Overlay */}
        {calibrating && !isCropping && (
          <div className="absolute top-3 left-3 right-3 bg-amber-500/90 text-neutral-950 px-3 py-2 rounded-lg text-xs font-bold text-center backdrop-blur-sm shadow-md animate-pulse z-10">
            🎯 Calibration Active: Click an 18% gray reference patch in the photograph
          </div>
        )}

        {/* Zone Pins Overlay (Hidden while cropping) */}
        {!isCropping && Object.entries(state.zoneSamples).map(([key, value]) => {
          if (!value) return null;
          const letter = key === 'middle' ? 'B' : key[0].toUpperCase();
          const isCurrentActive = zone === key;
          const cx = dimensions.width / 2;
          const cy = dimensions.height / 2;
          const transformedX = cx + (value.point.x + pan.x - cx) * zoom;
          const transformedY = cy + (value.point.y + pan.y - cy) * zoom;
          return (
            <span
              key={key}
              className={`absolute pointer-events-none rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg -translate-x-1/2 -translate-y-1/2 transition-transform ${
                isCurrentActive
                  ? 'w-6 h-6 border-2 border-white bg-teal-600 text-white ring-2 ring-teal-400/50 scale-110'
                  : 'w-5 h-5 border-2 border-white bg-neutral-800 text-white'
              }`}
              style={{
                left: `${transformedX}px`,
                top: `${transformedY}px`,
              }}
              title={`${key} zone sampled`}
            >
              {letter}
            </span>
          );
        })}

        {/* Floating Zoom & Pan Controls Bar (Hidden while cropping) */}
        {!isCropping && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-xl border border-neutral-700/80 shadow-lg text-white text-xs z-10">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 transition text-neutral-300 hover:text-white"
              title="Zoom out (Mouse wheel down)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={resetZoomAndPan}
              className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-teal-300 transition"
              title="Click to reset zoom to 100%"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 transition text-neutral-300 hover:text-white"
              title="Zoom in (Mouse wheel up)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {zoom > 1 && (
              <button
                type="button"
                onClick={resetZoomAndPan}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                title="Reset View (100%)"
                aria-label="Reset view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Zoom & Pan Guidance Tag */}
        {!isCropping && (
          <div className="absolute bottom-3 left-3 text-[10px] font-medium text-neutral-300/80 bg-neutral-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-neutral-800 pointer-events-none hidden sm:flex items-center gap-1.5 z-10">
            <span>{zoom > 1 ? 'Drag to pan • Click to sample' : 'Scroll wheel or +/- to zoom • Click to sample'}</span>
          </div>
        )}
      </div>

      {/* Tool Strip & Cropping / Calibration Bar */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between text-xs pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Frame / Crop Tooth Button */}
          <button
            type="button"
            disabled={!ready || isCropping}
            onClick={handleStartCropping}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isCropping
                ? 'bg-teal-600 border-teal-700 text-white shadow-sm'
                : 'bg-neutral-50 border-neutral-300 text-neutral-800 hover:bg-neutral-100 disabled:opacity-40'
            }`}
            title="Frame and crop the tooth region to eliminate retractors, lips, and background glare"
          >
            <Crop className="w-3.5 h-3.5 text-teal-600" />
            <span>Frame / Crop Tooth</span>
          </button>

          {/* Revert Crop Button (Only shown if cropped) */}
          {isImageCurrentlyCropped && !isCropping && (
            <button
              type="button"
              onClick={handleRevertCrop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 text-xs font-medium transition"
              title="Restore full uncropped photograph"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Full Photo</span>
            </button>
          )}

          <div className="h-4 w-px bg-neutral-200 mx-0.5 hidden sm:block" />

          {/* Sample Window Size */}
          <label className="flex items-center gap-1.5 text-neutral-700 font-medium">
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Sample window</span>
            <select
              aria-label="Sample window"
              value={sampleSize}
              onChange={e => setSampleSize(Number(e.target.value))}
              disabled={isCropping}
              className="bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-40"
            >
              {[1, 3, 5, 15].map(size => (
                <option key={size} value={size}>{size} × {size}</option>
              ))}
            </select>
          </label>

          {/* Gray Card Calibration */}
          <button
            disabled={!ready || isCropping}
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
            disabled={!state.isCalibrated || isCropping}
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
        <span>Framing the tooth isolates cervical, body, and incisal zones, eliminating saliva specular glare and lips for high-accuracy CIELAB sampling.</span>
      </p>
    </section>
  );
};
