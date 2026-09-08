import React, { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { CaseState, CaseAction, caseReducer, createInitialState } from "../store/caseStore";
import { CLINICAL_CASES } from "../lib/sampleCases";
import { ZoneData, ShadeMatchResult } from "../types/dental";
import { findClosestShades, translateLabToMunsell, ZONE_OFFSETS } from "../lib/colorScience";
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

  const zones: { cervical: ZoneData; middle: ZoneData; incisal: ZoneData } = useMemo(() => {
    const cervLab = {
      L: Math.max(0, sampledLab.L + ZONE_OFFSETS.cervical.dL),
      a: sampledLab.a + ZONE_OFFSETS.cervical.da,
      b: sampledLab.b + ZONE_OFFSETS.cervical.db,
    };
    const cervClassical = findClosestShades(cervLab, VITA_CLASSICAL_SHADES, 1)[0];
    const cerv3D = findClosestShades(cervLab, VITA_3D_MASTER_SHADES, 1)[0];

    const midClassical = classicalMatches[0];
    const mid3D = threeDMatches[0];

    const incLab = {
      L: Math.min(100, sampledLab.L + ZONE_OFFSETS.incisal.dL),
      a: sampledLab.a + ZONE_OFFSETS.incisal.da,
      b: Math.max(2, sampledLab.b + ZONE_OFFSETS.incisal.db),
    };
    const incClassical = findClosestShades(incLab, VITA_CLASSICAL_SHADES, 1)[0];
    const inc3D = findClosestShades(incLab, VITA_3D_MASTER_SHADES, 1)[0];

    return {
      cervical: {
        zone: "cervical",
        label: "Cervical Third (Gingival)",
        description: ZONE_OFFSETS.cervical.description,
        relativeYRange: [0.0, 0.33],
        sampledLab: cervLab,
        sampledRgb: { r: 215, g: 178, b: 117, hex: "#d7b275" },
        munsell: translateLabToMunsell(cervLab),
        matchedClassical: cervClassical,
        matched3D: cerv3D,
        translucencyIndex: 22,
        opticalCharacteristics: ZONE_OFFSETS.cervical.opticalCharacteristics,
      },
      middle: {
        zone: "middle",
        label: "Middle Third (Body)",
        description: "Core tooth base shade, maximum aesthetic relevance and value reference.",
        relativeYRange: [0.33, 0.66],
        sampledLab,
        sampledRgb,
        munsell,
        matchedClassical: midClassical,
        matched3D: mid3D,
        translucencyIndex: 58,
        opticalCharacteristics: ["Dominant Aesthetic Value", "Base Body Dentin", "Balanced Chroma"],
      },
      incisal: {
        zone: "incisal",
        label: "Incisal Third (Edge)",
        description: ZONE_OFFSETS.incisal.description,
        relativeYRange: [0.66, 1.0],
        sampledLab: incLab,
        sampledRgb: { r: 228, g: 218, b: 192, hex: "#e4dac0" },
        munsell: translateLabToMunsell(incLab),
        matchedClassical: incClassical,
        matched3D: inc3D,
        translucencyIndex: 88,
        opticalCharacteristics: ZONE_OFFSETS.incisal.opticalCharacteristics,
      },
    };
  }, [sampledLab, sampledRgb, munsell, classicalMatches, threeDMatches]);

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
