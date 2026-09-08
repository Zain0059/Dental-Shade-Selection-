import { CIELABColor, MunsellColor, RGBColor, ShadeMatchResult, StandardShade, TrafficLightStatus, ZoneData } from "../types/dental";

// Illuminant D65 reference white points (2° standard observer, ISO/TR 28642)
export const ILLUMINANT_D65 = {
  Xn: 95.0489,
  Yn: 100.0,
  Zn: 108.884,
  temperatureKelvin: 6504,
  standardObserver: "2° Standard Observer (CIE 1931)",
};

const D65_Xn = ILLUMINANT_D65.Xn;
const D65_Yn = ILLUMINANT_D65.Yn;
const D65_Zn = ILLUMINANT_D65.Zn;

/**
 * Validates whether a given object is a clinically well-formed CIELAB coordinate.
 */
export function isValidCIELAB(lab: any): lab is CIELABColor {
  if (!lab || typeof lab !== "object") return false;
  return (
    typeof lab.L === "number" &&
    Number.isFinite(lab.L) &&
    lab.L >= 0 &&
    lab.L <= 100 &&
    typeof lab.a === "number" &&
    Number.isFinite(lab.a) &&
    lab.a >= -150 &&
    lab.a <= 150 &&
    typeof lab.b === "number" &&
    Number.isFinite(lab.b) &&
    lab.b >= -150 &&
    lab.b <= 150
  );
}

/**
 * Validates whether a given object is a valid sRGB color.
 */
export function isValidRGB(rgb: any): rgb is RGBColor {
  if (!rgb || typeof rgb !== "object") return false;
  return (
    typeof rgb.r === "number" &&
    Number.isFinite(rgb.r) &&
    rgb.r >= 0 &&
    rgb.r <= 255 &&
    typeof rgb.g === "number" &&
    Number.isFinite(rgb.g) &&
    rgb.g >= 0 &&
    rgb.g <= 255 &&
    typeof rgb.b === "number" &&
    Number.isFinite(rgb.b) &&
    rgb.b >= 0 &&
    rgb.b <= 255
  );
}

/**
 * Converts sRGB [0..255] component to linear sRGB [0..1]
 */
export function sRGBToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear sRGB [0..1] to sRGB [0..255]
 */
export function linearToSRGB(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(v * 255)));
}

/**
 * Converts sRGB [0..255] to XYZ color space (D65)
 */
export function sRGBToXYZ(r: number, g: number, b: number): { X: number; Y: number; Z: number } {
  const rL = sRGBToLinear(r);
  const gL = sRGBToLinear(g);
  const bL = sRGBToLinear(b);

  const X = (rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375) * 100;
  const Y = (rL * 0.2126729 + gL * 0.7151522 + bL * 0.072175) * 100;
  const Z = (rL * 0.0193339 + gL * 0.119192 + bL * 0.9503041) * 100;

  return { X, Y, Z };
}

/**
 * Converts XYZ (D65) to CIELAB (L*, a*, b*)
 */
export function XYZToCIELAB(X: number, Y: number, Z: number): CIELABColor {
  const fx = fXYZ(X / D65_Xn);
  const fy = fXYZ(Y / D65_Yn);
  const fz = fXYZ(Z / D65_Zn);

  const L = Math.max(0, Math.min(100, 116 * fy - 16));
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  const chroma = Math.sqrt(a * a + b * b);
  let hueAngle = (Math.atan2(b, a) * 180) / Math.PI;
  if (hueAngle < 0) hueAngle += 360;

  return { L, a, b, chroma, hueAngle };
}

function fXYZ(t: number): number {
  const delta = 6 / 29;
  return t > delta * delta * delta ? Math.cbrt(t) : t / (3 * delta * delta) + 4 / 29;
}

function fXYZInv(t: number): number {
  const delta = 6 / 29;
  return t > delta ? t * t * t : 3 * delta * delta * (t - 4 / 29);
}

/**
 * Converts CIELAB back to XYZ
 */
export function CIELABToXYZ(L: number, a: number, b: number): { X: number; Y: number; Z: number } {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const X = D65_Xn * fXYZInv(fx);
  const Y = D65_Yn * fXYZInv(fy);
  const Z = D65_Zn * fXYZInv(fz);

  return { X, Y, Z };
}

/**
 * Converts XYZ to sRGB
 */
export function XYZToSRGB(X: number, Y: number, Z: number): RGBColor {
  const x = X / 100;
  const y = Y / 100;
  const z = Z / 100;

  const rL = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
  const gL = -x * 0.969266 + y * 1.8760108 + z * 0.041556;
  const bL = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;

  const r = linearToSRGB(rL);
  const g = linearToSRGB(gL);
  const b = linearToSRGB(bL);
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  return { r, g, b, hex };
}

/**
 * Direct sRGB [0..255] to CIELAB
 */
export function sRGBToCIELAB(r: number, g: number, b: number): CIELABColor {
  const xyz = sRGBToXYZ(r, g, b);
  return XYZToCIELAB(xyz.X, xyz.Y, xyz.Z);
}

/**
 * Direct CIELAB to RGBColor
 */
export function CIELABToSRGB(L: number, a: number, b: number): RGBColor {
  const xyz = CIELABToXYZ(L, a, b);
  return XYZToSRGB(xyz.X, xyz.Y, xyz.Z);
}

/**
 * Calculates CIEDE2000 (ΔE00) color difference.
 * Standard in dental color research (kL = kC = kH = 1) per ISO/TR 28642.
 * 
 * IMPORTANT: Returns NaN for invalid, non-finite, or out-of-range coordinates.
 * An invalid measurement MUST fail visibly rather than returning 0 (which would falsify a perfect match).
 */
export function calculateDeltaE00(lab1: CIELABColor, lab2: CIELABColor): number {
  if (!isValidCIELAB(lab1) || !isValidCIELAB(lab2)) {
    return NaN;
  }

  const kL = 1.0;
  const kC = 1.0;
  const kH = 1.0;

  const L1 = lab1.L;
  const a1 = lab1.a;
  const b1 = lab1.b;

  const L2 = lab2.L;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  const C_bar_pow7 = Math.pow(C_bar, 7);
  const G = 0.5 * (1 - Math.sqrt(C_bar_pow7 / (C_bar_pow7 + Math.pow(25, 7))));

  const a1_prime = (1 + G) * a1;
  const a2_prime = (1 + G) * a2;

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

  const h1_prime = (Math.atan2(b1, a1_prime) * 180) / Math.PI + (Math.atan2(b1, a1_prime) < 0 ? 360 : 0);
  const h2_prime = (Math.atan2(b2, a2_prime) * 180) / Math.PI + (Math.atan2(b2, a2_prime) < 0 ? 360 : 0);

  const deltaL_prime = L2 - L1;
  const deltaC_prime = C2_prime - C1_prime;

  let deltah_prime = 0;
  if (C1_prime * C2_prime !== 0) {
    const diff = h2_prime - h1_prime;
    if (Math.abs(diff) <= 180) {
      deltah_prime = diff;
    } else if (diff > 180) {
      deltah_prime = diff - 360;
    } else {
      deltah_prime = diff + 360;
    }
  }

  const deltaH_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(((deltah_prime / 2) * Math.PI) / 180);

  const L_bar_prime = (L1 + L2) / 2;
  const C_bar_prime = (C1_prime + C2_prime) / 2;

  let h_bar_prime = 0;
  if (C1_prime * C2_prime !== 0) {
    const diff = Math.abs(h1_prime - h2_prime);
    if (diff <= 180) {
      h_bar_prime = (h1_prime + h2_prime) / 2;
    } else if (h1_prime + h2_prime < 360) {
      h_bar_prime = (h1_prime + h2_prime + 360) / 2;
    } else {
      h_bar_prime = (h1_prime + h2_prime - 360) / 2;
    }
  } else {
    h_bar_prime = h1_prime + h2_prime;
  }

  const T =
    1 -
    0.17 * Math.cos(((h_bar_prime - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * h_bar_prime) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * h_bar_prime + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * h_bar_prime - 63) * Math.PI) / 180);

  const deltaTheta = 30 * Math.exp(-Math.pow((h_bar_prime - 275) / 25, 2));
  const C_bar_prime_pow7 = Math.pow(C_bar_prime, 7);
  const RC = 2 * Math.sqrt(C_bar_prime_pow7 / (C_bar_prime_pow7 + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(L_bar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar_prime - 50, 2));
  const SC = 1 + 0.045 * C_bar_prime;
  const SH = 1 + 0.015 * C_bar_prime * T;
  const RT = -Math.sin(((2 * deltaTheta) * Math.PI) / 180) * RC;

  const termL = deltaL_prime / (kL * SL);
  const termC = deltaC_prime / (kC * SC);
  const termH = deltaH_prime / (kH * SH);

  const underRadical = termL * termL + termC * termC + termH * termH + RT * termC * termH;
  if (!Number.isFinite(underRadical) || underRadical < 0) {
    return NaN;
  }

  const deltaE00 = Math.sqrt(underRadical);
  return Number.isFinite(deltaE00) ? deltaE00 : NaN;
}

/**
 * Calculates Euclidean ΔE*ab (CIE 1976).
 * Returns NaN for invalid coordinates.
 */
export function calculateDeltaEab(lab1: CIELABColor, lab2: CIELABColor): number {
  if (!isValidCIELAB(lab1) || !isValidCIELAB(lab2)) {
    return NaN;
  }
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  const distSq = dL * dL + da * da + db * db;
  return Number.isFinite(distSq) && distSq >= 0 ? Math.sqrt(distSq) : NaN;
}

/**
 * Translates CIELAB coordinates into the Munsell System.
 * In dentistry, Value (lightness) is the critical primary determinant of clinical success.
 */
export function translateLabToMunsell(lab: CIELABColor): MunsellColor {
  if (!isValidCIELAB(lab)) {
    return {
      hue: "N/A",
      value: NaN,
      chroma: NaN,
      notation: "Invalid Measurement",
      valueSignificance: "CRITICAL_PRIMARY",
    };
  }

  // Munsell Value (0 to 10 scale derived from L*)
  const value = Math.max(0, Math.min(10, lab.L / 10));
  
  // Chroma in Munsell roughly correlates with C*ab / 4.8 in dental yellow-red range
  const cStar = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  const chroma = Math.max(0, Math.min(14, cStar / 4.8));

  // Dental Hue Angle mapping (typically between 70° and 100° in tooth range)
  let hueAngle = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (hueAngle < 0) hueAngle += 360;

  let hue = "2.5Y";
  if (hueAngle >= 92) {
    hue = "5Y (Yellow)";
  } else if (hueAngle >= 82) {
    hue = "2.5Y (Reddish-Yellow)";
  } else if (hueAngle >= 74) {
    hue = "10YR (Yellow-Red)";
  } else if (hueAngle >= 65) {
    hue = "7.5YR (Warm Orange-Red)";
  } else {
    hue = "5YR (Reddish)";
  }

  const notation = `${hue.split(" ")[0]} ${value.toFixed(1)}/${chroma.toFixed(1)}`;

  return {
    hue,
    value: Number(value.toFixed(2)),
    chroma: Number(chroma.toFixed(2)),
    notation,
    valueSignificance: "CRITICAL_PRIMARY",
  };
}

/**
 * Returns traffic light color category based on CIEDE2000 thresholds (Paravina et al., Joiner et al.)
 * Green: <= 1.6 (Imperceptible / Excellent match, well below 1.8 clinical acceptability limit)
 * Yellow: 1.6 - 3.2 (Clinically acceptable shade match range)
 * Red: > 3.2 (Clinically unacceptable color deviation requiring formulation correction)
 * Invalid: NaN or non-finite calculation input
 */
export function getTrafficLightStatus(deltaE00: number): TrafficLightStatus {
  if (!Number.isFinite(deltaE00) || deltaE00 < 0) return "invalid";
  if (deltaE00 <= 1.6) return "green";
  if (deltaE00 <= 3.2) return "yellow";
  return "red";
}

/**
 * Computes a standardized Color Proximity Index (0..100).
 * 
 * NOTE ON NOMENCLATURE: This index is a deterministic distance-scaling metric relative 
 * to the clinical threshold of ΔE00 = 4.0. It is NOT a Bayesian probability or clinical 
 * guarantee, and is documented as a Proximity / Similarity Score.
 */
export function calculateMatchSimilarityScore(deltaE00: number): number {
  if (!Number.isFinite(deltaE00) || deltaE00 < 0) return 0;
  // Scaled linearly where ΔE00 = 0 -> 100%, ΔE00 = 1.6 -> 80%, ΔE00 = 3.2 -> 60%, ΔE00 >= 8.0 -> 0%
  return Math.max(0, Math.min(100, Math.round(100 - (deltaE00 / 4.0) * 50)));
}

/**
 * Finds top matching dental shades from a given shade database.
 * If sampledLab is invalid, marks result as unmeasurable and trafficLight="invalid".
 */
export function findClosestShades(
  sampledLab: CIELABColor,
  database: StandardShade[],
  limit = 5
): ShadeMatchResult[] {
  const isSampleValid = isValidCIELAB(sampledLab);

  const scored: ShadeMatchResult[] = database.map((shade) => {
    if (!isSampleValid) {
      return {
        shade,
        deltaE00: NaN,
        deltaEab: NaN,
        trafficLight: "invalid" as const,
        matchRank: 0,
        matchSimilarityScore: 0,
        confidencePercent: 0,
        isMeasurable: false,
      };
    }

    const deltaE00 = calculateDeltaE00(sampledLab, shade.lab);
    const deltaEab = calculateDeltaEab(sampledLab, shade.lab);
    const trafficLight = getTrafficLightStatus(deltaE00);
    const matchSimilarityScore = calculateMatchSimilarityScore(deltaE00);

    return {
      shade,
      deltaE00: Number.isFinite(deltaE00) ? Number(deltaE00.toFixed(2)) : NaN,
      deltaEab: Number.isFinite(deltaEab) ? Number(deltaEab.toFixed(2)) : NaN,
      trafficLight,
      matchRank: 0,
      matchSimilarityScore,
      confidencePercent: matchSimilarityScore,
      isMeasurable: Number.isFinite(deltaE00),
    };
  });

  if (!isSampleValid) {
    return scored.slice(0, limit).map((res, index) => ({
      ...res,
      matchRank: index + 1,
    }));
  }

  scored.sort((a, b) => {
    if (Number.isNaN(a.deltaE00)) return 1;
    if (Number.isNaN(b.deltaE00)) return -1;
    return a.deltaE00 - b.deltaE00;
  });

  return scored.slice(0, limit).map((res, index) => ({
    ...res,
    matchRank: index + 1,
  }));
}

/**
 * Applies neutral gray reference card calibration to an RGB sample
 */
export function applyCalibration(
  rgb: RGBColor,
  multipliers: { r: number; g: number; b: number }
): RGBColor {
  const rCal = Math.min(255, Math.max(0, Math.round(rgb.r * multipliers.r)));
  const gCal = Math.min(255, Math.max(0, Math.round(rgb.g * multipliers.g)));
  const bCal = Math.min(255, Math.max(0, Math.round(rgb.b * multipliers.b)));
  const hex = `#${rCal.toString(16).padStart(2, "0")}${gCal.toString(16).padStart(2, "0")}${bCal.toString(16).padStart(2, "0")}`;

  return { r: rCal, g: gCal, b: bCal, hex };
}

export const ZONE_OFFSETS = {
  cervical: {
    dL: -3.5,
    da: 0.8,
    db: 3.2,
    opticalCharacteristics: ["High Chroma Saturation", "Warm Terracotta/Ochre", "Dentin Emergence Profile"],
    description: "Warmer saturation (+b*), thinner enamel, strong dentin presence.",
  },
  incisal: {
    dL: 2.0,
    da: -0.9,
    db: -4.5,
    opticalCharacteristics: ["3-Lobe Mamelon Architecture", "Opal Effect (OE1/OE2)", "Amber Halo Rim"],
    description: "High translucency, opalescent light scattering (blue reflection / amber transmission), mamelon lobes.",
  },
};
