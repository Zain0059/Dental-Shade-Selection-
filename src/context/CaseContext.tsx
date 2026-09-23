import React, { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { CaseState, CaseAction, caseReducer, createInitialState } from "../store/caseStore";
import { CLINICAL_CASES } from "../lib/sampleCases";
import { ZoneData, ShadeMatchResult, ToothZone } from "../types/dental";
import { findClosestShades, translateLabToMunsell, applyCalibration, sRGBToCIELAB } from "../lib/colorScience";
import { VITA_CLASSICAL_SHADES, VITA_3D_MASTER_SHADES, BLEACH_SHADES } from "../lib/dentalShadesData";

interface CaseContextValue {
  state: CaseState;
  dispatch: React.Dispatch<CaseAction>;
  classicalMatches: ShadeMatchResult[];
  threeDMatches: ShadeMatchResult[];
  bleachMatches: ShadeMatchResult[];
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
}

const CaseContext = createContext<CaseContextValue | undefined>(undefined);

export function deriveZones(state: CaseState): Record<ToothZone, ZoneData> {
  return Object.fromEntries(
    (["cervical", "middle", "incisal"] as ToothZone[]).map((zone, index) => {
      const sample = state.zoneSamples[zone];
      const rgb = sample ? (state.isCalibrated ? applyCalibration(sample.rawRgb, state.calibrationMultipliers) : sample.rawRgb)
        : { r: NaN, g: NaN, b: NaN, hex: "transparent" };
      const lab = sRGBToCIELAB(rgb.r, rgb.g, rgb.b);
      return [zone, { zone, label: `${zone[0].toUpperCase()}${zone.slice(1)} third`,
        description: sample ? "Measured from a manually selected image region." : "Not measured — select this zone, then click its location in the photo.",
        relativeYRange: [index / 3, (index + 1) / 3], sampledLab: lab, sampledRgb: rgb,
        munsell: translateLabToMunsell(lab), matchedClassical: findClosestShades(lab, VITA_CLASSICAL_SHADES, 1)[0],
        matched3D: findClosestShades(lab, VITA_3D_MASTER_SHADES, 1)[0], isMeasured: !!sample,
        translucencyIndex: null, opticalCharacteristics: ["Translucency and morphology not measured"] }];
    })
  ) as Record<ToothZone, ZoneData>;
}

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(caseReducer, undefined, () =>
    createInitialState(CLINICAL_CASES[0])
  );

  const { sampledLab, sampledRgb, munsell } = state;

  const classicalMatches = useMemo(() => {
    return findClosestShades(sampledLab, VITA_CLASSICAL_SHADES, 4);
  }, [sampledLab]);

  const threeDMatches = useMemo(() => {
    return findClosestShades(sampledLab, VITA_3D_MASTER_SHADES, 4);
  }, [sampledLab]);

  const bleachMatches = useMemo(() => {
    return findClosestShades(sampledLab, BLEACH_SHADES, 4);
  }, [sampledLab]);

  const zones = useMemo(() => deriveZones(state), [state.zoneSamples, state.isCalibrated, state.calibrationMultipliers]);

  return (
    <CaseContext.Provider value={{ state, dispatch, classicalMatches, threeDMatches, bleachMatches, zones }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = (): CaseContextValue => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCaseContext must be used within a CaseProvider");
  }
  return context;
};
