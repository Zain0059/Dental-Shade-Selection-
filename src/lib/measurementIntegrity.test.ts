import test from 'node:test';
import assert from 'node:assert/strict';
import { caseReducer, createInitialState, CaseAction, CaseState } from '../store/caseStore';
import { applyCalibration, findClosestShades, getTrafficLightStatus, sRGBToLinear } from './colorScience';
import { VITA_CLASSICAL_SHADES } from './dentalShadesData';
import { deriveZones } from '../context/CaseContext';
import { buildCaseReport, buildCaseReportText, exportReadiness } from './caseReport';
import { isChecklistComplete, validateAiAnalysisResponse } from './validationSchemas';
import { sampleRegion } from './imageSampling';
import { ToothZone } from '../types/dental';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AiAnalysisDrawer } from '../components/AiAnalysisDrawer';

const sample = (state: CaseState, zone: ToothZone = 'middle', r = 160) => caseReducer(state, { type: 'SAMPLE_POINT', payload: {
  zone, point: { x: 10, y: 20 }, rawRgb: { r, g: 145, b: 120, hex: '#a09178' },
} });
const match = (s: CaseState) => findClosestShades(s.sampledLab, VITA_CLASSICAL_SHADES, 1)[0];

test('new state has no invented measurement or confirmed capture protocol', () => {
  const s = createInitialState();
  assert.equal(s.sampledPoint, null); assert.equal(match(s).isMeasurable, false);
  assert.equal(match(s).shade.code, 'N/A'); assert.equal(s.crossPolarized, false);
  assert.equal(isChecklistComplete(s.checklist), false);
  assert.equal(exportReadiness(s, match(s)), 'Sample a tooth region before exporting.');
});

test('zone measurements are independent and unmeasured zones remain unknown', () => {
  let s = sample(createInitialState(), 'middle', 160);
  const before = deriveZones(s).middle;
  assert.equal(deriveZones(s).incisal.isMeasured, false);
  s = sample(s, 'cervical', 190);
  const zones = deriveZones(s);
  assert.deepEqual(zones.middle.sampledLab, before.sampledLab);
  assert.notDeepEqual(zones.cervical.sampledLab, before.sampledLab);
  assert.equal(zones.incisal.matchedClassical.shade.code, 'N/A');
  assert.equal(zones.incisal.translucencyIndex, null);
  s = caseReducer(s, { type: 'SET_ZONE_FILTER', payload: 'middle' });
  assert.equal(s.rawSampledRgb.r, 160);
  s = caseReducer(s, { type: 'SET_ZONE_FILTER', payload: 'incisal' });
  assert.equal(s.sampledPoint, null); assert.equal(match(s).isMeasurable, false);
});

test('upload clears measurements, identity, calibration, selected shade and pending AI', () => {
  let s = sample(createInitialState());
  s = caseReducer(s, { type: 'SELECT_SHADE', payload: match(s) });
  s = caseReducer(s, { type: 'APPLY_CALIBRATION', payload: { multipliers: { r: 1.1, g: 1, b: 1 } } });
  s = caseReducer(s, { type: 'START_AI_REQUEST', payload: { requestId: 'old' } });
  const sessionId = s.caseSessionId;
  s = caseReducer(s, { type: 'UPLOAD_IMAGE_SUCCESS', payload: { imageBase64: 'data:image/png;base64,AAAA', fileName: 'new.png', fileSizeBytes: 3 } });
  assert.notEqual(s.caseSessionId, sessionId); assert.equal(s.sampledPoint, null);
  assert.deepEqual(s.zoneSamples, {}); assert.equal(s.isCalibrated, false);
  assert.equal(s.selectedMatch, null); assert.equal(s.isAiLoading, false);
  assert.equal(s.currentCase.patientInitials, ''); assert.equal(s.currentCase.toothNumber, ''); assert.equal(s.currentCase.clinicalNotes, '');
  const after = caseReducer(s, { type: 'AI_REQUEST_SUCCESS', payload: { requestId: 'old', sessionId, result: { summary: 'old' } } });
  assert.equal(after.aiResult, null);
});

test('replacing the photo preserves case and restoration details but resets photo-derived data', () => {
  let s = caseReducer(createInitialState(), { type: 'UPLOAD_IMAGE_SUCCESS', payload: {
    imageBase64: 'data:image/png;base64,AAAA', fileName: 'first.png', fileSizeBytes: 3,
  } });
  s = caseReducer(s, { type: 'UPDATE_CASE_DETAILS', payload: {
    patientInitials: 'P42', toothNumber: '11', clinicalNotes: 'Preserve incisal translucency',
  } });
  s = caseReducer(s, { type: 'UPDATE_SUBSTRATE', payload: { prepShade: 'ND4', thicknessMm: 0.8 } });
  s = caseReducer(s, { type: 'SET_CASE_SCOPE', payload: 'full' });
  s = sample(s, 'middle', 170);
  s = caseReducer(s, { type: 'APPLY_CALIBRATION', payload: { multipliers: { r: 1.1, g: 1, b: 1 } } });
  s = caseReducer(s, { type: 'TOGGLE_POLARIZATION' });
  const oldSession = s.caseSessionId;

  s = caseReducer(s, { type: 'REPLACE_IMAGE_SUCCESS', payload: {
    imageBase64: 'data:image/png;base64,BBBB', fileName: 'replacement.png', fileSizeBytes: 4,
  } });

  assert.notEqual(s.caseSessionId, oldSession);
  assert.equal(s.customImage, 'data:image/png;base64,BBBB');
  assert.equal(s.currentCase.patientInitials, 'P42'); assert.equal(s.currentCase.toothNumber, '11');
  assert.equal(s.currentCase.clinicalNotes, 'Preserve incisal translucency');
  assert.equal(s.substrate.prepShade, 'ND4'); assert.equal(s.substrate.thicknessMm, 0.8);
  assert.equal(s.caseScope, 'full');
  assert.deepEqual(s.zoneSamples, {}); assert.equal(s.sampledPoint, null); assert.equal(s.isCalibrated, false);
  assert.equal(s.crossPolarized, false); assert.equal(s.checklist.hydrationChecked, false);
  assert.equal(s.selectedMatch, null); assert.equal(s.aiResult, null); assert.equal(s.isAiLoading, false);
});

test('every analysis input mutation invalidates completed and pending AI results', () => {
  const actions: CaseAction[] = [
    { type: 'UPDATE_SUBSTRATE', payload: { prepShade: 'ND9' } },
    { type: 'SAMPLE_POINT', payload: { point: { x: 5, y: 5 }, rawRgb: { r: 100, g: 100, b: 100, hex: '#646464' } } },
    { type: 'APPLY_CALIBRATION', payload: { multipliers: { r: 1.1, g: 1, b: 1 } } },
    { type: 'RESET_CALIBRATION' }, { type: 'TOGGLE_POLARIZATION' },
    { type: 'SET_SYSTEM_TAB', payload: 'bleach' }, { type: 'SET_ZONE_FILTER', payload: 'incisal' },
    { type: 'UPDATE_CASE_DETAILS', payload: { clinicalNotes: 'Changed' } }, { type: 'CLEAR_UPLOADED_IMAGE' },
  ];
  for (const action of actions) {
    let s = sample(createInitialState());
    s = { ...s, aiResult: { summary: 'outdated' }, activeAiRequestId: 'old', isAiLoading: true };
    const sessionId = s.caseSessionId;
    s = caseReducer(s, action);
    assert.equal(s.aiResult, null, action.type); assert.equal(s.isAiLoading, false, action.type);
    s = caseReducer(s, { type: 'AI_REQUEST_SUCCESS', payload: { requestId: 'old', sessionId, result: { summary: 'obsolete' } } });
    assert.equal(s.aiResult, null, action.type);
  }
});

test('gray card correction uses linear light and recalculates all stored zones from raw samples', () => {
  const gray = { r: 100, g: 110, b: 120, hex: '#646e78' };
  const multipliers = { r: .18 / sRGBToLinear(gray.r), g: .18 / sRGBToLinear(gray.g), b: .18 / sRGBToLinear(gray.b) };
  const corrected = applyCalibration(gray, multipliers);
  assert.deepEqual([corrected.r, corrected.g, corrected.b], [118, 118, 118]);
  let s = sample(sample(createInitialState(), 'cervical', 130), 'middle', 170);
  const raw = deriveZones(s);
  s = caseReducer(s, { type: 'APPLY_CALIBRATION', payload: { multipliers } });
  assert.notDeepEqual(deriveZones(s).cervical.sampledRgb, raw.cervical.sampledRgb);
  assert.equal(s.zoneSamples.cervical?.rawRgb.r, 130);
  s = caseReducer(s, { type: 'RESET_CALIBRATION' });
  assert.deepEqual(deriveZones(s).cervical.sampledRgb, raw.cervical.sampledRgb);
});

test('threshold boundaries use 0.8 and 1.8 consistently', () => {
  assert.equal(getTrafficLightStatus(0.8), 'green'); assert.equal(getTrafficLightStatus(0.8001), 'yellow');
  assert.equal(getTrafficLightStatus(1.8), 'yellow'); assert.equal(getTrafficLightStatus(1.8001), 'red');
  assert.equal(getTrafficLightStatus(3), 'red'); assert.equal(getTrafficLightStatus(NaN), 'invalid');
});

test('checklist ignores numeric timer but requires every boolean check', () => {
  const checklist = createInitialState().checklist;
  for (const key of Object.keys(checklist)) if (key !== 'hydrationElapsedSeconds') (checklist as any)[key] = true;
  assert.equal(isChecklistComplete(checklist), true);
  checklist.hydrationElapsedSeconds = 123; assert.equal(isChecklistComplete(checklist), true);
  checklist.criAbove90Checked = false; assert.equal(isChecklistComplete(checklist), false);
});

test('exports retain unknown zones and actual capture flags, with no invented recipe or identity', () => {
  let s = caseReducer(createInitialState(), { type: 'UPLOAD_IMAGE_SUCCESS', payload: { imageBase64: 'data:image/png;base64,AAAA', fileName: 'patient.png', fileSizeBytes: 3 } });
  s = sample(s);
  assert.ok(exportReadiness(s, match(s)));
  s = caseReducer(s, { type: 'UPDATE_CASE_DETAILS', payload: { patientInitials: 'P42', toothNumber: '11' } });
  assert.equal(exportReadiness(s, match(s)), null);
  const report = buildCaseReport(s, match(s), deriveZones(s));
  assert.equal(report.patient, 'P42'); assert.equal(report.capture.grayReferenceApplied, false);
  assert.equal(report.capture.crossPolarizationReportedByUser, false);
  assert.deepEqual(report.zones.incisal, { measured: false });
  const text = buildCaseReportText(s, match(s), deriveZones(s));
  assert.match(text, /incisal: Not measured/); assert.doesNotMatch(text, /750|94%|95%|M\.K\.|verified|Opal Halo/);
});

test('sampling clips edges and ignores transparent padding', () => {
  const ctx = { canvas: { width: 10, height: 10 }, getImageData(x: number, y: number, w: number, h: number) {
    assert.ok(x + w <= 10 && y + h <= 10);
    return { data: new Uint8ClampedArray([100, 120, 140, 255, 0, 0, 0, 0]) };
  } } as unknown as CanvasRenderingContext2D;
  assert.deepEqual(sampleRegion(ctx, 9, 9, 5), { r: 100, g: 120, b: 140, hex: '#64788c' });
  assert.equal(sampleRegion(ctx, 10, 9, 5), null);
});

test('malformed AI fields are rejected instead of rendered or defaulted', () => {
  assert.equal(validateAiAnalysisResponse({ summary: 'x', morphology: {}, ceramicRecipe: {}, clinicalRecommendations: 'invalid' }).isValid, false);
  const html = renderToStaticMarkup(React.createElement(AiAnalysisDrawer, { isOpen: true, isLoading: false,
    result: null, error: 'AI unavailable', onClose() {}, onReanalyze() {} }));
  assert.match(html, /AI unavailable/); assert.doesNotMatch(html, /Confidence|95%|94%|750/);
});

test('server returns explicit errors for invalid input and missing AI configuration', async () => {
  process.env.NODE_ENV = 'test';
  const savedKey = process.env.GEMINI_API_KEY; delete process.env.GEMINI_API_KEY;
  try {
    const { app } = await import('../../server');
    const handler = app._router.stack.find((layer: any) => layer.route?.path === '/api/ai/analyze-tooth').route.stack[0].handle;
    const invoke = async (body: any) => {
      const response = { statusCode: 200, body: null as any, status(code: number) { this.statusCode = code; return this; }, json(data: any) { this.body = data; return this; } };
      await handler({ body }, response); return response;
    };
    assert.equal((await invoke({})).statusCode, 400);
    const result = await invoke({ cielabData: { L: 75, a: 2, b: 15 }, targetShade: 'A2', thickness: 1,
      material: 'lithium_disilicate', substrate: 'ND2', imageBase64: 'data:image/png;base64,AAAA' });
    assert.equal(result.statusCode, 503); assert.equal(result.body.success, false);
    assert.equal(result.body.morphology, undefined); assert.equal(result.body.ceramicRecipe, undefined);
  } finally { if (savedKey !== undefined) process.env.GEMINI_API_KEY = savedKey; }
});

test('polarization checklist and capture state remain synchronized', () => {
  let s = caseReducer(createInitialState(), { type: 'TOGGLE_POLARIZATION' });
  assert.equal(s.checklist.crossPolarizerMountedChecked, true);
  s = caseReducer(s, { type: 'UPDATE_CHECKLIST', payload: { crossPolarizerMountedChecked: false } });
  assert.equal(s.crossPolarized, false);
});

test('initial application renders without fabricated shade or confidence', async () => {
  const { default: App } = await import('../App');
  const { CaseProvider } = await import('../context/CaseContext');
  const html = renderToStaticMarkup(React.createElement(CaseProvider, null, React.createElement(App)));
  assert.match(html, /Patient identifier/);
  assert.match(html, /Sample middle tooth region/);
  assert.doesNotMatch(html, /Confidence: 9[45]%/);
});
