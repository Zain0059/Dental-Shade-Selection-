import React, { useState, useEffect, useRef } from "react";
import { validateImageUpload, validateAiAnalysisResponse } from "./lib/validationSchemas";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, User, Hash, FileText, Activity } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { ToothCanvasViewer } from "./components/ToothCanvasViewer";
import { ColorMetricsPanel } from "./components/ColorMetricsPanel";
import { ZonalShadeMapping } from "./components/ZonalShadeMapping";
import { SubstratePreparationPanel } from "./components/SubstratePreparationPanel";
import { ClinicalChecklistModal } from "./components/ClinicalChecklistModal";
import { CameraSettingsDrawer } from "./components/CameraSettingsDrawer";
import { LabPrescriptionModal } from "./components/LabPrescriptionModal";
import { AiAnalysisDrawer } from "./components/AiAnalysisDrawer";
import { GuidedFlowWizard } from "./components/GuidedFlowWizard";
import { useCaseContext } from "./context/CaseContext";
import { CLINICAL_CASES } from "./lib/sampleCases";
import { ClinicalCase, RGBColor, CIELABColor } from "./types/dental";

export default function App() {
  const [showAdvancedPanels, setShowAdvancedPanels] = useState(false);
  const { state, dispatch, classicalMatches, threeDMatches, bleachMatches, zones } = useCaseContext();

  const systemMatches = state.activeSystemTab === "3d_master" ? threeDMatches : state.activeSystemTab === "bleach" ? bleachMatches : classicalMatches;
  const {
    currentCase,
    crossPolarized,
    customImage,
    isCalibrated,
    calibrationMultipliers,
    sampledPoint,
    sampledRgb,
    sampledLab,
    munsell,
    activeSystemTab,
    selectedMatch,
    activeZoneFilter,
    substrate,
    checklist,
    aiResult,
    aiError,
    isAiLoading,
    notification,
    caseSessionId,
  } = state;

  // Modals & Drawers
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isCameraGuideOpen, setIsCameraGuideOpen] = useState(false);
  const [isLabPrescriptionOpen, setIsLabPrescriptionOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch({ type: "CLEAR_NOTIFICATION" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  // Hydration protocol timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({
        type: "UPDATE_CHECKLIST",
        payload: { hydrationElapsedSeconds: checklist.hydrationElapsedSeconds + 1 },
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checklist.hydrationElapsedSeconds, dispatch]);

  const uploadToken = useRef(0);
  const sessionRef = useRef(caseSessionId);
  sessionRef.current = caseSessionId;
  const handleStartNewCase = () => { uploadToken.current++; dispatch({ type: "START_NEW_CASE" }); };

  // Handle Photo Upload with runtime validation
  const handleUploadClick = () => {
    const token = ++uploadToken.current;
    const session = caseSessionId;
    const replaceExistingPhoto = Boolean(state.customImage);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const validation = validateImageUpload(file);
        if (!validation.isValid) {
          dispatch({
            type: "SET_NOTIFICATION",
            payload: {
              type: "error",
              message: validation.errors[0] || "Invalid photograph file.",
            },
          });
          return;
        }

        const reader = new FileReader();
        reader.onerror = () => dispatch({ type: "SET_NOTIFICATION", payload: { type: "error", message: "Could not read photograph." } });
        reader.onload = (re) => {
          const image = new Image();
          image.onerror = () => dispatch({ type: "SET_NOTIFICATION", payload: { type: "error", message: "Cannot decode photograph." } });
          image.onload = () => {
          if (token !== uploadToken.current || session !== sessionRef.current) return;
          dispatch({
            type: replaceExistingPhoto ? "REPLACE_IMAGE_SUCCESS" : "UPLOAD_IMAGE_SUCCESS",
            payload: {
              imageBase64: re.target?.result as string,
              fileName: file.name,
              fileSizeBytes: file.size,
            },
          });
          };
          image.src = re.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Run AI Master Ceramist Analysis
  const handleRunAiAnalysis = async () => {
    if (!state.customImage || !state.sampledPoint) {
      dispatch({ type: "SET_NOTIFICATION", payload: { type: "error", message: "Upload a patient photograph and sample a tooth region before requesting AI analysis." } });
      return;
    }
    const requestId = "req_" + Math.random().toString(36).substring(2, 9);
    const sessionSnapshot = caseSessionId;

    dispatch({ type: "START_AI_REQUEST", payload: { requestId } });
    setIsAiDrawerOpen(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 55000);

    try {
      const targetCode = selectedMatch?.shade.code || systemMatches[0].shade.code;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/ai/analyze-tooth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          cielabData: sampledLab,
          munsellData: munsell,
          substrate: substrate.prepShade,
          restoration: substrate.restorationType,
          material: substrate.material,
          thickness: substrate.thicknessMm,
          targetShade: targetCode,
          zonalFindings: {
            cervical: zones.cervical.matchedClassical.shade.code,
            middle: zones.middle.matchedClassical.shade.code,
            incisal: zones.incisal.matchedClassical.shade.code,
          },
          hasPolarization: crossPolarized,
          clinicalNotes: currentCase.clinicalNotes,
          imageBase64: customImage,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("AI backend is unavailable. Static hosting needs a separately configured API server.");
      const data = await res.json();
      if (!res.ok || data.success !== true) throw new Error(data.error || `Server returned status ${res.status}`);
      const validation = validateAiAnalysisResponse(data);
      if (!validation.isValid) {
        throw new Error("AI returned an invalid response; no analysis was accepted.");
      }

      dispatch({
        type: "AI_REQUEST_SUCCESS",
        payload: {
          requestId,
          sessionId: sessionSnapshot,
          result: data,
        },
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      dispatch({ type: "AI_REQUEST_FAILURE", payload: { requestId, sessionId: sessionSnapshot,
        error: err.name === "AbortError" ? "AI analysis timed out. Retry when available." : err.message } });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white overflow-x-hidden w-full">
      {/* Navigation Bar */}
      <Navbar
        checklist={checklist}
        onOpenChecklist={() => setIsChecklistOpen(true)}
        onOpenLabPrescription={() => setIsLabPrescriptionOpen(true)}
        onOpenAiAnalysis={handleRunAiAnalysis}
        onOpenCameraGuide={() => setIsCameraGuideOpen(true)}
        onUploadClick={handleUploadClick}
        hasPatientPhoto={Boolean(state.customImage)}
        onStartNewCase={handleStartNewCase}
        isAiLoading={isAiLoading}
        showAdvancedPanels={showAdvancedPanels}
        onToggleAdvancedPanels={() => setShowAdvancedPanels(!showAdvancedPanels)}
      />

      {/* Main Clinical Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 min-w-0">
        {/* Case Notification Banner */}
        {notification && (
          <div
            id="case-notification-banner"
            className={`mb-4 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm border transition-all ${
              notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : notification.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-teal-50 border-teal-200 text-teal-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              {notification.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
              {notification.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
              {notification.type === "info" && <Info className="w-4 h-4 shrink-0 text-teal-600" />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => dispatch({ type: "CLEAR_NOTIFICATION" })}
              className="p-1 hover:opacity-75 text-neutral-400 hover:text-neutral-700 transition"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Clinical Case Header & Metadata Card */}
        <section className="mb-5 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-neutral-900">
                    Clinical Case Information
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Tooth #{currentCase.toothNumber.replace('#', '') || 'Unassigned'}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-500">
                    &bull; {currentCase.title}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Record verified patient details and clinical observations for the lab prescription.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                Session: {caseSessionId.slice(0, 16)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Patient identifier
                <input
                  aria-label="Patient identifier"
                  type="text"
                  placeholder="e.g. PT-1042 or Initials"
                  className="mt-1 block w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-medium placeholder:text-neutral-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                  value={currentCase.patientInitials}
                  onChange={e => dispatch({ type: "UPDATE_CASE_DETAILS", payload: { patientInitials: e.target.value } })}
                />
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-teal-600" />
                Tooth number
                <input
                  aria-label="Tooth number"
                  type="text"
                  placeholder="e.g. 11, 21, or #8"
                  className="mt-1 block w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-medium placeholder:text-neutral-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                  value={currentCase.toothNumber}
                  onChange={e => dispatch({ type: "UPDATE_CASE_DETAILS", payload: { toothNumber: e.target.value } })}
                />
              </label>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                Clinical notes
                <input
                  aria-label="Clinical notes"
                  type="text"
                  placeholder="Substrate notes, vital vs endo, desired incisal opalescence, halo effect..."
                  className="mt-1 block w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-medium placeholder:text-neutral-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                  value={currentCase.clinicalNotes}
                  onChange={e => dispatch({ type: "UPDATE_CASE_DETAILS", payload: { clinicalNotes: e.target.value } })}
                />
              </label>
            </div>
          </div>
        </section>

        {!showAdvancedPanels ? (
          <GuidedFlowWizard
            onOpenChecklistModal={() => setIsChecklistOpen(true)}
            onOpenCameraGuide={() => setIsCameraGuideOpen(true)}
            onUploadClick={handleUploadClick}
            onOpenAiAnalysis={handleRunAiAnalysis}
            onOpenLabPrescription={() => setIsLabPrescriptionOpen(true)}
            onStartNewCase={handleStartNewCase}
            hasPatientPhoto={Boolean(state.customImage)}
            childrenCanvas={
              <ToothCanvasViewer />
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Interactive Tooth Viewport */}
            <div className="lg:col-span-7 space-y-5">
              <ToothCanvasViewer />

              <ZonalShadeMapping />
            </div>

            {/* Right Column: Advanced panels */}
            <div className="lg:col-span-5 space-y-5">
              <ColorMetricsPanel />
              <SubstratePreparationPanel />
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ClinicalChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        checklist={checklist}
        onUpdateChecklist={(up) => dispatch({ type: "UPDATE_CHECKLIST", payload: up })}
      />

      <CameraSettingsDrawer
        isOpen={isCameraGuideOpen}
        onClose={() => setIsCameraGuideOpen(false)}
      />

      <LabPrescriptionModal
        isOpen={isLabPrescriptionOpen}
        onClose={() => setIsLabPrescriptionOpen(false)}
        currentCase={currentCase}
        targetMatch={selectedMatch || systemMatches[0]}
        sampledLab={sampledLab}
        munsell={munsell}
        zones={zones}
        substrate={substrate}
        crossPolarized={crossPolarized}
      />

      <AiAnalysisDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        isLoading={isAiLoading}
        result={aiResult}
        error={aiError}
        onReanalyze={handleRunAiAnalysis}
      />
    </div>
  );
}
