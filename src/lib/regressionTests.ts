import {
  calculateDeltaE00,
  calculateDeltaEab,
  calculateMatchSimilarityScore,
  getTrafficLightStatus,
  isValidCIELAB,
  sRGBToCIELAB,
  translateLabToMunsell,
  ZONE_OFFSETS,
} from "./colorScience";
import { caseReducer, createInitialState } from "../store/caseStore";
import { CLINICAL_CASES } from "./sampleCases";
import { validateAiAnalysisResponse, validateImageUpload } from "./validationSchemas";

export interface TestResultItem {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestResultItem[];
  timestamp: string;
}

/**
 * 1. Reference CIEDE2000 calculations & visible failure on invalid inputs
 */
export function testReferenceDeltaECalculations(): TestResultItem[] {
  const results: TestResultItem[] = [];

  // 1a. Identical coordinates must produce 0.000
  const t0 = performance.now();
  const labRef = { L: 75.3, a: 1.5, b: 17.2 };
  const dEIdentical = calculateDeltaE00(labRef, { ...labRef });
  results.push({
    id: "delta-e-identical",
    suite: "Reference ΔE Calculations",
    name: "Identical Colors Evaluation",
    passed: Number.isFinite(dEIdentical) && Math.abs(dEIdentical) < 0.0001,
    message: `Expected 0.000, got ${dEIdentical.toFixed(4)}`,
    durationMs: performance.now() - t0,
  });

  // 1b. Standard CIE technical report test pair
  // Pair: L1=50, a1=2.6772, b1=-79.7751 vs L2=50, a2=0.0, b2=-82.7485
  const t1 = performance.now();
  const pair1A = { L: 50.0, a: 2.6772, b: -79.7751 };
  const pair1B = { L: 50.0, a: 0.0, b: -82.7485 };
  const dEStd = calculateDeltaE00(pair1A, pair1B);
  // Known standard CIE value is ~2.0425
  const isClose = Math.abs(dEStd - 2.0425) < 0.01;
  results.push({
    id: "delta-e-cie-standard-pair",
    suite: "Reference ΔE Calculations",
    name: "CIE Published Reference Pair Accuracy",
    passed: isClose,
    message: `Expected ~2.0425, got ${dEStd.toFixed(4)}`,
    durationMs: performance.now() - t1,
  });

  // 1c. Invalid input must FAIL VISIBLY (returns NaN, NOT 0.00)
  const t2 = performance.now();
  const invalidLab = { L: -50, a: NaN, b: 10 }; // negative L, NaN a*
  const dEInvalid = calculateDeltaE00(labRef, invalidLab as any);
  const statusInvalid = getTrafficLightStatus(dEInvalid);
  const scoreInvalid = calculateMatchSimilarityScore(dEInvalid);

  const invalidHandledCorrectly =
    Number.isNaN(dEInvalid) && statusInvalid === "invalid" && scoreInvalid === 0;

  results.push({
    id: "delta-e-invalid-fail-visible",
    suite: "Reference ΔE Calculations",
    name: "Visible Failure on Invalid Measurements",
    passed: invalidHandledCorrectly,
    message: invalidHandledCorrectly
      ? `Successfully failed visibly: ΔE00 is NaN, traffic light is "invalid", similarity is 0.`
      : `FAILED: Invalid measurement returned ${dEInvalid} with status ${statusInvalid}! Potential false 100% match!`,
    durationMs: performance.now() - t2,
  });

  return results;
}

/**
 * 2. Overlay-Independent Sampling Verification
 */
export function testOverlayIndependentSampling(): TestResultItem[] {
  const results: TestResultItem[] = [];
  const t0 = performance.now();

  // Test that sampling coordinates on raw pixel array extracts unaffected tooth values
  // regardless of whether overlay HUD guides or bounding boxes are enabled.
  const rawPixelData = { r: 236, g: 212, b: 164, hex: "#ecd4a4" };
  const initial = createInitialState();
  const sampledState = caseReducer(initial, {
    type: "SAMPLE_POINT",
    payload: { point: { x: 250, y: 220 }, rawRgb: rawPixelData },
  });

  const lab1 = sampledState.sampledLab;

  // Toggle polarization or overlay modes
  const polarizedState = caseReducer(sampledState, { type: "TOGGLE_POLARIZATION" });
  const zoneFilteredState = caseReducer(polarizedState, {
    type: "SET_ZONE_FILTER",
    payload: "cervical",
  });

  // Sample exact same base pixel coordinates under different UI filter
  const reSampledState = caseReducer(zoneFilteredState, {
    type: "SAMPLE_POINT",
    payload: { point: { x: 250, y: 220 }, rawRgb: rawPixelData },
  });

  const lab2 = reSampledState.sampledLab;
  const isIndependent =
    lab1.L === lab2.L && lab1.a === lab2.a && lab1.b === lab2.b;

  results.push({
    id: "overlay-independent-sampling",
    suite: "Sampling Isolation",
    name: "Overlay-Independent Pixel Sampling",
    passed: isIndependent,
    message: isIndependent
      ? `Sampled CIELAB (L=${lab1.L.toFixed(1)}, a=${lab1.a.toFixed(1)}, b=${lab1.b.toFixed(1)}) is strictly invariant to UI overlays.`
      : "Overlay graphics contaminated pixel sample values!",
    durationMs: performance.now() - t0,
  });

  return results;
}

/**
 * 3. Calibration & Reset Lifecycle Verification
 */
export function testCalibrationAndResetLifecycle(): TestResultItem[] {
  const results: TestResultItem[] = [];
  const t0 = performance.now();

  let state = createInitialState();

  // Initial multipliers should be 1.0
  const initial1 =
    !state.isCalibrated &&
    state.calibrationMultipliers.r === 1 &&
    state.calibrationMultipliers.g === 1 &&
    state.calibrationMultipliers.b === 1;

  // Apply calibration multiplier (e.g. sensor was underexposed/cool: R: 1.15, G: 1.02, B: 0.94)
  state = caseReducer(state, {
    type: "APPLY_CALIBRATION",
    payload: { multipliers: { r: 1.15, g: 1.02, b: 0.94 } },
  });

  const calibratedApplied =
    state.isCalibrated &&
    state.calibrationMultipliers.r === 1.15 &&
    state.sampledRgb.r !== state.rawSampledRgb.r;

  // Reset calibration
  state = caseReducer(state, { type: "RESET_CALIBRATION" });

  const resetClean =
    !state.isCalibrated &&
    state.calibrationMultipliers.r === 1.0 &&
    state.calibrationMultipliers.g === 1.0 &&
    state.calibrationMultipliers.b === 1.0 &&
    state.sampledRgb.r === state.rawSampledRgb.r;

  results.push({
    id: "calibration-lifecycle",
    suite: "Calibration Lifecycle",
    name: "Calibration Application and Clean Baseline Reset",
    passed: initial1 && calibratedApplied && resetClean,
    message: `Initial verified (${initial1}), calibration applied (${calibratedApplied}), reset restored factory baseline (${resetClean}).`,
    durationMs: performance.now() - t0,
  });

  return results;
}

/**
 * 4. Upload State Clearing & "New Case" Complete Lifecycle
 */
export function testUploadStateClearingAndNewCaseLifecycle(): TestResultItem[] {
  const results: TestResultItem[] = [];
  const t0 = performance.now();

  let state = createInitialState(CLINICAL_CASES[0]);
  const originalSessionId = state.caseSessionId;

  // 1. Simulate upload
  state = caseReducer(state, {
    type: "UPLOAD_IMAGE_SUCCESS",
    payload: {
      imageBase64: "data:image/jpeg;base64,sampleFakeBase64...",
      fileName: "patient_intraoral_prep.jpg",
      fileSizeBytes: 2048500,
    },
  });

  // 2. Apply calibration
  state = caseReducer(state, {
    type: "APPLY_CALIBRATION",
    payload: { multipliers: { r: 1.2, g: 0.95, b: 0.9 } },
  });

  // 3. Set AI result
  state = caseReducer(state, {
    type: "START_AI_REQUEST",
    payload: { requestId: "req_123" },
  });
  state = caseReducer(state, {
    type: "AI_REQUEST_SUCCESS",
    payload: {
      requestId: "req_123",
      sessionId: state.caseSessionId,
      result: { summary: "Old case summary" },
    },
  });

  const stateDirty =
    state.customImage !== null &&
    state.isCalibrated === true &&
    state.aiResult !== null;

  // 4. Trigger START_NEW_CASE
  state = caseReducer(state, { type: "START_NEW_CASE" });

  const stateFullyReset =
    state.customImage === null &&
    state.customImageMeta === null &&
    state.isCalibrated === false &&
    state.calibrationMultipliers.r === 1.0 &&
    state.aiResult === null &&
    state.aiError === null &&
    state.activeAiRequestId === null &&
    state.selectedMatch === null &&
    state.caseSessionId !== originalSessionId;

  results.push({
    id: "new-case-complete-reset",
    suite: "Case Lifecycle",
    name: "Start New Case Complete Wipe & Session Refresh",
    passed: stateDirty && stateFullyReset,
    message: stateFullyReset
      ? `New case completely purged custom image, calibration multipliers, AI cache, and generated new sessionId (${state.caseSessionId}).`
      : "Start New Case failed to clear all case artifacts!",
    durationMs: performance.now() - t0,
  });

  return results;
}

/**
 * 5. AI Failure Handling, Timeout & Race Condition Protection
 */
export function testAiFailureAndTimeoutHandling(): TestResultItem[] {
  const results: TestResultItem[] = [];
  const t0 = performance.now();

  let state = createInitialState();
  const caseSession1 = state.caseSessionId;

  // Start in-flight request for Case 1
  state = caseReducer(state, {
    type: "START_AI_REQUEST",
    payload: { requestId: "req_case1" },
  });

  // User immediately switches to Case 2 before request finishes!
  state = caseReducer(state, {
    type: "LOAD_CASE",
    payload: { caseItem: CLINICAL_CASES[1] },
  });

  const caseSession2 = state.caseSessionId;

  // Now, delayed AI response from Case 1 arrives!
  state = caseReducer(state, {
    type: "AI_REQUEST_SUCCESS",
    payload: {
      requestId: "req_case1",
      sessionId: caseSession1, // Obsolete session!
      result: { summary: "Should never appear in Case 2!" },
    },
  });

  // Verify that the obsolete response was BLOCKED and NOT applied to Case 2!
  const raceConditionPrevented = state.aiResult === null;

  results.push({
    id: "ai-race-condition-prevention",
    suite: "AI Robustness & Protection",
    name: "Protection Against Stale Response in Newer Case",
    passed: raceConditionPrevented && caseSession1 !== caseSession2,
    message: raceConditionPrevented
      ? "Stale AI response from previous case session was safely rejected."
      : "CRITICAL: Stale AI response contaminated newer case session!",
    durationMs: performance.now() - t0,
  });

  // Test schema rejection
  const t1 = performance.now();
  const malformedAiResponse = { invalidField: true }; // missing summary, morphology, etc.
  const validation = validateAiAnalysisResponse(malformedAiResponse);

  results.push({
    id: "ai-schema-validation-rejection",
    suite: "AI Robustness & Protection",
    name: "Runtime Schema Rejection of Malformed AI Payloads",
    passed: !validation.isValid && validation.errors.length > 0,
    message: `Successfully caught ${validation.errors.length} schema violations in malformed response.`,
    durationMs: performance.now() - t1,
  });

  return results;
}

export function testZonalMathExtraction(): TestResultItem[] {
  const results: TestResultItem[] = [];
  const t0 = performance.now();
  
  const cervValid = ZONE_OFFSETS.cervical.dL === -3.5 && ZONE_OFFSETS.cervical.da === 0.8 && ZONE_OFFSETS.cervical.db === 3.2;
  const incValid = ZONE_OFFSETS.incisal.dL === 2.0 && ZONE_OFFSETS.incisal.da === -0.9 && ZONE_OFFSETS.incisal.db === -4.5;

  results.push({
    id: "zonal-math-extraction",
    suite: "Color Science Extraction",
    name: "Zonal Math CIELAB Constants Verification",
    passed: cervValid && incValid,
    message: `Cervical offsets (${ZONE_OFFSETS.cervical.dL}, ${ZONE_OFFSETS.cervical.da}, ${ZONE_OFFSETS.cervical.db}) and incisal offsets (${ZONE_OFFSETS.incisal.dL}, ${ZONE_OFFSETS.incisal.da}, ${ZONE_OFFSETS.incisal.db}) correctly match legacy inline constants.`,
    durationMs: performance.now() - t0,
  });

  return results;
}

/**
 * Runs all test suites and returns a consolidated report.
 */
export function runAllRegressionTests(): TestSuiteSummary {
  const results = [
    ...testReferenceDeltaECalculations(),
    ...testOverlayIndependentSampling(),
    ...testCalibrationAndResetLifecycle(),
    ...testUploadStateClearingAndNewCaseLifecycle(),
    ...testAiFailureAndTimeoutHandling(),
    ...testZonalMathExtraction(),
  ];

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
    timestamp: new Date().toISOString(),
  };
}
