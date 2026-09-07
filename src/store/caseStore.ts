import {
  CIELABColor,
  ClinicalCase,
  ClinicalProtocolChecklist,
  MunsellColor,
  RGBColor,
  ShadeMatchResult,
  SubstrateConfig,
  ZoneData,
} from "../types/dental";
import { CLINICAL_CASES } from "../lib/sampleCases";
import {
  applyCalibration,
  calculateDeltaE00,
  findClosestShades,
  sRGBToCIELAB,
  translateLabToMunsell,
} from "../lib/colorScience";
import {
  BLEACH_SHADES,
  calculateCeramicRecipe,
  VITA_3D_MASTER_SHADES,
  VITA_CLASSICAL_SHADES,
} from "../lib/dentalShadesData";

export interface CaseNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export interface CaseState {
  // Session tracking & race condition prevention
  caseSessionId: string;
  activeAiRequestId: string | null;

  // Active Case & Images
  currentCase: ClinicalCase;
  crossPolarized: boolean;
  customImage: string | null;
  customImageMeta: {
    fileName: string;
    fileSizeBytes: number;
    uploadedAt: string;
  } | null;

  // Calibration State
  isCalibrated: boolean;
  calibrationMultipliers: { r: number; g: number; b: number };

  // Sampled Point & Colors
  sampledPoint: { x: number; y: number } | null;
  rawSampledRgb: RGBColor;
  sampledRgb: RGBColor;
  sampledLab: CIELABColor;
  munsell: MunsellColor;

  // Shade Selection & Filter
  activeSystemTab: "classical" | "3d_master" | "bleach";
  selectedMatch: ShadeMatchResult | null;
  activeZoneFilter: "all" | "cervical" | "middle" | "incisal";

  // Substrate Configuration
  substrate: SubstrateConfig;

  // Checklist
  checklist: ClinicalProtocolChecklist;

  // AI Ceramist State
  aiResult: any | null;
  isAiLoading: boolean;
  aiError: string | null;

  // Notification Toast
  notification: CaseNotification | null;
}

export type CaseAction =
  | { type: "START_NEW_CASE"; payload?: { templateCase?: ClinicalCase } }
  | { type: "LOAD_CASE"; payload: { caseItem: ClinicalCase } }
  | {
      type: "UPLOAD_IMAGE_SUCCESS";
      payload: {
        imageBase64: string;
        fileName: string;
        fileSizeBytes: number;
      };
    }
  | { type: "CLEAR_UPLOADED_IMAGE" }
  | {
      type: "SAMPLE_POINT";
      payload: {
        point: { x: number; y: number } | null;
        rawRgb: RGBColor;
      };
    }
  | {
      type: "APPLY_CALIBRATION";
      payload: {
        multipliers: { r: number; g: number; b: number };
      };
    }
  | { type: "RESET_CALIBRATION" }
  | { type: "TOGGLE_POLARIZATION" }
  | { type: "SET_POLARIZATION"; payload: boolean }
  | { type: "UPDATE_SUBSTRATE"; payload: Partial<SubstrateConfig> }
  | { type: "SELECT_SHADE"; payload: ShadeMatchResult | null }
  | { type: "SET_SYSTEM_TAB"; payload: "classical" | "3d_master" | "bleach" }
  | { type: "SET_ZONE_FILTER"; payload: "all" | "cervical" | "middle" | "incisal" }
  | { type: "START_AI_REQUEST"; payload: { requestId: string } }
  | {
      type: "AI_REQUEST_SUCCESS";
      payload: {
        requestId: string;
        sessionId: string;
        result: any;
      };
    }
  | {
      type: "AI_REQUEST_FAILURE";
      payload: {
        requestId: string;
        sessionId: string;
        error: string;
      };
    }
  | { type: "CLEAR_AI_RESULT" }
  | { type: "UPDATE_CHECKLIST"; payload: Partial<ClinicalProtocolChecklist> }
  | { type: "SET_NOTIFICATION"; payload: { type: "success" | "error" | "info" | "warning"; message: string } | null }
  | { type: "CLEAR_NOTIFICATION" };

const DEFAULT_RAW_RGB: RGBColor = { r: 236, g: 212, b: 164, hex: "#ecd4a4" };

export function generateSessionId(): string {
  return "case_session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

export function createInitialState(initialCase: ClinicalCase = CLINICAL_CASES[0]): CaseState {
  const lab = sRGBToCIELAB(DEFAULT_RAW_RGB.r, DEFAULT_RAW_RGB.g, DEFAULT_RAW_RGB.b);
  const munsell = translateLabToMunsell(lab);

  return {
    caseSessionId: generateSessionId(),
    activeAiRequestId: null,
    currentCase: initialCase,
    crossPolarized: true,
    customImage: null,
    customImageMeta: null,
    isCalibrated: false,
    calibrationMultipliers: { r: 1.0, g: 1.0, b: 1.0 },
    sampledPoint: { x: 250, y: 220 },
    rawSampledRgb: DEFAULT_RAW_RGB,
    sampledRgb: DEFAULT_RAW_RGB,
    sampledLab: lab,
    munsell,
    activeSystemTab: "classical",
    selectedMatch: null,
    activeZoneFilter: "all",
    substrate: {
      prepShade: initialCase.defaultPrepShade,
      restorationType: initialCase.defaultRestoration,
      material: initialCase.defaultMaterial,
      thicknessMm: initialCase.defaultThickness,
      cementShade: "Neutral",
    },
    checklist: {
      hydrationChecked: false,
      hydrationElapsedSeconds: 0,
      daylightLighting5500KChecked: true,
      criAbove90Checked: true,
      neutralBibChecked: true,
      lipstickRemovedChecked: true,
      crossPolarizerMountedChecked: true,
    },
    aiResult: null,
    isAiLoading: false,
    aiError: null,
    notification: null,
  };
}

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  switch (action.type) {
    case "START_NEW_CASE": {
      const template = action.payload?.templateCase || CLINICAL_CASES[0];
      const initial = createInitialState(template);
      return {
        ...initial,
        caseSessionId: generateSessionId(),
        notification: {
          id: Math.random().toString(36),
          type: "info",
          message: "Initialized fresh case session. All calibration and images reset.",
        },
      };
    }

    case "LOAD_CASE": {
      const selected = action.payload.caseItem;
      const initial = createInitialState(selected);
      return {
        ...initial,
        caseSessionId: generateSessionId(),
        notification: {
          id: Math.random().toString(36),
          type: "info",
          message: `Loaded clinical case: ${selected.toothNumber} - ${selected.title}`,
        },
      };
    }

    case "UPLOAD_IMAGE_SUCCESS": {
      // Re-evaluate current sample point on new image
      return {
        ...state,
        customImage: action.payload.imageBase64,
        customImageMeta: {
          fileName: action.payload.fileName,
          fileSizeBytes: action.payload.fileSizeBytes,
          uploadedAt: new Date().toISOString(),
        },
        // Reset old calibration because new photo has different illumination balance
        isCalibrated: false,
        calibrationMultipliers: { r: 1.0, g: 1.0, b: 1.0 },
        // Clear prior AI result to prevent old analysis from sticking to new image
        aiResult: null,
        aiError: null,
        activeAiRequestId: null,
        notification: {
          id: Math.random().toString(36),
          type: "success",
          message: `Intraoral photograph "${action.payload.fileName}" loaded. Previous calibration cleared.`,
        },
      };
    }

    case "CLEAR_UPLOADED_IMAGE": {
      return {
        ...state,
        customImage: null,
        customImageMeta: null,
        isCalibrated: false,
        calibrationMultipliers: { r: 1.0, g: 1.0, b: 1.0 },
        aiResult: null,
        notification: {
          id: Math.random().toString(36),
          type: "info",
          message: "Reverted to standard reference patient photograph.",
        },
      };
    }

    case "SAMPLE_POINT": {
      const { point, rawRgb } = action.payload;
      const effectiveRgb = state.isCalibrated
        ? applyCalibration(rawRgb, state.calibrationMultipliers)
        : rawRgb;
      const lab = sRGBToCIELAB(effectiveRgb.r, effectiveRgb.g, effectiveRgb.b);
      const munsell = translateLabToMunsell(lab);

      return {
        ...state,
        sampledPoint: point,
        rawSampledRgb: rawRgb,
        sampledRgb: effectiveRgb,
        sampledLab: lab,
        munsell,
        selectedMatch: null, // Clear explicit manual match so new sample computes fresh rankings
      };
    }

    case "APPLY_CALIBRATION": {
      const multipliers = action.payload.multipliers;
      const calibratedRgb = applyCalibration(state.rawSampledRgb, multipliers);
      const lab = sRGBToCIELAB(calibratedRgb.r, calibratedRgb.g, calibratedRgb.b);
      const munsell = translateLabToMunsell(lab);

      return {
        ...state,
        isCalibrated: true,
        calibrationMultipliers: multipliers,
        sampledRgb: calibratedRgb,
        sampledLab: lab,
        munsell,
        selectedMatch: null,
        notification: {
          id: Math.random().toString(36),
          type: "success",
          message: `White balance calibrated (R: ${multipliers.r.toFixed(2)}, G: ${multipliers.g.toFixed(2)}, B: ${multipliers.b.toFixed(2)}).`,
        },
      };
    }

    case "RESET_CALIBRATION": {
      const multipliers = { r: 1.0, g: 1.0, b: 1.0 };
      const rawRgb = state.rawSampledRgb;
      const lab = sRGBToCIELAB(rawRgb.r, rawRgb.g, rawRgb.b);
      const munsell = translateLabToMunsell(lab);

      return {
        ...state,
        isCalibrated: false,
        calibrationMultipliers: multipliers,
        sampledRgb: rawRgb,
        sampledLab: lab,
        munsell,
        selectedMatch: null,
        notification: {
          id: Math.random().toString(36),
          type: "info",
          message: "Gray card calibration reset to uncorrected sensor baseline.",
        },
      };
    }

    case "TOGGLE_POLARIZATION": {
      return {
        ...state,
        crossPolarized: !state.crossPolarized,
      };
    }

    case "SET_POLARIZATION": {
      return {
        ...state,
        crossPolarized: action.payload,
      };
    }

    case "UPDATE_SUBSTRATE": {
      return {
        ...state,
        substrate: {
          ...state.substrate,
          ...action.payload,
        },
      };
    }

    case "SELECT_SHADE": {
      return {
        ...state,
        selectedMatch: action.payload,
      };
    }

    case "SET_SYSTEM_TAB": {
      return {
        ...state,
        activeSystemTab: action.payload,
        selectedMatch: null,
      };
    }

    case "SET_ZONE_FILTER": {
      return {
        ...state,
        activeZoneFilter: action.payload,
      };
    }

    case "START_AI_REQUEST": {
      return {
        ...state,
        isAiLoading: true,
        activeAiRequestId: action.payload.requestId,
        aiError: null,
      };
    }

    case "AI_REQUEST_SUCCESS": {
      // Protect against race condition: Only apply if requestId and sessionId match active case!
      if (
        action.payload.requestId !== state.activeAiRequestId ||
        action.payload.sessionId !== state.caseSessionId
      ) {
        console.warn(
          "Discarding obsolete AI analysis response from previous case/request",
          action.payload
        );
        return state;
      }

      return {
        ...state,
        isAiLoading: false,
        activeAiRequestId: null,
        aiResult: action.payload.result,
        aiError: null,
        notification: {
          id: Math.random().toString(36),
          type: "success",
          message: "Ceramic formulation analysis generated successfully.",
        },
      };
    }

    case "AI_REQUEST_FAILURE": {
      if (
        action.payload.requestId !== state.activeAiRequestId ||
        action.payload.sessionId !== state.caseSessionId
      ) {
        return state;
      }

      return {
        ...state,
        isAiLoading: false,
        activeAiRequestId: null,
        aiError: action.payload.error,
        notification: {
          id: Math.random().toString(36),
          type: "error",
          message: `AI Ceramist request failed: ${action.payload.error}`,
        },
      };
    }

    case "CLEAR_AI_RESULT": {
      return {
        ...state,
        aiResult: null,
        aiError: null,
        activeAiRequestId: null,
        isAiLoading: false,
      };
    }

    case "UPDATE_CHECKLIST": {
      return {
        ...state,
        checklist: {
          ...state.checklist,
          ...action.payload,
        },
      };
    }

    case "SET_NOTIFICATION": {
      return {
        ...state,
        notification: action.payload
          ? {
              id: Math.random().toString(36),
              ...action.payload,
            }
          : null,
      };
    }

    case "CLEAR_NOTIFICATION": {
      return {
        ...state,
        notification: null,
      };
    }

    default:
      return state;
  }
}
