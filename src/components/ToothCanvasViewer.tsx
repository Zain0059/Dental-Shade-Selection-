import React, { useEffect, useRef, useState } from 'react';
import { useCaseContext } from '../context/CaseContext';
import { CLINICAL_CASES, drawToothOnCanvas } from '../lib/sampleCases';
import { sampleRegion } from '../lib/imageSampling';
import { sRGBToLinear } from '../lib/colorScience';
import { ToothZone } from '../types/dental';

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

  return <section id="tooth-viewer-container" className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-4">
    <div className="flex flex-wrap gap-3 justify-between items-center">
      <label className="text-xs">Reference demo
        <select aria-label="Reference demo" className="block border rounded-lg p-2 max-w-full" value={state.customImage ? '' : state.currentCase.id}
          onChange={e => { const caseItem = CLINICAL_CASES.find(c => c.id === e.target.value); if (caseItem) dispatch({ type: 'LOAD_CASE', payload: { caseItem } }); }}>
          <option value="" disabled>Uploaded patient image</option>
          {CLINICAL_CASES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </label>
      <span className="text-xs text-neutral-500">{state.customImage ? 'Patient photograph' : 'Illustrated demo — not a patient measurement'}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {(['cervical', 'middle', 'incisal'] as ToothZone[]).map(key => <button key={key} type="button"
        aria-pressed={zone === key} onClick={() => { setCalibrating(false); dispatch({ type: 'SET_ZONE_FILTER', payload: key }); }}
        className={`px-3 py-2 rounded-lg border text-xs ${zone === key ? 'bg-teal-600 text-white' : 'bg-neutral-50'}`}>
        {key === 'middle' ? 'Body' : key[0].toUpperCase() + key.slice(1)} {state.zoneSamples[key] ? '✓' : '—'}
      </button>)}
    </div>
    <p className="text-xs text-neutral-600" role="status">{calibrating ? 'Click a known 18% gray reference patch.' : `Click the ${zone} third in the photo. Each zone is measured separately.`}</p>
    {imageError && <p role="alert" className="text-sm text-red-700">{imageError}</p>}
    <div className="relative w-fit max-w-full mx-auto">
      <canvas ref={canvasRef} onClick={sample} aria-label={`Sample ${zone} tooth region`}
        className="block max-w-full h-auto rounded-lg cursor-crosshair" style={{ width: dimensions.width, opacity: ready ? 1 : 0.3 }} />
      {Object.entries(state.zoneSamples).map(([key, value]) => value && <span key={key}
        className="absolute pointer-events-none rounded-full border-2 border-white bg-teal-700 text-white text-[10px] px-1 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${value.point.x / dimensions.width * 100}%`, top: `${value.point.y / dimensions.height * 100}%` }}>{key[0].toUpperCase()}</span>)}
    </div>
    <div className="flex flex-wrap gap-2 items-center text-xs">
      <label>Sample window <select aria-label="Sample window" value={sampleSize} onChange={e => setSampleSize(Number(e.target.value))} className="border rounded p-2">
        {[1, 3, 5, 15].map(size => <option key={size} value={size}>{size} × {size}</option>)}
      </select></label>
      <button disabled={!ready} onClick={() => setCalibrating(v => !v)} className="border rounded-lg p-2">{calibrating ? 'Cancel calibration' : 'Select gray card'}</button>
      <button disabled={!state.isCalibrated} onClick={() => dispatch({ type: 'RESET_CALIBRATION' })} className="border rounded-lg p-2 disabled:opacity-40">Reset calibration</button>
      <span>{state.isCalibrated ? 'Gray reference applied' : 'Uncalibrated'}</span>
    </div>
    <p className="text-[11px] text-neutral-500">Preview capped at 2400 pixels. Gray-card correction is an image estimate; it does not establish camera color accuracy or measure translucency.</p>
  </section>;
};
