import { CIELABColor } from "../types/dental";

/**
 * Validation result structure
 */
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

/**
 * Allowed image MIME types for intraoral photography
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_IMAGE_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

/**
 * Validates an uploaded intraoral photo file.
 */
export function validateImageUpload(file: File): ValidationResult<File> {
  const errors: string[] = [];

  if (!file) {
    return { isValid: false, errors: ["No file was provided."] };
  }

  // Type check
  const fileType = file.type.toLowerCase();
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const isValidType = 
    ALLOWED_IMAGE_MIME_TYPES.includes(fileType) || 
    ["jpg", "jpeg", "png", "webp"].includes(fileExtension || "");

  if (!isValidType) {
    errors.push(
      `Unsupported file format (${file.type || "unknown"}). Please upload a clinical JPEG, PNG, or WebP photo.`
    );
  }

  // Size check
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(
      `File size (${sizeMb} MB) exceeds the 12 MB clinical capture limit. Please compress or resize the photograph.`
    );
  }

  if (file.size === 0) {
    errors.push("The selected file is empty (0 bytes).");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? file : undefined,
  };
}

/**
 * Validates CIELAB coordinates ensuring numeric bounds conform to human dental range.
 */
export function validateCIELABCoordinates(lab: any): ValidationResult<CIELABColor> {
  const errors: string[] = [];

  if (!lab || typeof lab !== "object") {
    return { isValid: false, errors: ["CIELAB color object is missing or null."] };
  }

  const { L, a, b } = lab;

  if (typeof L !== "number" || !Number.isFinite(L)) {
    errors.push("L* (Lightness / Value) must be a finite number.");
  } else if (L < 0 || L > 100) {
    errors.push(`L* value (${L}) is out of physical range [0..100].`);
  }

  if (typeof a !== "number" || !Number.isFinite(a)) {
    errors.push("a* (Green-Red axis) must be a finite number.");
  } else if (a < -128 || a > 128) {
    errors.push(`a* value (${a}) is outside acceptable gamut [-128..128].`);
  }

  if (typeof b !== "number" || !Number.isFinite(b)) {
    errors.push("b* (Blue-Yellow axis) must be a finite number.");
  } else if (b < -128 || b > 128) {
    errors.push(`b* value (${b}) is outside acceptable gamut [-128..128].`);
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          L,
          a,
          b,
          chroma: Math.sqrt(a * a + b * b),
          hueAngle: (Math.atan2(b, a) * 180) / Math.PI + (Math.atan2(b, a) < 0 ? 360 : 0),
        }
      : undefined,
  };
}

/**
 * Validates raw AI analysis response against the expected clinical contract.
 */
export function validateAiAnalysisResponse(raw: any): ValidationResult<any> {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { isValid: false, errors: ["AI response payload is not an object."] };
  }

  if (typeof raw.summary !== "string" || !raw.summary.trim()) {
    errors.push("Missing or non-string clinical summary.");
  }

  if (!raw.morphology || typeof raw.morphology !== "object") {
    errors.push("Missing morphology assessment block.");
  }

  if (!raw.ceramicRecipe || typeof raw.ceramicRecipe !== "object") {
    errors.push("Missing ceramic formulation recipe.");
  }

  if (raw.trafficLight && typeof raw.trafficLight === "object") {
    const status = raw.trafficLight.status;
    if (status && !["green", "yellow", "red"].includes(status)) {
      errors.push(`Invalid traffic light status '${status}'.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: raw,
  };
}

/**
 * Robust clipboard copy helper with error handling and fallback mechanism.
 */
export async function copyToClipboard(text: string): Promise<{ success: boolean; error?: string }> {
  if (!text) {
    return { success: false, error: "No text provided to copy." };
  }

  // 1. Try Modern Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err: any) {
      console.warn("navigator.clipboard failed, attempting textarea fallback...", err);
    }
  }

  // 2. Fallback to execCommand
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        return { success: true };
      }
    } catch (fallbackErr: any) {
      return {
        success: false,
        error: fallbackErr?.message || "Failed to copy via execCommand fallback.",
      };
    }
  }

  return {
    success: false,
    error: "Clipboard access is unavailable in this environment.",
  };
}
