import React from "react";
import { X, Camera, Sliders, Layers, Sparkles, Check, Info } from "lucide-react";

interface CameraSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CameraSettingsDrawer: React.FC<CameraSettingsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="drawer-camera-settings"
        className="bg-white border border-neutral-300 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-6 text-neutral-900 shadow-2xl relative max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-neutral-200 flex items-center justify-center text-neutral-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Camera Acquisition Standards</h2>
              <p className="text-xs text-neutral-500">Standardized parameters for mobile dental photography</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Triad Parameters */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
            <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Shutter Speed</div>
            <div className="text-lg font-bold text-neutral-900 mt-1 font-mono">1/125 s</div>
            <p className="text-[10px] text-neutral-500 mt-1">Locks sync speed & eliminates motion blur</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
            <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Aperture</div>
            <div className="text-lg font-bold text-neutral-900 mt-1 font-mono">f / 22</div>
            <p className="text-[10px] text-neutral-500 mt-1">Maximum clinical depth of field</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-center">
            <div className="text-[11px] font-mono text-teal-600 uppercase tracking-wider">Sensor ISO</div>
            <div className="text-lg font-bold text-neutral-900 mt-1 font-mono">100 – 200</div>
            <p className="text-[10px] text-neutral-500 mt-1">Zero sensor noise / pure pixel CIELAB</p>
          </div>
        </div>

        {/* Cross-Polarization Guide */}
        <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-neutral-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-700">
            <Layers className="w-4 h-4 text-neutral-700" />
            <span>Dual Cross-Polarization Attachment</span>
          </div>
          <p className="text-neutral-600 leading-relaxed">
            Cross-polarizing filters mounted perpendicularly to the ring/twin flash eliminate all specular surface reflections (glare). This unmasks the internal mamelon architecture, dentin saturation, and enamel translucency.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-teal-600/20 text-[11px]">
            <div className="text-neutral-500">
              <strong className="text-neutral-800">Polarized ON:</strong> Colorimetry, internal mamelons, substrate match.
            </div>
            <div className="text-neutral-500">
              <strong className="text-neutral-800">Polarized OFF:</strong> Surface micro-texture, perikymata, gloss & luster.
            </div>
          </div>
        </div>

        {/* Achromatic Reference Card */}
        <div className="mt-3 p-3.5 rounded-xl bg-neutral-100 border border-neutral-300/60 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-teal-700">
            <Info className="w-4 h-4 text-teal-600" />
            <span>18% Neutral Gray Card / Color Master</span>
          </div>
          <p className="text-neutral-500">
            Always place the single-use gray reference tab adjacent to the target tooth in the same focal plane. The software engine uses this achromatic reference to normalize white point and exposure.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-sm shadow-neutral-900/20 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
