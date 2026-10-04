import React, { useState } from "react";
import { X, Camera, Smartphone, Layers, Info, HelpCircle, CheckCircle2, Sliders, Zap, SunMedium, Sparkles } from "lucide-react";

interface CameraSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "mobile" | "dslr";
}

export const CameraSettingsDrawer: React.FC<CameraSettingsDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = "mobile",
}) => {
  const [activeTab, setActiveTab] = useState<"mobile" | "dslr">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="drawer-camera-settings"
        className="bg-white border border-neutral-300 rounded-t-2xl sm:rounded-2xl max-w-xl w-full p-5 sm:p-6 text-neutral-900 shadow-2xl relative max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-200 flex items-center justify-center text-teal-700">
              {activeTab === "mobile" ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Camera Acquisition Standards</h2>
              <p className="text-xs text-neutral-500">Clinical photography &amp; flash protocols for shade matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Mobile vs DSLR */}
        <div className="mt-4 flex p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab("mobile")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === "mobile"
                ? "bg-white text-teal-800 shadow-sm border border-neutral-200/80"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Smartphone / Mobile (Most Common)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dslr")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === "dslr"
                ? "bg-white text-teal-800 shadow-sm border border-neutral-200/80"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>DSLR / Mirrorless (f/22 &amp; Twin Flash)</span>
          </button>
        </div>

        {/* Universal Flash & Two-Shot Rule Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-teal-900">
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Should You Use Flash on Every Shot?</span>
          </div>
          <p className="text-teal-950 leading-relaxed">
            <strong>Yes! Always use flash.</strong> Never rely on operatory dental chair lamps or ambient room lights—their warm color casts (~3000K–4200K) and flickering distort CIELAB tooth color. A dedicated flash provides pure <strong>5500K D65 daylight</strong> balance and freezes motion.
          </p>
          <div className="pt-2 border-t border-teal-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-teal-900">
            <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
              <strong className="text-teal-950 block mb-0.5">Shot 1: Polarized Flash (For Shade)</strong>
              Eliminates surface glare. Shows true internal dentin chroma &amp; mamelons for this app.
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
              <strong className="text-teal-950 block mb-0.5">Shot 2: Non-Polarized Flash (For Lab)</strong>
              Shows surface micro-texture, perikymata, and natural enamel gloss for the ceramist.
            </div>
          </div>
        </div>

        {activeTab === "mobile" ? (
          <div className="mt-4 space-y-4">
            {/* Direct Answer to "Can't find f/22 on mobile" */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-[13px]">
                    Can&apos;t find &ldquo;f / 22&rdquo; on your mobile? That is normal!
                  </h4>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    Smartphone cameras use <strong>fixed physical aperture lenses</strong> (usually f/1.6 – f/2.4) with no mechanical iris blades. <strong>f/22 does not exist on mobile phones</strong>.
                  </p>
                  <p className="text-amber-800 mt-1.5 leading-relaxed">
                    <strong>Why you do not need f/22:</strong> Because smartphone image sensors are tiny with short focal lengths (5–9mm), a mobile camera at f/1.8 naturally provides the same deep depth-of-field as f/11–f/16 on a full-frame camera. The entire tooth is already in complete focus!
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Flash Advice */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Mobile Phone Flash Strategy</span>
              </div>
              <ul className="space-y-1.5 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                  <span><strong>Do NOT use the phone&apos;s built-in LED flash:</strong> It is a tiny point-source that creates harsh, blown-out white glare spots and uneven illumination.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold shrink-0">&bull;</span>
                  <span><strong>Best option:</strong> Use a Mobile Dental Photography (MDP) light (like Smile Lite MDP) with dual side LED lights and cross-polarizing filters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold shrink-0">&bull;</span>
                  <span><strong>No MDP light available?</strong> Turn off the warm dental chair lamp. Use diffused clinic lighting, and place an <strong>18% neutral gray card</strong> next to the tooth. Use our &ldquo;Calibrate 18% Gray&rdquo; tool to mathematically correct the color!</span>
                </li>
              </ul>
            </div>

            {/* Mobile Recommended Settings Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <div className="text-[10px] font-mono text-teal-700 uppercase tracking-wider">Aperture</div>
                <div className="text-base font-bold text-neutral-900 mt-1 font-mono">Fixed (Auto)</div>
                <p className="text-[10px] text-neutral-500 mt-1">Native f/1.8–f/2.4 gives deep DoF automatically</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <div className="text-[10px] font-mono text-teal-700 uppercase tracking-wider">Optical Zoom</div>
                <div className="text-base font-bold text-teal-700 mt-1 font-mono">2× or 3×</div>
                <p className="text-[10px] text-neutral-500 mt-1">Step back 25–30 cm; eliminates barrel distortion</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <div className="text-[10px] font-mono text-teal-700 uppercase tracking-wider">Pro Mode ISO</div>
                <div className="text-base font-bold text-neutral-900 mt-1 font-mono">50 – 100</div>
                <p className="text-[10px] text-neutral-500 mt-1">Lowest native ISO removes pixel noise</p>
              </div>
            </div>

            {/* Step-by-Step Mobile Clinical Protocol */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-[13px]">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>What to do on your mobile (Step-by-Step):</span>
              </div>

              <ul className="space-y-2.5 text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900">1. Switch to 2× or 3× Optical Telephoto lens:</strong> Never hold your phone 5 cm away using the 1× wide-angle lens. That causes &ldquo;fish-eye&rdquo; barrel distortion that bulges the central incisors. Stand back 25–30 cm and zoom 2× or 3×.
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900">2. Turn OFF Portrait Mode &amp; Beauty Filters:</strong> Artificial portrait bokeh blurs tooth incisal edges and embrasures. Beauty or AI scene filters alter tooth chroma and value. Shoot in normal Photo or Pro mode.
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900">3. Lock Focus &amp; Exposure (AE/AF Lock):</strong> Tap and hold the middle third of the tooth until the yellow/white square locks. Slide exposure slightly down if tooth highlights are clipping.
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900">4. Use an 18% Neutral Gray Card:</strong> Hold an 18% gray card or dental reference card on the same plane as the tooth. When you upload to this app, click &ldquo;Calibrate 18% Gray&rdquo; to automatically neutralize mobile sensor color cast and exposure differences!
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Twin Flash vs Ring Flash Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>Twin Flash (Recommended)</span>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  <strong>The Gold Standard for Anterior Shade Matching.</strong> Two flashes positioned at 45° cast oblique light that highlights developmental lobes, transitional line angles, and 3D surface micro-texture without washing out the center of the tooth.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <SunMedium className="w-4 h-4 text-neutral-600" />
                  <span>Ring Flash (Alternative)</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Excellent for posterior quadrants, occlusal arches, and deep cavity documentation where cheek shadows interfere. However, it casts flat frontal light that can mask anterior tooth anatomy and create harsh central glare.
                </p>
              </div>
            </div>

            {/* DSLR Camera Triad Parameters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
                <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Shutter Speed</div>
                <div className="text-lg font-bold text-neutral-900 mt-1 font-mono">1/125 s</div>
                <p className="text-[10px] text-neutral-500 mt-1">Locks sync speed &amp; eliminates motion blur</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
                <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Aperture</div>
                <div className="text-lg font-bold text-teal-700 mt-1 font-mono">f / 22</div>
                <p className="text-[10px] text-neutral-500 mt-1">Maximum clinical depth of field (macro)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
                <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Sensor ISO</div>
                <div className="text-lg font-bold text-neutral-900 mt-1 font-mono">100 – 200</div>
                <p className="text-[10px] text-neutral-500 mt-1">Zero sensor noise / pure pixel CIELAB</p>
              </div>
            </div>

            {/* Lens and Flash setup */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>DSLR / Mirrorless Clinical Hardware Specs</span>
              </div>
              <ul className="space-y-1.5 text-neutral-600 list-disc pl-4">
                <li><strong className="text-neutral-800">Lens:</strong> 100mm or 105mm dedicated Macro lens locked at 1:1 or 1:1.5 magnification ratio.</li>
                <li><strong className="text-neutral-800">Flash:</strong> Dental Twin Flash with bouncers/diffusers at 45° angle to the tooth.</li>
                <li><strong className="text-neutral-800">White Balance:</strong> Set to Flash (~5500K D65 daylight standard).</li>
              </ul>
            </div>

            {/* Cross-Polarization Guide */}
            <div className="p-4 rounded-xl bg-blue-950/10 border border-blue-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-800">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Dual Cross-Polarization Attachment</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Cross-polarizing filters mounted perpendicularly to the ring/twin flash eliminate all specular surface reflections (glare). This unmasks the internal mamelon architecture, dentin saturation, and enamel translucency.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-200 text-[11px]">
                <div className="text-neutral-600">
                  <strong className="text-neutral-800">Polarized ON:</strong> Colorimetry, internal mamelons, substrate match.
                </div>
                <div className="text-neutral-600">
                  <strong className="text-neutral-800">Polarized OFF:</strong> Surface micro-texture, perikymata, gloss &amp; luster.
                </div>
              </div>
            </div>

            {/* Achromatic Reference Card */}
            <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-teal-700">
                <Info className="w-4 h-4 text-teal-600" />
                <span>18% Neutral Gray Card / Color Master</span>
              </div>
              <p className="text-neutral-500">
                Always place the single-use gray reference tab adjacent to the target tooth in the same focal plane. The software engine uses this achromatic reference to normalize white point and exposure.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-between items-center">
          <p className="text-[11px] text-neutral-500">
            {activeTab === "mobile" 
              ? "Tip: Use 18% Gray Card calibration for high mobile accuracy." 
              : "Tip: Twin flash at 45° creates 3D depth and prevents flat lighting."}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-sm shadow-neutral-900/20 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
