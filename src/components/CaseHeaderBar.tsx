import React from "react";
import { useCaseContext } from "../context/CaseContext";

export const CaseHeaderBar: React.FC = () => {
  const { state, dispatch } = useCaseContext();
  const { currentCase, caseScope } = state;

  return (
    <div className="flex items-center justify-between gap-3 w-full pb-1 border-b border-neutral-200">
      <div>
        <h2 className="text-[13px] font-bold text-neutral-900">
          Tooth {currentCase.toothNumber.replace('#', '')} · {currentCase.title}
        </h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          {caseScope === "quick" ? "Quick Match" : "Full Case"} · Saved locally
        </p>
      </div>
      <div>
        <select
          value={caseScope}
          onChange={(e) => dispatch({ type: "SET_CASE_SCOPE", payload: e.target.value as "quick" | "full" })}
          className="bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium cursor-pointer hover:bg-neutral-200 transition"
        >
          <option value="quick">Quick Match</option>
          <option value="full">Full Case</option>
        </select>
      </div>
    </div>
  );
};

