import { isChecklistComplete } from "../lib/validationSchemas";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, RotateCcw } from "lucide-react";
import { Step1Capture } from "./wizard/Step1Capture";
import { Step2SelectShade } from "./wizard/Step2SelectShade";
import { Step3ExportOrder } from "./wizard/Step3ExportOrder";
import { useCaseContext } from "../context/CaseContext";
import { CaseHeaderBar } from "./CaseHeaderBar";
import { CLINICAL_CASES } from "../lib/sampleCases";

interface GuidedFlowWizardProps {
  onOpenChecklistModal: () => void;
  onOpenCameraGuide: () => void;
  onUploadClick: () => void;
  onOpenAiAnalysis: () => void;
  onOpenLabPrescription: () => void;
  onStartNewCase?: () => void;
  childrenCanvas: React.ReactNode;
}

export const GuidedFlowWizard: React.FC<GuidedFlowWizardProps> = ({
  onOpenChecklistModal,
  onOpenCameraGuide,
  onUploadClick,
  onOpenAiAnalysis,
  onOpenLabPrescription,
  onStartNewCase,
  childrenCanvas,
}) => {
  const { state, dispatch, classicalMatches, threeDMatches, bleachMatches, zones } = useCaseContext();
  const systemMatches = state.activeSystemTab === "3d_master" ? threeDMatches : state.activeSystemTab === "bleach" ? bleachMatches : classicalMatches;
  const {
    currentCase,
    crossPolarized,
    sampledLab,
    sampledRgb,
    selectedMatch,
    substrate,
    checklist,
    isAiLoading,
    activeZoneFilter,
  } = state;

  const topMatch = selectedMatch || systemMatches[0];
  const allClassicalMatches = systemMatches;
  const threeDMatch = threeDMatches[0];
  
  const cases = CLINICAL_CASES;

  const onSelectCase = (c: any) => dispatch({ type: "LOAD_CASE", payload: { caseItem: c } });
  const onTogglePolarized = () => dispatch({ type: "TOGGLE_POLARIZATION" });
  const onChangeSubstrate = (updated: any) => dispatch({ type: "UPDATE_SUBSTRATE", payload: updated });
  const onSelectShade = (match: any) => dispatch({ type: "SELECT_SHADE", payload: match });
  const onUpdateChecklist = (updated: any) => dispatch({ type: "UPDATE_CHECKLIST", payload: updated });
  const onSelectZoneFilter = (zone: any) => dispatch({ type: "SET_ZONE_FILTER", payload: zone });

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  useEffect(() => setCurrentStep(1), [state.caseSessionId]);

  const handleStartNewCase = () => {
    setCurrentStep(1);
    if (onStartNewCase) {
      onStartNewCase();
    }
  };

  const allChecklistPassed = isChecklistComplete(checklist);

  return (
    <div className="space-y-4 pb-20 w-full min-w-0">
      <CaseHeaderBar />

      {/* 3-Step Guided Progress Header (Compact & Equal Width) */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        {[
          { num: 1, label: "Capture" },
          { num: 2, label: "Match" },
          { num: 3, label: "Review" },
        ].map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num as any)}
              className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl border transition ${
                isCurrent
                  ? "bg-teal-50 border-teal-600 shadow-sm"
                  : isCompleted
                  ? "bg-neutral-50 border-neutral-300 hover:bg-neutral-100"
                  : "bg-white border-neutral-200 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-teal-600 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                </div>
                <span className={`text-[11px] font-bold ${isCurrent ? "text-teal-800" : isCompleted ? "text-neutral-700" : "text-neutral-500"}`}>
                  {step.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {currentStep === 1 && (
        <Step1Capture
          currentCase={currentCase}
          cases={cases}
          onSelectCase={onSelectCase}
          crossPolarized={crossPolarized}
          onTogglePolarized={onTogglePolarized}
          checklist={checklist}
          onUpdateChecklist={onUpdateChecklist}
          onUploadClick={onUploadClick}
          onOpenCameraGuide={onOpenCameraGuide}
          sampledRgb={sampledRgb}
          topMatch={topMatch}
          childrenCanvas={childrenCanvas}
          onNextStep={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <Step2SelectShade
          sampledRgb={sampledRgb}
          topMatch={topMatch}
          allClassicalMatches={allClassicalMatches}
          threeDMatch={threeDMatch}
          zones={zones}
          substrate={substrate}
          onChangeSubstrate={onChangeSubstrate}
          onSelectShade={onSelectShade}
          onOpenAiAnalysis={onOpenAiAnalysis}
          isAiLoading={isAiLoading}
          activeZoneFilter={activeZoneFilter}
          onSelectZoneFilter={onSelectZoneFilter}
          childrenCanvas={childrenCanvas}
          onPrevStep={() => setCurrentStep(1)}
          onNextStep={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <Step3ExportOrder
          currentCase={currentCase}
          substrate={substrate}
          topMatch={topMatch}
          threeDMatch={threeDMatch}
          zones={zones}
          sampledLab={sampledLab}
          sampledRgb={sampledRgb}
          crossPolarized={crossPolarized}
          allChecklistPassed={allChecklistPassed}
          onOpenLabPrescription={onOpenLabPrescription}
          onOpenAiAnalysis={onOpenAiAnalysis}
          isAiLoading={isAiLoading}
          aiResult={state.aiResult}
          isAiRecipeStale={state.isAiRecipeStale}
          childrenCanvas={childrenCanvas}
          onStartNewCase={handleStartNewCase}
          onPrevStep={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
};
