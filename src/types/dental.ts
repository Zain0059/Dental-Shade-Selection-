export interface CIELABColor {
  L: number; // 0 to 100 (Lightness / Value)
  a: number; // -128 to +127 (Green to Red)
  b: number; // -128 to +127 (Blue to Yellow)
  chroma?: number; // sqrt(a^2 + b^2)
  hueAngle?: number; // atan2(b, a) in degrees
}

export interface RGBColor {
  r: number; // 0 to 255
  g: number; // 0 to 255
  b: number; // 0 to 255
  hex: string;
}

export interface MunsellColor {
  hue: string; // e.g. "2.5Y", "5Y", "10YR", "7.5YR"
  value: number; // 0.0 to 10.0 (Key determinant in dentistry)
  chroma: number; // 0.0 to 14.0+ (Saturation)
  notation: string; // e.g. "2.5Y 7.5/2.4"
  valueSignificance: "CRITICAL_PRIMARY" | "HIGH";
}

export type ShadeSystem = "VITA_CLASSICAL" | "VITA_3D_MASTER" | "BLEACH" | "STUMP_ND";

export interface StandardShade {
  id: string;
  name: string;
  code: string;
  system: ShadeSystem;
  lab: CIELABColor;
  munsell: MunsellColor;
  description: string;
  categoryGroup: string; // e.g. "A (Reddish-Brownish)" or "Group 2 (Light-Medium)"
  recommendedIngot?: string;
}

export interface ShadeMatchResult {
  shade: StandardShade;
  deltaE00: number; // CIEDE2000
  deltaEab: number; // Classical Euclidean CIE76
  trafficLight: "green" | "yellow" | "red"; // Green <= 1.6, Yellow <= 3.2, Red > 3.2
  matchRank: number;
  confidencePercent: number;
}

export type ToothZone = "cervical" | "middle" | "incisal";

export interface ZoneData {
  zone: ToothZone;
  label: string;
  description: string;
  relativeYRange: [number, number]; // [0.0, 0.33], [0.33, 0.66], [0.66, 1.0]
  sampledLab: CIELABColor;
  sampledRgb: RGBColor;
  munsell: MunsellColor;
  matchedClassical: ShadeMatchResult;
  matched3D: ShadeMatchResult;
  translucencyIndex: number; // 0 (opaque) to 100 (high enamel translucency)
  opticalCharacteristics: string[];
}

export type DieShadeND = 
  | "ND1" // Ultra light bleached prep
  | "ND2" // Light natural vital dentin
  | "ND3" // Medium natural dentin
  | "ND4" // Dark vital dentin / slight discoloration
  | "ND5" // Very dark vital / tetracycline stain
  | "ND6" // Devitalized grey-brown core
  | "ND7" // Severe brown discoloration
  | "ND8" // Dark grey / amalgam stain
  | "ND9"; // Black-metallic core shadow

export type RestorationType = 
  | "porcelain_veneer"
  | "anterior_crown"
  | "posterior_crown"
  | "inlay_onlay"
  | "implant_crown";

export type CeramicMaterial = 
  | "lithium_disilicate" // IPS e.max
  | "zirconia_multilayer_5y" // Ultra translucent anterior
  | "zirconia_multilayer_4y" // Universal high strength
  | "zirconia_opaque_3y" // High masking capability
  | "feldspathic_porcelain" // Refractory die master veneer
  | "hybrid_ceramic"; // Polymer-infiltrated

export interface SubstrateConfig {
  prepShade: DieShadeND;
  restorationType: RestorationType;
  material: CeramicMaterial;
  thicknessMm: number;
  cementShade: "Light+" | "Neutral" | "Warm+" | "White Opaque";
}

export interface CalibrationState {
  isCalibrated: boolean;
  grayCardTargetLab: CIELABColor; // Standard 18% gray (L*=50.0, a*=0, b*=0)
  detectedGrayRgb: RGBColor | null;
  rMultiplier: number;
  gMultiplier: number;
  bMultiplier: number;
  exposureCorrectionEv: number;
  crossPolarizationActive: boolean;
  colorMasterDetected: boolean;
}

export interface ClinicalProtocolChecklist {
  hydrationChecked: boolean;
  hydrationElapsedSeconds: number;
  daylightLighting5500KChecked: boolean;
  criAbove90Checked: boolean;
  neutralBibChecked: boolean;
  lipstickRemovedChecked: boolean;
  crossPolarizerMountedChecked: boolean;
}

export interface CeramicRecipe {
  ingotSelection: string;
  ingotOpacity: "HT" | "MT" | "LT" | "MO" | "HO";
  cervicalStain: string;
  bodyDentinPowder: string;
  incisalEnamelPowder: string;
  opalEffectPowder: string;
  characterizations: string[];
  firingCycle: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  patientInitials: string;
  toothNumber: string; // Universal #8 or #9 (FDI 11, 21)
  indication: string;
  imageUrl: string;
  polarizedImageUrl: string;
  referenceCardPosition: { x: number; y: number; width: number; height: number };
  toothBounds: { x: number; y: number; width: number; height: number };
  defaultPrepShade: DieShadeND;
  defaultRestoration: RestorationType;
  defaultMaterial: CeramicMaterial;
  defaultThickness: number;
  clinicalNotes: string;
}
