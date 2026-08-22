import { DieShadeND, StandardShade, SubstrateConfig } from "../types/dental";
import { translateLabToMunsell } from "./colorScience";

/**
 * Standard VITA Classical A1-D4 reference database
 * Based on ISO/TR 28642 and published dental spectrophotometry studies.
 */
export const VITA_CLASSICAL_SHADES: StandardShade[] = [
  {
    id: "vita-a1",
    name: "VITA Classical A1",
    code: "A1",
    system: "VITA_CLASSICAL",
    lab: { L: 78.5, a: 0.8, b: 14.6 },
    munsell: translateLabToMunsell({ L: 78.5, a: 0.8, b: 14.6 }),
    description: "Reddish-brownish hue, high lightness, light natural dentin",
    categoryGroup: "Group A (Reddish-Brownish)",
    recommendedIngot: "IPS e.max LT A1 / MT A1",
  },
  {
    id: "vita-a2",
    name: "VITA Classical A2",
    code: "A2",
    system: "VITA_CLASSICAL",
    lab: { L: 75.3, a: 1.5, b: 17.2 },
    munsell: translateLabToMunsell({ L: 75.3, a: 1.5, b: 17.2 }),
    description: "Reddish-brownish, the most prevalent adult natural shade",
    categoryGroup: "Group A (Reddish-Brownish)",
    recommendedIngot: "IPS e.max LT A2 / Katana STML A2",
  },
  {
    id: "vita-a3",
    name: "VITA Classical A3",
    code: "A3",
    system: "VITA_CLASSICAL",
    lab: { L: 73.1, a: 2.1, b: 19.8 },
    munsell: translateLabToMunsell({ L: 73.1, a: 2.1, b: 19.8 }),
    description: "Reddish-brownish, medium value, higher chroma",
    categoryGroup: "Group A (Reddish-Brownish)",
    recommendedIngot: "IPS e.max LT A3 / Katana UTML A3",
  },
  {
    id: "vita-a3.5",
    name: "VITA Classical A3.5",
    code: "A3.5",
    system: "VITA_CLASSICAL",
    lab: { L: 69.8, a: 2.9, b: 22.4 },
    munsell: translateLabToMunsell({ L: 69.8, a: 2.9, b: 22.4 }),
    description: "Warm reddish-brownish, high chroma, mature dentin",
    categoryGroup: "Group A (Reddish-Brownish)",
    recommendedIngot: "IPS e.max LT A3.5 / MT A3.5",
  },
  {
    id: "vita-a4",
    name: "VITA Classical A4",
    code: "A4",
    system: "VITA_CLASSICAL",
    lab: { L: 65.4, a: 3.8, b: 24.1 },
    munsell: translateLabToMunsell({ L: 65.4, a: 3.8, b: 24.1 }),
    description: "Deep reddish-brownish, low value, saturated chroma",
    categoryGroup: "Group A (Reddish-Brownish)",
    recommendedIngot: "IPS e.max MO 2 / LT A4",
  },
  {
    id: "vita-b1",
    name: "VITA Classical B1",
    code: "B1",
    system: "VITA_CLASSICAL",
    lab: { L: 80.2, a: -0.4, b: 13.2 },
    munsell: translateLabToMunsell({ L: 80.2, a: -0.4, b: 13.2 }),
    description: "Reddish-yellowish, highest natural value shade",
    categoryGroup: "Group B (Reddish-Yellowish)",
    recommendedIngot: "IPS e.max HT B1 / MT B1",
  },
  {
    id: "vita-b2",
    name: "VITA Classical B2",
    code: "B2",
    system: "VITA_CLASSICAL",
    lab: { L: 76.8, a: 0.1, b: 16.5 },
    munsell: translateLabToMunsell({ L: 76.8, a: 0.1, b: 16.5 }),
    description: "Reddish-yellowish, bright aesthetic tooth",
    categoryGroup: "Group B (Reddish-Yellowish)",
    recommendedIngot: "IPS e.max LT B2 / MT B2",
  },
  {
    id: "vita-b3",
    name: "VITA Classical B3",
    code: "B3",
    system: "VITA_CLASSICAL",
    lab: { L: 72.4, a: 0.9, b: 21.6 },
    munsell: translateLabToMunsell({ L: 72.4, a: 0.9, b: 21.6 }),
    description: "Reddish-yellowish, warm saturation",
    categoryGroup: "Group B (Reddish-Yellowish)",
    recommendedIngot: "IPS e.max LT B3",
  },
  {
    id: "vita-b4",
    name: "VITA Classical B4",
    code: "B4",
    system: "VITA_CLASSICAL",
    lab: { L: 68.1, a: 1.6, b: 23.9 },
    munsell: translateLabToMunsell({ L: 68.1, a: 1.6, b: 23.9 }),
    description: "Reddish-yellowish, intense warm yellow chroma",
    categoryGroup: "Group B (Reddish-Yellowish)",
    recommendedIngot: "IPS e.max LT B4",
  },
  {
    id: "vita-c1",
    name: "VITA Classical C1",
    code: "C1",
    system: "VITA_CLASSICAL",
    lab: { L: 74.6, a: -0.2, b: 12.1 },
    munsell: translateLabToMunsell({ L: 74.6, a: -0.2, b: 12.1 }),
    description: "Greyish hue, cool neutral tone, low chroma",
    categoryGroup: "Group C (Greyish)",
    recommendedIngot: "IPS e.max LT C1 / MT C1",
  },
  {
    id: "vita-c2",
    name: "VITA Classical C2",
    code: "C2",
    system: "VITA_CLASSICAL",
    lab: { L: 70.9, a: 0.3, b: 14.5 },
    munsell: translateLabToMunsell({ L: 70.9, a: 0.3, b: 14.5 }),
    description: "Greyish hue, moderate value with muted saturation",
    categoryGroup: "Group C (Greyish)",
    recommendedIngot: "IPS e.max LT C2",
  },
  {
    id: "vita-c3",
    name: "VITA Classical C3",
    code: "C3",
    system: "VITA_CLASSICAL",
    lab: { L: 67.2, a: 0.8, b: 16.8 },
    munsell: translateLabToMunsell({ L: 67.2, a: 0.8, b: 16.8 }),
    description: "Greyish hue, lower value, cooler chromatic profile",
    categoryGroup: "Group C (Greyish)",
    recommendedIngot: "IPS e.max LT C3",
  },
  {
    id: "vita-c4",
    name: "VITA Classical C4",
    code: "C4",
    system: "VITA_CLASSICAL",
    lab: { L: 62.5, a: 1.4, b: 18.2 },
    munsell: translateLabToMunsell({ L: 62.5, a: 1.4, b: 18.2 }),
    description: "Greyish-brownish, dark value, smokey dentin tone",
    categoryGroup: "Group C (Greyish)",
    recommendedIngot: "IPS e.max MO 1 / LT C4",
  },
  {
    id: "vita-d2",
    name: "VITA Classical D2",
    code: "D2",
    system: "VITA_CLASSICAL",
    lab: { L: 74.1, a: -0.6, b: 13.9 },
    munsell: translateLabToMunsell({ L: 74.1, a: -0.6, b: 13.9 }),
    description: "Reddish-grey hue, slightly cool pinkish undertone",
    categoryGroup: "Group D (Reddish-Grey)",
    recommendedIngot: "IPS e.max LT D2",
  },
  {
    id: "vita-d3",
    name: "VITA Classical D3",
    code: "D3",
    system: "VITA_CLASSICAL",
    lab: { L: 71.3, a: 0.2, b: 16.1 },
    munsell: translateLabToMunsell({ L: 71.3, a: 0.2, b: 16.1 }),
    description: "Reddish-grey hue, medium lightness, balanced chroma",
    categoryGroup: "Group D (Reddish-Grey)",
    recommendedIngot: "IPS e.max LT D3",
  },
  {
    id: "vita-d4",
    name: "VITA Classical D4",
    code: "D4",
    system: "VITA_CLASSICAL",
    lab: { L: 68.7, a: 0.7, b: 17.9 },
    munsell: translateLabToMunsell({ L: 68.7, a: 0.7, b: 17.9 }),
    description: "Reddish-grey hue, lower lightness, warm greyish dentin",
    categoryGroup: "Group D (Reddish-Grey)",
    recommendedIngot: "IPS e.max LT D4",
  },
];

/**
 * Standard VITA 3D-Master database
 * Systematic scientific grid: Value Group (1-5) -> Hue (L, M, R) -> Chroma (1-3)
 */
export const VITA_3D_MASTER_SHADES: StandardShade[] = [
  // Value Group 1 (Highest Value)
  {
    id: "3d-1m1",
    name: "VITA 3D-Master 1M1",
    code: "1M1",
    system: "VITA_3D_MASTER",
    lab: { L: 82.8, a: -0.8, b: 12.1 },
    munsell: translateLabToMunsell({ L: 82.8, a: -0.8, b: 12.1 }),
    description: "Value 1 (Very Bright), Medium Hue, Chroma 1 (Low Saturation)",
    categoryGroup: "Value Group 1",
  },
  {
    id: "3d-1m2",
    name: "VITA 3D-Master 1M2",
    code: "1M2",
    system: "VITA_3D_MASTER",
    lab: { L: 81.6, a: -0.3, b: 14.8 },
    munsell: translateLabToMunsell({ L: 81.6, a: -0.3, b: 14.8 }),
    description: "Value 1 (Very Bright), Medium Hue, Chroma 2 (Medium)",
    categoryGroup: "Value Group 1",
  },
  // Value Group 2
  {
    id: "3d-2l1.5",
    name: "VITA 3D-Master 2L1.5",
    code: "2L1.5",
    system: "VITA_3D_MASTER",
    lab: { L: 78.6, a: -0.9, b: 15.2 },
    munsell: translateLabToMunsell({ L: 78.6, a: -0.9, b: 15.2 }),
    description: "Value 2, Yellowish Hue (L), Chroma 1.5",
    categoryGroup: "Value Group 2",
  },
  {
    id: "3d-2m1",
    name: "VITA 3D-Master 2M1",
    code: "2M1",
    system: "VITA_3D_MASTER",
    lab: { L: 78.2, a: 0.1, b: 13.9 },
    munsell: translateLabToMunsell({ L: 78.2, a: 0.1, b: 13.9 }),
    description: "Value 2, Medium Hue (M), Chroma 1",
    categoryGroup: "Value Group 2",
  },
  {
    id: "3d-2m2",
    name: "VITA 3D-Master 2M2",
    code: "2M2",
    system: "VITA_3D_MASTER",
    lab: { L: 76.9, a: 0.8, b: 16.9 },
    munsell: translateLabToMunsell({ L: 76.9, a: 0.8, b: 16.9 }),
    description: "Value 2, Medium Hue (M), Chroma 2 (A2 Equivalent)",
    categoryGroup: "Value Group 2",
  },
  {
    id: "3d-2m3",
    name: "VITA 3D-Master 2M3",
    code: "2M3",
    system: "VITA_3D_MASTER",
    lab: { L: 75.4, a: 1.4, b: 20.3 },
    munsell: translateLabToMunsell({ L: 75.4, a: 1.4, b: 20.3 }),
    description: "Value 2, Medium Hue (M), Chroma 3",
    categoryGroup: "Value Group 2",
  },
  {
    id: "3d-2r1.5",
    name: "VITA 3D-Master 2R1.5",
    code: "2R1.5",
    system: "VITA_3D_MASTER",
    lab: { L: 77.8, a: 1.9, b: 14.8 },
    munsell: translateLabToMunsell({ L: 77.8, a: 1.9, b: 14.8 }),
    description: "Value 2, Reddish Hue (R), Chroma 1.5",
    categoryGroup: "Value Group 2",
  },
  {
    id: "3d-2r2.5",
    name: "VITA 3D-Master 2R2.5",
    code: "2R2.5",
    system: "VITA_3D_MASTER",
    lab: { L: 76.1, a: 2.6, b: 18.7 },
    munsell: translateLabToMunsell({ L: 76.1, a: 2.6, b: 18.7 }),
    description: "Value 2, Reddish Hue (R), Chroma 2.5",
    categoryGroup: "Value Group 2",
  },
  // Value Group 3
  {
    id: "3d-3l1.5",
    name: "VITA 3D-Master 3L1.5",
    code: "3L1.5",
    system: "VITA_3D_MASTER",
    lab: { L: 74.3, a: -0.4, b: 17.5 },
    munsell: translateLabToMunsell({ L: 74.3, a: -0.4, b: 17.5 }),
    description: "Value 3, Yellowish Hue (L), Chroma 1.5",
    categoryGroup: "Value Group 3",
  },
  {
    id: "3d-3m1",
    name: "VITA 3D-Master 3M1",
    code: "3M1",
    system: "VITA_3D_MASTER",
    lab: { L: 73.9, a: 0.6, b: 15.6 },
    munsell: translateLabToMunsell({ L: 73.9, a: 0.6, b: 15.6 }),
    description: "Value 3, Medium Hue (M), Chroma 1",
    categoryGroup: "Value Group 3",
  },
  {
    id: "3d-3m2",
    name: "VITA 3D-Master 3M2",
    code: "3M2",
    system: "VITA_3D_MASTER",
    lab: { L: 72.8, a: 1.6, b: 19.2 },
    munsell: translateLabToMunsell({ L: 72.8, a: 1.6, b: 19.2 }),
    description: "Value 3, Medium Hue (M), Chroma 2 (A3 Equivalent)",
    categoryGroup: "Value Group 3",
  },
  {
    id: "3d-3m3",
    name: "VITA 3D-Master 3M3",
    code: "3M3",
    system: "VITA_3D_MASTER",
    lab: { L: 71.2, a: 2.3, b: 23.4 },
    munsell: translateLabToMunsell({ L: 71.2, a: 2.3, b: 23.4 }),
    description: "Value 3, Medium Hue (M), Chroma 3",
    categoryGroup: "Value Group 3",
  },
  {
    id: "3d-3r1.5",
    name: "VITA 3D-Master 3R1.5",
    code: "3R1.5",
    system: "VITA_3D_MASTER",
    lab: { L: 73.2, a: 2.4, b: 16.9 },
    munsell: translateLabToMunsell({ L: 73.2, a: 2.4, b: 16.9 }),
    description: "Value 3, Reddish Hue (R), Chroma 1.5",
    categoryGroup: "Value Group 3",
  },
  {
    id: "3d-3r2.5",
    name: "VITA 3D-Master 3R2.5",
    code: "3R2.5",
    system: "VITA_3D_MASTER",
    lab: { L: 71.8, a: 3.2, b: 21.1 },
    munsell: translateLabToMunsell({ L: 71.8, a: 3.2, b: 21.1 }),
    description: "Value 3, Reddish Hue (R), Chroma 2.5",
    categoryGroup: "Value Group 3",
  },
  // Value Group 4
  {
    id: "3d-4m1",
    name: "VITA 3D-Master 4M1",
    code: "4M1",
    system: "VITA_3D_MASTER",
    lab: { L: 68.9, a: 0.9, b: 16.8 },
    munsell: translateLabToMunsell({ L: 68.9, a: 0.9, b: 16.8 }),
    description: "Value 4 (Darker), Medium Hue (M), Chroma 1",
    categoryGroup: "Value Group 4",
  },
  {
    id: "3d-4m2",
    name: "VITA 3D-Master 4M2",
    code: "4M2",
    system: "VITA_3D_MASTER",
    lab: { L: 67.5, a: 2.1, b: 21.4 },
    munsell: translateLabToMunsell({ L: 67.5, a: 2.1, b: 21.4 }),
    description: "Value 4, Medium Hue (M), Chroma 2 (A3.5 Equivalent)",
    categoryGroup: "Value Group 4",
  },
  {
    id: "3d-4m3",
    name: "VITA 3D-Master 4M3",
    code: "4M3",
    system: "VITA_3D_MASTER",
    lab: { L: 65.8, a: 3.1, b: 25.6 },
    munsell: translateLabToMunsell({ L: 65.8, a: 3.1, b: 25.6 }),
    description: "Value 4, Medium Hue (M), Chroma 3",
    categoryGroup: "Value Group 4",
  },
  // Value Group 5
  {
    id: "3d-5m1",
    name: "VITA 3D-Master 5M1",
    code: "5M1",
    system: "VITA_3D_MASTER",
    lab: { L: 63.2, a: 1.5, b: 18.6 },
    munsell: translateLabToMunsell({ L: 63.2, a: 1.5, b: 18.6 }),
    description: "Value 5 (Deep Dark), Medium Hue, Chroma 1",
    categoryGroup: "Value Group 5",
  },
  {
    id: "3d-5m2",
    name: "VITA 3D-Master 5M2",
    code: "5M2",
    system: "VITA_3D_MASTER",
    lab: { L: 61.8, a: 2.9, b: 23.8 },
    munsell: translateLabToMunsell({ L: 61.8, a: 2.9, b: 23.8 }),
    description: "Value 5 (Deep Dark), Medium Hue, Chroma 2",
    categoryGroup: "Value Group 5",
  },
];

/**
 * Bleach shade guide database
 */
export const BLEACH_SHADES: StandardShade[] = [
  {
    id: "bleach-0m1",
    name: "VITA Bleach 0M1",
    code: "0M1",
    system: "BLEACH",
    lab: { L: 87.6, a: -1.2, b: 7.8 },
    munsell: translateLabToMunsell({ L: 87.6, a: -1.2, b: 7.8 }),
    description: "Ultra-bright bleached shade, maximum value, minimal chroma",
    categoryGroup: "Bleach Guides",
    recommendedIngot: "IPS e.max HT BL1 / MT BL1",
  },
  {
    id: "bleach-0m2",
    name: "VITA Bleach 0M2",
    code: "0M2",
    system: "BLEACH",
    lab: { L: 85.9, a: -0.9, b: 9.6 },
    munsell: translateLabToMunsell({ L: 85.9, a: -0.9, b: 9.6 }),
    description: "High value bleach shade, soft warm undertone",
    categoryGroup: "Bleach Guides",
    recommendedIngot: "IPS e.max HT BL2 / MT BL2",
  },
  {
    id: "bleach-0m3",
    name: "VITA Bleach 0M3",
    code: "0M3",
    system: "BLEACH",
    lab: { L: 84.1, a: -0.6, b: 11.2 },
    munsell: translateLabToMunsell({ L: 84.1, a: -0.6, b: 11.2 }),
    description: "Natural bleached transition shade (BL3/BL4)",
    categoryGroup: "Bleach Guides",
    recommendedIngot: "IPS e.max LT BL3 / MT BL3",
  },
  {
    id: "bleach-bl1",
    name: "Ivoclar BL1",
    code: "BL1",
    system: "BLEACH",
    lab: { L: 88.2, a: -1.4, b: 6.9 },
    munsell: translateLabToMunsell({ L: 88.2, a: -1.4, b: 6.9 }),
    description: "Hollywood bleached aesthetic, ultra high luminance",
    categoryGroup: "Bleach Guides",
    recommendedIngot: "IPS e.max HT BL1",
  },
];

/**
 * Natural Die / Stump Shades (ND1 to ND9)
 * Used by dental laboratories to simulate underlying abutment/stump color.
 */
export const STUMP_DIE_SHADES: Record<DieShadeND, { label: string; description: string; lab: { L: number; a: number; b: number }; hex: string }> = {
  ND1: {
    label: "ND1 - Ultra Light Vital",
    description: "Bleached or very bright vital tooth stump",
    lab: { L: 81.2, a: 1.1, b: 15.4 },
    hex: "#f3e7cb",
  },
  ND2: {
    label: "ND2 - Light Natural Vital",
    description: "Standard vital A1/B1/B2 preparation",
    lab: { L: 76.5, a: 2.2, b: 18.9 },
    hex: "#ebd4ae",
  },
  ND3: {
    label: "ND3 - Medium Natural Vital",
    description: "Standard vital A2/A3 preparation",
    lab: { L: 72.8, a: 3.4, b: 22.1 },
    hex: "#dec193",
  },
  ND4: {
    label: "ND4 - Dark Vital / Mild Stain",
    description: "A3.5/A4 vital dentin or slight discoloration",
    lab: { L: 67.4, a: 4.8, b: 24.8 },
    hex: "#cea674",
  },
  ND5: {
    label: "ND5 - Very Dark Vital / Tetracycline",
    description: "Tetracycline stain or deep amber sclerotic dentin",
    lab: { L: 61.2, a: 5.9, b: 27.2 },
    hex: "#b88a53",
  },
  ND6: {
    label: "ND6 - Devitalized Grey-Brown",
    description: "Endodontically treated discolored stump",
    lab: { L: 58.6, a: 2.6, b: 16.8 },
    hex: "#9b826b",
  },
  ND7: {
    label: "ND7 - Severe Brown Discoloration",
    description: "Deep necrotic / stained root canal dentin",
    lab: { L: 52.1, a: 3.8, b: 14.5 },
    hex: "#7f624c",
  },
  ND8: {
    label: "ND8 - Dark Grey / Metal Core",
    description: "Amalgam tattoo or cast post-and-core shadow",
    lab: { L: 47.3, a: 0.8, b: 9.2 },
    hex: "#6b6763",
  },
  ND9: {
    label: "ND9 - Severely Dark / Metallic",
    description: "Direct titanium abutment or black discolored core",
    lab: { L: 38.9, a: 0.2, b: 5.1 },
    hex: "#4e4c49",
  },
};

/**
 * Intelligent Ceramic Ingot and Masking Engine
 * Calculates the required ingot opacity and compensation based on:
 * - Substrate Die Shade (ND1-ND9)
 * - Target Shade
 * - Material
 * - Layer thickness (mm)
 */
export function calculateCeramicRecipe(
  targetShadeCode: string,
  substrate: SubstrateConfig
): {
  recommendedIngot: string;
  recommendedOpacity: "HT" | "MT" | "LT" | "MO" | "HO";
  maskingDifficulty: "Low" | "Moderate" | "High" | "Critical";
  cervicalRecipe: string;
  bodyRecipe: string;
  incisalRecipe: string;
  firingAdvice: string;
} {
  const { prepShade, thicknessMm, material } = substrate;
  const isDarkPrep = ["ND4", "ND5", "ND6", "ND7", "ND8", "ND9"].includes(prepShade);
  const isSeverelyDark = ["ND6", "ND7", "ND8", "ND9"].includes(prepShade);

  let recommendedOpacity: "HT" | "MT" | "LT" | "MO" | "HO" = "LT";
  let recommendedIngot = `IPS e.max LT ${targetShadeCode}`;
  let maskingDifficulty: "Low" | "Moderate" | "High" | "Critical" = "Low";

  if (material === "lithium_disilicate") {
    if (thicknessMm < 0.6) {
      if (isDarkPrep) {
        recommendedOpacity = "MO";
        recommendedIngot = "IPS e.max MO 1 (Medium Opacity) + Layering";
        maskingDifficulty = "Critical";
      } else {
        recommendedOpacity = "HT";
        recommendedIngot = `IPS e.max HT ${targetShadeCode}`;
        maskingDifficulty = "Low";
      }
    } else if (thicknessMm <= 1.0) {
      if (isSeverelyDark) {
        recommendedOpacity = "HO";
        recommendedIngot = "IPS e.max HO 1 (High Opacity Substructure) + Cut-back";
        maskingDifficulty = "High";
      } else if (isDarkPrep) {
        recommendedOpacity = "MO";
        recommendedIngot = "IPS e.max MO 1 + Dentin A2 Layering";
        maskingDifficulty = "Moderate";
      } else {
        recommendedOpacity = "LT";
        recommendedIngot = `IPS e.max LT ${targetShadeCode}`;
        maskingDifficulty = "Low";
      }
    } else {
      // Full crown 1.2mm - 1.5mm
      if (isSeverelyDark) {
        recommendedOpacity = "MO";
        recommendedIngot = `IPS e.max MO 1 or ZirCAD Prime (High Masking Core)`;
        maskingDifficulty = "Moderate";
      } else {
        recommendedOpacity = "LT";
        recommendedIngot = `IPS e.max LT ${targetShadeCode}`;
        maskingDifficulty = "Low";
      }
    }
  } else if (material.startsWith("zirconia")) {
    if (material === "zirconia_multilayer_5y") {
      recommendedIngot = `Katana UTML / 5Y Anterior Disc (${targetShadeCode})`;
      recommendedOpacity = isDarkPrep ? "MT" : "HT";
      maskingDifficulty = isDarkPrep ? "High" : "Low";
    } else if (material === "zirconia_multilayer_4y") {
      recommendedIngot = `Katana STML / 4Y Universal Disc (${targetShadeCode})`;
      recommendedOpacity = "LT";
      maskingDifficulty = isDarkPrep ? "Moderate" : "Low";
    } else {
      recommendedIngot = `High Masking 3Y-TZP Opaque Core (${targetShadeCode})`;
      recommendedOpacity = "HO";
      maskingDifficulty = "Low";
    }
  } else if (material === "feldspathic_porcelain") {
    recommendedIngot = `VITA VM9 / Creation CC Feldspathic Veneer Powder (${targetShadeCode})`;
    recommendedOpacity = "LT";
    maskingDifficulty = isDarkPrep ? "Critical" : "Low";
  }

  // Recipes tailored to dental aesthetics
  const cervicalRecipe = `Cervical Accentuation: VITA Akzent Plus Stain ES02 (Copper / Warm Ochre) mixed 70:30 with Glaze Paste. Light dusting of Essence Dark Terracotta at the gingival margin (0.5mm - 1.0mm).`;
  
  const bodyRecipe = `Core Body: Ceram Dentin (${targetShadeCode}) blended with 10% Deep Dentin at the middle-cervical junction to ensure natural light scattering without value drop.`;
  
  const incisalRecipe = `Incisal Third & Enamel: Opal Effect 1 (OE1 / Blue-Amber opalescence) layered over mamelon structures. Apply Transpa Neutral (TN) on incisal halo edge with a subtle 0.2mm high-value halo rim.`;

  const firingAdvice = `Firing Cycle: Initial Dentin/Enamel vacuum bake at 750°C (rate 55°C/min, hold 1:00 min). Slow cooling down to 450°C (2.5 mins) to prevent micro-tensile stress in the veneer/crown interface.`;

  return {
    recommendedIngot,
    recommendedOpacity,
    maskingDifficulty,
    cervicalRecipe,
    bodyRecipe,
    incisalRecipe,
    firingAdvice,
  };
}
