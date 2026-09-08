import { ZONE_OFFSETS } from "./src/lib/colorScience";

export function testZonalMathExtraction() {
  const results = [];
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
