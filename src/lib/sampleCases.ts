import { ClinicalCase } from "../types/dental";

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: "case-central-incisor-a2",
    title: "Maxillary Right Central Incisor (#8 / FDI 11)",
    patientInitials: "M.K.",
    toothNumber: "#8 (11)",
    indication: "Direct Ceramic Veneer (Aesthetic Zone)",
    imageUrl: "synthetic://case-1-non-polarized",
    polarizedImageUrl: "synthetic://case-1-polarized",
    referenceCardPosition: { x: 20, y: 340, width: 90, height: 50 },
    toothBounds: { x: 130, y: 40, width: 220, height: 320 },
    defaultPrepShade: "ND2",
    defaultRestoration: "porcelain_veneer",
    defaultMaterial: "lithium_disilicate",
    defaultThickness: 0.6,
    clinicalNotes: "Patient requesting single unit veneer to match adjacent #9. Distinct mamelons in incisal third, slight warmth at cervical margin.",
  },
  {
    id: "case-bleach-incisor",
    title: "High-Value Bleached Anterior (#9 / FDI 21)",
    patientInitials: "S.R.",
    toothNumber: "#9 (21)",
    indication: "Full Contour Lithium Disilicate Crown",
    imageUrl: "synthetic://case-2-non-polarized",
    polarizedImageUrl: "synthetic://case-2-polarized",
    referenceCardPosition: { x: 20, y: 340, width: 90, height: 50 },
    toothBounds: { x: 130, y: 40, width: 220, height: 320 },
    defaultPrepShade: "ND1",
    defaultRestoration: "anterior_crown",
    defaultMaterial: "lithium_disilicate",
    defaultThickness: 1.0,
    clinicalNotes: "Post-bleaching shade evaluation (0M1/BL1 target). High value with subtle blue-amber opalescence at incisal corners.",
  },
  {
    id: "case-dark-stump-tetracycline",
    title: "Discolored Substrate Masking (#8 / FDI 11)",
    patientInitials: "D.H.",
    toothNumber: "#8 (11)",
    indication: "Full Masking Crown over ND5 Dark Prep",
    imageUrl: "synthetic://case-3-non-polarized",
    polarizedImageUrl: "synthetic://case-3-polarized",
    referenceCardPosition: { x: 20, y: 340, width: 90, height: 50 },
    toothBounds: { x: 130, y: 40, width: 220, height: 320 },
    defaultPrepShade: "ND5",
    defaultRestoration: "anterior_crown",
    defaultMaterial: "lithium_disilicate",
    defaultThickness: 1.2,
    clinicalNotes: "Heavily discolored tetracycline-stained vital stump (ND5). Requires Medium Opacity (MO) or High Opacity (HO) ingot compensation to achieve final A2.",
  },
  {
    id: "case-dehydration-study",
    title: "Hydrated vs Dehydrated Study (#7 / FDI 12)",
    patientInitials: "L.B.",
    toothNumber: "#7 (12)",
    indication: "Lateral Incisor Aesthetic Assessment",
    imageUrl: "synthetic://case-4-non-polarized",
    polarizedImageUrl: "synthetic://case-4-polarized",
    referenceCardPosition: { x: 20, y: 340, width: 90, height: 50 },
    toothBounds: { x: 130, y: 40, width: 220, height: 320 },
    defaultPrepShade: "ND3",
    defaultRestoration: "porcelain_veneer",
    defaultMaterial: "feldspathic_porcelain",
    defaultThickness: 0.5,
    clinicalNotes: "Demonstration of dehydration value spike (L* increases by +5.8 when teeth are dried under isolation for >3 mins).",
  },
];

/**
 * Procedurally draws a photorealistic clinical tooth onto an HTML5 canvas,
 * with precise simulated CIELAB dental values, cervical saturation,
 * mamelon anatomy, enamel opalescence, specular glare (if non-polarized),
 * and an 18% neutral gray reference card in the corner.
 */
export function drawToothOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  caseId: string,
  polarized: boolean,
  calibrationFactor: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 },
  showZonesOverlay = false,
  showHeatmap = false,
  enhanceMamelonContrast = false
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Background: Oral cavity dark neutral depth
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
  bgGrad.addColorStop(0, "#1c1412");
  bgGrad.addColorStop(0.7, "#120c0a");
  bgGrad.addColorStop(1, "#080505");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Gingival tissue (Gum margin at top)
  const gingivaGrad = ctx.createLinearGradient(0, 0, 0, 95);
  gingivaGrad.addColorStop(0, "#9c424d");
  gingivaGrad.addColorStop(0.6, "#b85462");
  gingivaGrad.addColorStop(0.9, "#d67a87");
  gingivaGrad.addColorStop(1, "#c96574");

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, 70);
  // Scalloped gingival zenith for #8
  ctx.bezierCurveTo(width * 0.8, 65, width * 0.65, 45, width * 0.5, 42);
  ctx.bezierCurveTo(width * 0.35, 40, width * 0.2, 65, 0, 75);
  ctx.closePath();
  ctx.fillStyle = gingivaGrad;
  ctx.fill();

  // Tooth Anatomy Coordinates
  const toothX = width * 0.5;
  const toothY = 55;
  const toothW = width * 0.44;
  const toothH = height * 0.72;

  // Draw Tooth Silhouette
  ctx.beginPath();
  // Cervical margin (top curve)
  ctx.moveTo(toothX - toothW * 0.38, toothY + 15);
  ctx.bezierCurveTo(toothX - toothW * 0.2, toothY - 8, toothX + toothW * 0.2, toothY - 8, toothX + toothW * 0.38, toothY + 15);
  // Distal contour (right edge)
  ctx.bezierCurveTo(toothX + toothW * 0.48, toothY + toothH * 0.35, toothX + toothW * 0.5, toothY + toothH * 0.75, toothX + toothW * 0.44, toothY + toothH * 0.94);
  // Distal incisal corner (rounded)
  ctx.bezierCurveTo(toothX + toothW * 0.4, toothY + toothH * 0.98, toothX + toothW * 0.3, toothY + toothH, toothX + toothW * 0.15, toothY + toothH);
  // Incisal edge (with subtle natural micro-undulations)
  ctx.lineTo(toothX - toothW * 0.25, toothY + toothH);
  // Mesial incisal corner (sharp/90 degrees)
  ctx.lineTo(toothX - toothW * 0.45, toothY + toothH);
  // Mesial contour (left edge, straighter)
  ctx.bezierCurveTo(toothX - toothW * 0.48, toothY + toothH * 0.7, toothX - toothW * 0.46, toothY + toothH * 0.3, toothX - toothW * 0.38, toothY + 15);
  ctx.closePath();

  // Color parameters based on Case
  let cervicalColor = "#d7b275"; // High chroma warm dentin
  let bodyColor = "#ecd4a4";     // Core A2 shade
  let incisalBase = "#e8dac0";    // Light enamel
  let incisalHalo = "#c4d5e8";    // Opalescent blue-amber transition

  if (caseId === "case-bleach-incisor") {
    cervicalColor = "#f4e6ca";
    bodyColor = "#f8f0dc";
    incisalBase = "#faf6eb";
    incisalHalo = "#dce7f5";
  } else if (caseId === "case-dark-stump-tetracycline") {
    cervicalColor = "#b5874c";
    bodyColor = "#d9b882";
    incisalBase = "#dfcaa0";
    incisalHalo = "#bcccdb";
  } else if (caseId === "case-dehydration-study") {
    cervicalColor = "#e8c992";
    bodyColor = "#f3e2bf"; // Chalky dry value
    incisalBase = "#f7edd8";
    incisalHalo = "#e2eaf4";
  }

  // Create Base Tooth Color Gradient (Cervical -> Body -> Incisal)
  const toothGrad = ctx.createLinearGradient(toothX, toothY, toothX, toothY + toothH);
  toothGrad.addColorStop(0.0, cervicalColor);
  toothGrad.addColorStop(0.25, cervicalColor);
  toothGrad.addColorStop(0.55, bodyColor);
  toothGrad.addColorStop(0.85, incisalBase);
  toothGrad.addColorStop(1.0, incisalHalo);

  ctx.fillStyle = toothGrad;
  ctx.fill();

  // Internal Dentin Lobes & Mamelons (Revealed by Cross-Polarization or Mamelon Contrast Mode)
  if (polarized || enhanceMamelonContrast) {
    // Lobes: Mesial, Central, Distal Mamelons
    const mamelonGrad = ctx.createLinearGradient(toothX, toothY + toothH * 0.5, toothX, toothY + toothH * 0.95);
    if (enhanceMamelonContrast) {
      mamelonGrad.addColorStop(0, "rgba(220, 140, 50, 0.7)");
      mamelonGrad.addColorStop(0.65, "rgba(255, 185, 90, 0.95)");
      mamelonGrad.addColorStop(1, "rgba(255, 235, 170, 0.45)");
    } else {
      mamelonGrad.addColorStop(0, "rgba(225, 178, 110, 0.5)");
      mamelonGrad.addColorStop(0.7, "rgba(240, 195, 130, 0.7)");
      mamelonGrad.addColorStop(1, "rgba(255, 230, 180, 0.2)");
    }

    ctx.save();
    ctx.clip();

    // Central mamelon lobe
    ctx.beginPath();
    ctx.ellipse(toothX, toothY + toothH * 0.82, toothW * 0.08, toothH * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = mamelonGrad;
    ctx.fill();
    if (enhanceMamelonContrast) {
      ctx.strokeStyle = "rgba(255, 220, 140, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Mesial mamelon lobe
    ctx.beginPath();
    ctx.ellipse(toothX - toothW * 0.18, toothY + toothH * 0.84, toothW * 0.07, toothH * 0.12, -0.08, 0, Math.PI * 2);
    ctx.fill();
    if (enhanceMamelonContrast) {
      ctx.strokeStyle = "rgba(255, 220, 140, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Distal mamelon lobe
    ctx.beginPath();
    ctx.ellipse(toothX + toothW * 0.18, toothY + toothH * 0.84, toothW * 0.07, toothH * 0.12, 0.08, 0, Math.PI * 2);
    ctx.fill();
    if (enhanceMamelonContrast) {
      ctx.strokeStyle = "rgba(255, 220, 140, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Opalescent bluish enamel halo window at incisal edge
    const opalGrad = ctx.createLinearGradient(toothX, toothY + toothH * 0.88, toothX, toothY + toothH);
    if (enhanceMamelonContrast) {
      opalGrad.addColorStop(0, "rgba(120, 180, 240, 0.75)");
      opalGrad.addColorStop(0.5, "rgba(90, 160, 235, 0.6)");
      opalGrad.addColorStop(1, "rgba(255, 210, 130, 0.7)"); // Boosted Amber halo rim
    } else {
      opalGrad.addColorStop(0, "rgba(165, 195, 225, 0.45)");
      opalGrad.addColorStop(0.5, "rgba(140, 180, 220, 0.35)");
      opalGrad.addColorStop(1, "rgba(245, 225, 180, 0.3)"); // Amber halo rim
    }

    ctx.fillStyle = opalGrad;
    ctx.fillRect(toothX - toothW * 0.5, toothY + toothH * 0.88, toothW, toothH * 0.12);

    // If contrast enhancement is active, draw sharp translucent window edge contour
    if (enhanceMamelonContrast) {
      ctx.strokeStyle = "rgba(147, 197, 253, 0.8)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(toothX - toothW * 0.42, toothY + toothH * 0.88);
      ctx.bezierCurveTo(
        toothX - toothW * 0.2, toothY + toothH * 0.87,
        toothX + toothW * 0.2, toothY + toothH * 0.87,
        toothX + toothW * 0.42, toothY + toothH * 0.88
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Subtle natural hypocalcification micro-speckle (fluorosis spot)
    ctx.beginPath();
    ctx.arc(toothX - toothW * 0.22, toothY + toothH * 0.72, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fill();

    ctx.restore();
  }

  if (!polarized && !enhanceMamelonContrast) {
    // Non-Polarized: Specular Flash Reflections & Surface Glare
    ctx.save();
    ctx.clip();

    // Vertical line angle specular highlight (Mesial line angle)
    const glare1 = ctx.createLinearGradient(toothX - toothW * 0.28, toothY + toothH * 0.15, toothX - toothW * 0.22, toothY + toothH * 0.85);
    glare1.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    glare1.addColorStop(0.3, "rgba(255, 255, 255, 0.95)");
    glare1.addColorStop(0.6, "rgba(255, 255, 255, 0.75)");
    glare1.addColorStop(1, "rgba(255, 255, 255, 0.2)");

    ctx.beginPath();
    ctx.ellipse(toothX - toothW * 0.24, toothY + toothH * 0.45, 4, toothH * 0.32, -0.05, 0, Math.PI * 2);
    ctx.fillStyle = glare1;
    ctx.fill();

    // Vertical line angle specular highlight (Distal line angle)
    ctx.beginPath();
    ctx.ellipse(toothX + toothW * 0.22, toothY + toothH * 0.48, 3.5, toothH * 0.28, 0.05, 0, Math.PI * 2);
    ctx.fillStyle = glare1;
    ctx.fill();

    // Center flash bounce spot
    const flashCenter = ctx.createRadialGradient(toothX, toothY + toothH * 0.38, 2, toothX, toothY + toothH * 0.38, toothW * 0.22);
    flashCenter.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    flashCenter.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    flashCenter.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = flashCenter;
    ctx.fillRect(toothX - toothW * 0.3, toothY + toothH * 0.2, toothW * 0.6, toothH * 0.4);

    ctx.restore();
  }

  // Draw Heatmap Overlay if toggled
  if (showHeatmap) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toothX - toothW * 0.38, toothY + 15);
    ctx.bezierCurveTo(toothX - toothW * 0.2, toothY - 8, toothX + toothW * 0.2, toothY - 8, toothX + toothW * 0.38, toothY + 15);
    ctx.bezierCurveTo(toothX + toothW * 0.48, toothY + toothH * 0.35, toothX + toothW * 0.5, toothY + toothH * 0.75, toothX + toothW * 0.44, toothY + toothH * 0.94);
    ctx.bezierCurveTo(toothX + toothW * 0.4, toothY + toothH * 0.98, toothX + toothW * 0.3, toothY + toothH, toothX + toothW * 0.15, toothY + toothH);
    ctx.lineTo(toothX - toothW * 0.25, toothY + toothH);
    ctx.lineTo(toothX - toothW * 0.45, toothY + toothH);
    ctx.bezierCurveTo(toothX - toothW * 0.48, toothY + toothH * 0.7, toothX - toothW * 0.46, toothY + toothH * 0.3, toothX - toothW * 0.38, toothY + 15);
    ctx.closePath();
    ctx.clip();

    const heatGrad = ctx.createLinearGradient(toothX, toothY, toothX, toothY + toothH);
    heatGrad.addColorStop(0, "rgba(239, 68, 68, 0.45)");   // High chroma cervical (warm)
    heatGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.4)"); // Transition
    heatGrad.addColorStop(0.65, "rgba(34, 197, 94, 0.4)"); // Target A2 body (Green match)
    heatGrad.addColorStop(0.9, "rgba(59, 130, 246, 0.45)"); // High translucency incisal (Cool blue)

    ctx.fillStyle = heatGrad;
    ctx.fill();
    ctx.restore();
  }

  // Draw 3-Zone Dividing Lines & Labels if toggled
  if (showZonesOverlay) {
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);

    // Cervical / Middle Boundary
    const y1 = toothY + toothH * 0.33;
    ctx.beginPath();
    ctx.moveTo(toothX - toothW * 0.55, y1);
    ctx.lineTo(toothX + toothW * 0.55, y1);
    ctx.stroke();

    // Middle / Incisal Boundary
    const y2 = toothY + toothH * 0.66;
    ctx.beginPath();
    ctx.moveTo(toothX - toothW * 0.55, y2);
    ctx.lineTo(toothX + toothW * 0.55, y2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillStyle = "#60a5fa";
    ctx.fillText("CERVICAL (Warmer Chroma)", toothX + toothW * 0.58, toothY + toothH * 0.18);
    ctx.fillText("BODY / MIDDLE (Base Shade)", toothX + toothW * 0.58, toothY + toothH * 0.5);
    ctx.fillText("INCISAL (Translucency/Opal)", toothX + toothW * 0.58, toothY + toothH * 0.82);

    ctx.restore();
  }

  // Draw Standard 18% Neutral Gray Calibration Reference Card ("Color Master")
  const cardX = 20;
  const cardY = height - 70;
  const cardW = 95;
  const cardH = 50;

  // Card Outer Rim
  ctx.fillStyle = "#262626";
  ctx.fillRect(cardX - 2, cardY - 2, cardW + 4, cardH + 4);

  // 18% Neutral Gray Target Patch (L* ~ 50.0, sRGB ~ 119, 119, 119)
  const grayR = Math.round(119 * calibrationFactor.r);
  const grayG = Math.round(119 * calibrationFactor.g);
  const grayB = Math.round(119 * calibrationFactor.b);
  ctx.fillStyle = `rgb(${grayR}, ${grayG}, ${grayB})`;
  ctx.fillRect(cardX, cardY, cardW * 0.5, cardH);

  // Pure White Reference Patch (L* ~ 95.0)
  const whiteR = Math.round(242 * calibrationFactor.r);
  const whiteG = Math.round(242 * calibrationFactor.g);
  const whiteB = Math.round(242 * calibrationFactor.b);
  ctx.fillStyle = `rgb(${whiteR}, ${whiteG}, ${whiteB})`;
  ctx.fillRect(cardX + cardW * 0.5, cardY, cardW * 0.5, cardH);

  // Card Label
  ctx.font = "9px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("18% GRAY", cardX + 4, cardY + 16);
  ctx.fillStyle = "#111827";
  ctx.fillText("WHITE 95%", cardX + cardW * 0.5 + 4, cardY + 16);

  ctx.restore();
}
