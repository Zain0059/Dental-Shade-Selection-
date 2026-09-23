import { isChecklistComplete } from "../lib/validationSchemas";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, RotateCcw } from "lucide-react";
import { Step1Capture } from "./wizard/Step1Capture";
import { Step2SelectShade } from "./wizard/Step2SelectShade";
import { Step3ExportOrder } from "./wizard/Step3ExportOrder";
import { useCaseContext } from "../context/CaseContext";
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
    <div className="space-y-6">
      {/* 3-Step Guided Progress Header */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          {/* Stepper Tabs */}
          <div className="flex items-center w-full sm:w-auto overflow-x-auto no-scrollbar justify-between sm:justify-start gap-1.5 sm:gap-3 py-0.5">
            {/* Step 1 */}
            <button
              id="step-tab-1"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition border shrink-0 ${
                currentStep === 1
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : currentStep > 1
                  ? "bg-neutral-100 text-emerald-600 border-emerald-500/30"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 1 ? "bg-neutral-50 text-teal-700" : currentStep > 1 ? "bg-emerald-500/20 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
              </div>
              <span className="hidden sm:inline">Step 1: Capture &amp; Align</span>
              <span className="sm:hidden">1. Capture</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />

            {/* Step 2 */}
            <button
              id="step-tab-2"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition border shrink-0 ${
                currentStep === 2
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : currentStep > 2
                  ? "bg-neutral-100 text-emerald-600 border-emerald-500/30"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 2 ? "bg-neutral-50 text-teal-700" : currentStep > 2 ? "bg-emerald-500/20 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
              </div>
              <span className="hidden sm:inline">Step 2: Select Shade</span>
              <span className="sm:hidden">2. Shade</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />

            {/* Step 3 */}
            <button
              id="step-tab-3"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition border shrink-0 ${
                currentStep === 3
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 3 ? "bg-neutral-50 text-teal-700" : "bg-neutral-100 text-neutral-500"
              }`}>
                3
              </div>
              <span className="hidden sm:inline">Step 3: Export &amp; Order</span>
              <span className="sm:hidden">3. Export</span>
            </button>
          </div>

          {/* Quick Flow Navigator */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                id="btn-next-step"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-restart-flow"
                onClick={handleStartNewCase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold transition border border-neutral-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Case Flow</span>
              </button>
            )}
          </div>
        </div>
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
          onStartNewCase={handleStartNewCase}
          onPrevStep={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
};
