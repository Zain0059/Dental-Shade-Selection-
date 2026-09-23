import { CaseState } from '../store/caseStore';
import { ShadeMatchResult, ToothZone, ZoneData } from '../types/dental';
import { isChecklistComplete } from './validationSchemas';

export function exportReadiness(state: CaseState, match: ShadeMatchResult): string | null {
  if (!state.currentCase.patientInitials.trim() || !state.currentCase.toothNumber.trim()) return 'Enter patient identifier and tooth number before exporting.';
  if (!state.sampledPoint || !match.isMeasurable) return 'Sample a tooth region before exporting.';
  return null;
}

export function buildCaseReport(state: CaseState, match: ShadeMatchResult, zones: Record<ToothZone, ZoneData>) {
  return {
    schemaVersion: 2, timestamp: new Date().toISOString(),
    source: state.customImage ? 'patient_photograph' : 'illustrated_demo',
    patient: state.currentCase.patientInitials, tooth: state.currentCase.toothNumber,
    clinicalNotes: state.currentCase.clinicalNotes,
    image: state.customImageMeta,
    selectedShade: { code: match.isMeasurable ? match.shade.code : null, system: match.shade.system,
      deltaE00: Number.isFinite(match.deltaE00) ? match.deltaE00 : null,
      similarityIndex: match.isMeasurable ? match.matchSimilarityScore : null, status: match.trafficLight },
    sampledCoordinates: state.sampledPoint ? { point: state.sampledPoint, rgb: state.sampledRgb, cielab: state.sampledLab } : null,
    zones: Object.fromEntries((['cervical', 'middle', 'incisal'] as ToothZone[]).map(key => [key,
      zones[key].isMeasured ? { measured: true, point: state.zoneSamples[key]?.point, rgb: zones[key].sampledRgb,
        cielab: zones[key].sampledLab, shade: zones[key].matchedClassical.shade.code,
        deltaE00: zones[key].matchedClassical.deltaE00 } : { measured: false }])),
    restorationConfig: state.substrate,
    capture: { grayReferenceApplied: state.isCalibrated, calibrationMultipliers: state.isCalibrated ? state.calibrationMultipliers : null,
      crossPolarizationReportedByUser: state.crossPolarized, checklist: state.checklist,
      protocolReportedComplete: isChecklistComplete(state.checklist) },
    limitations: 'Image-based shade estimate; camera/profile and reference shade dataset are not clinically validated here. Unmeasured zones remain unknown. Translucency, morphology and firing schedules are not measured by this report.',
  };
}

export function buildCaseReportText(state: CaseState, match: ShadeMatchResult, zones: Record<ToothZone, ZoneData>): string {
  const report = buildCaseReport(state, match, zones);
  return [
    'DENTAL SHADE REPORT',
    `Source: ${report.source === 'illustrated_demo' ? 'ILLUSTRATED DEMO — NOT A PATIENT MEASUREMENT' : 'Patient photograph'}`,
    `Patient: ${report.patient || 'Not entered'} | Tooth: ${report.tooth || 'Not entered'}`,
    `Target shade: ${report.selectedShade.code || 'Not measured'} (${match.shade.system})`,
    `Delta E00: ${report.selectedShade.deltaE00 ?? 'N/A'} | Proximity index: ${report.selectedShade.similarityIndex ?? 'N/A'} (not confidence)`,
    ...(['cervical', 'middle', 'incisal'] as ToothZone[]).map(key => {
      const z = zones[key];
      return z.isMeasured ? `${key}: ${z.matchedClassical.shade.code}; L* ${z.sampledLab.L.toFixed(1)}, a* ${z.sampledLab.a.toFixed(1)}, b* ${z.sampledLab.b.toFixed(1)}; Delta E00 ${z.matchedClassical.deltaE00.toFixed(2)}` : `${key}: Not measured`;
    }),
    `Material: ${state.substrate.material}; preparation: ${state.substrate.prepShade}; thickness: ${state.substrate.thicknessMm} mm`,
    `Gray reference applied: ${state.isCalibrated ? 'Yes' : 'No'}`,
    `Cross-polarized capture reported by user: ${state.crossPolarized ? 'Yes' : 'Not confirmed'}`,
    `Protocol checklist reported complete: ${report.capture.protocolReportedComplete ? 'Yes' : 'No'}`,
    'Color conversion assumes sRGB/D65. Actual capture illuminant has not been measured.',
    `Clinical notes: ${state.currentCase.clinicalNotes || 'None entered'}`,
    'Ceramic formulation and firing: confirm material-specific manufacturer instructions with the ceramist.',
    report.limitations,
  ].join('\n');
}
