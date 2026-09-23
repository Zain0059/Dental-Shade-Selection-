import {
  CIELABColor,
  ClinicalCase,
  ClinicalProtocolChecklist,
  MunsellColor,
  RGBColor,
  ShadeMatchResult,
  SubstrateConfig,
  ZoneData,
  ToothZone,
} from "../types/dental";
import { CLINICAL_CASES } from "../lib/sampleCases";
import {
  applyCalibration,
  isValidRGB,
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
  caseScope: "quick" | "full";

  // Active Case & Images
  currentCase: ClinicalCase;
  crossPolarized: boolean;
  customImage: string | null;
  customImageMeta: {
    fileName: string;
    fileSizeBytes: number;
    uploadedAt: string;
  } | null;

  zoneSamples: Partial<Record<ToothZone, { point: { x: number; y: number }; rawRgb: RGBColor }>>;

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
  isAiRecipeStale: boolean;
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
  | { type: "UPDATE_CASE_DETAILS"; payload: Partial<Pick<ClinicalCase, "patientInitials" | "toothNumber" | "clinicalNotes">> }
  | {
      type: "SAMPLE_POINT";
      payload: {
        point: { x: number; y: number } | null;
        rawRgb: RGBColor;
        zone?: ToothZone;
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
  | { type: "SET_CASE_SCOPE"; payload: "quick" | "full" }
  | { type: "SET_NOTIFICATION"; payload: { type: "success" | "error" | "info" | "warning"; message: string } | null }
  | { type: "CLEAR_NOTIFICATION" };

const DEFAULT_RAW_RGB: RGBColor = { r: NaN, g: NaN, b: NaN, hex: "transparent" };

export function generateSessionId(): string {
  return "case_session_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

let persistedCaseScope: "quick" | "full" = "quick";

export function createInitialState(initialCase: ClinicalCase = CLINICAL_CASES[0]): CaseState {
  const lab = sRGBToCIELAB(DEFAULT_RAW_RGB.r, DEFAULT_RAW_RGB.g, DEFAULT_RAW_RGB.b);
  const munsell = translateLabToMunsell(lab);

  return {
    caseSessionId: generateSessionId(),
    activeAiRequestId: null,
    caseScope: persistedCaseScope,
    currentCase: initialCase,
    crossPolarized: false,
    zoneSamples: {},
    customImage: null,
    customImageMeta: null,
    isCalibrated: false,
    calibrationMultipliers: { r: 1.0, g: 1.0, b: 1.0 },
    sampledPoint: null,
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
      daylightLighting5500KChecked: false,
      criAbove90Checked: false,
      neutralBibChecked: false,
      lipstickRemovedChecked: false,
      crossPolarizerMountedChecked: false,
    },
    aiResult: null,
    isAiRecipeStale: false,
    isAiLoading: false,
    aiError: null,
    notification: null,
  };
}

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  // Any input change invalidates completed and pending analyses in this session.
  if (["SAMPLE_POINT", "APPLY_CALIBRATION", "RESET_CALIBRATION", "UPDATE_SUBSTRATE",
    "SELECT_SHADE", "SET_SYSTEM_TAB", "SET_ZONE_FILTER", "TOGGLE_POLARIZATION", "SET_POLARIZATION",
    "UPDATE_CASE_DETAILS"].includes(action.type)) {
    state = { ...state, aiResult: null, aiError: null, activeAiRequestId: null, isAiLoading: false };
  }
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

    case "SET_CASE_SCOPE": {
      persistedCaseScope = action.payload;
      return {
        ...state,
        caseScope: action.payload,
      };
    }

    case "UPLOAD_IMAGE_SUCCESS": {
      const initial = createInitialState({ ...state.currentCase, id: "uploaded", title: "Patient photograph",
        patientInitials: "", toothNumber: "", clinicalNotes: "" });
      return { ...initial, customImage: action.payload.imageBase64,
        customImageMeta: { fileName: action.payload.fileName, fileSizeBytes: action.payload.fileSizeBytes,
          uploadedAt: new Date().toISOString() },
        notification: { id: generateSessionId(), type: "info",
          message: "Photo loaded. Enter patient/tooth details, then select each zone and sample it." } };
    }
    case "CLEAR_UPLOADED_IMAGE":
      return createInitialState();
    case "UPDATE_CASE_DETAILS":
      return { ...state, currentCase: { ...state.currentCase, ...action.payload } };

    case "SAMPLE_POINT": {
      const { point, rawRgb } = action.payload;
      if (!point || !isValidRGB(rawRgb)) return state;
      const zone = action.payload.zone || (state.activeZoneFilter === "all" ? "middle" : state.activeZoneFilter);
      const effectiveRgb = state.isCalibrated
        ? applyCalibration(rawRgb, state.calibrationMultipliers)
        : rawRgb;
      const lab = sRGBToCIELAB(effectiveRgb.r, effectiveRgb.g, effectiveRgb.b);
      const munsell = translateLabToMunsell(lab);

      return {
        ...state,
        zoneSamples: { ...state.zoneSamples, [zone]: { point, rawRgb } },
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
      if (!Object.values(multipliers).every(v => Number.isFinite(v) && v > 0)) return state;
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
        checklist: { ...state.checklist, crossPolarizerMountedChecked: !state.crossPolarized },
      };
    }

    case "SET_POLARIZATION": {
      return {
        ...state,
        crossPolarized: action.payload,
        checklist: { ...state.checklist, crossPolarizerMountedChecked: action.payload },
      };
    }

    case "UPDATE_SUBSTRATE": {
      return {
        ...state,
        substrate: {
          ...state.substrate,
          ...action.payload,
        },
        isAiRecipeStale: state.aiResult !== null,
      };
    }

    case "SELECT_SHADE": {
      return {
        ...state,
        selectedMatch: action.payload,
        isAiRecipeStale: state.aiResult !== null,
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
      const zone = action.payload === "all" ? "middle" : action.payload;
      const sample = state.zoneSamples[zone];
      const rawRgb = sample?.rawRgb || DEFAULT_RAW_RGB;
      const rgb = state.isCalibrated ? applyCalibration(rawRgb, state.calibrationMultipliers) : rawRgb;
      const lab = sRGBToCIELAB(rgb.r, rgb.g, rgb.b);
      return { ...state, activeZoneFilter: action.payload, sampledPoint: sample?.point || null,
        rawSampledRgb: rawRgb, sampledRgb: rgb, sampledLab: lab, munsell: translateLabToMunsell(lab), selectedMatch: null };
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
          "Discarding obsolete AI analysis response from previous case/request"
        );
        return state;
      }

      return {
        ...state,
        isAiLoading: false,
        activeAiRequestId: null,
        aiResult: action.payload.result,
        isAiRecipeStale: false,
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
      const polarization = action.payload.crossPolarizerMountedChecked;
      if (polarization !== undefined && polarization !== state.crossPolarized) {
        state = { ...state, crossPolarized: polarization, aiResult: null, aiError: null, activeAiRequestId: null, isAiLoading: false };
      }
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
