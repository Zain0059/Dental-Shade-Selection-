import React from "react";
import { Layers, Sparkles, Sun, Eye, Droplet, ArrowUpRight } from "lucide-react";
import { ZoneData } from "../types/dental";

interface ZonalShadeMappingProps {
  zones: {
    cervical: ZoneData;
    middle: ZoneData;
    incisal: ZoneData;
  };
  onSelectZone: (zone: "cervical" | "middle" | "incisal") => void;
  activeZone: "cervical" | "middle" | "incisal" | "all";
}

export const ZonalShadeMapping: React.FC<ZonalShadeMappingProps> = ({
  zones,
  onSelectZone,
  activeZone,
}) => {
  const zoneList = [
    { key: "cervical" as const, data: zones.cervical, tag: "Warm Chroma", icon: Sun, color: "border-amber-500/40 text-amber-300" },
    { key: "middle" as const, data: zones.middle, tag: "True Base Shade", icon: Layers, color: "border-cyan-500/40 text-cyan-300" },
    { key: "incisal" as const, data: zones.incisal, tag: "Translucency & Opalescence", icon: Sparkles, color: "border-blue-500/40 text-blue-300" },
  ];

  return (
    <div id="zonal-mapping-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            3-Zone Anatomical Shade Mapping
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Cervical &bull; Body &bull; Incisal
        </span>
      </div>

      {/* 3 Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {zoneList.map(({ key, data, tag, icon: Icon, color }) => {
          const isSelected = activeZone === key;

          return (
            <div
              key={key}
              onClick={() => onSelectZone(key)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                  : "bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              {/* Zone Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {data.label}
                  </span>
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${color} bg-slate-900/60`}>
                    {tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{data.description}</p>
              </div>

              {/* Sampled Swatch & Matched Shades */}
              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: data.sampledRgb.hex }}
                    />
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      {data.matchedClassical.shade.code} / {data.matched3D.shade.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ΔE₀₀ {data.matchedClassical.deltaE00.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center pt-2 border-t border-slate-800 text-slate-400">
                  <div>L*: <strong className="text-slate-200">{data.sampledLab.L.toFixed(1)}</strong></div>
                  <div>a*: <strong className="text-slate-200">{data.sampledLab.a.toFixed(1)}</strong></div>
                  <div>b*: <strong className="text-slate-200">{data.sampledLab.b.toFixed(1)}</strong></div>
                </div>
              </div>

              {/* Optical Features Tags */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Translucency Index:</span>
                  <span className="font-mono font-bold text-cyan-300">{data.translucencyIndex}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-cyan-400 to-blue-500 h-full rounded-full"
                    style={{ width: `${data.translucencyIndex}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.opticalCharacteristics.map((char, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
