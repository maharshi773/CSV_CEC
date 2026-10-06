import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_INPUTS, type CostInputs } from "@/lib/costing";

type CostStore = {
  inputs: CostInputs;
  setInput: <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => void;
  patch: (partial: Partial<CostInputs>) => void;
  reset: () => void;
};

export const useCostStore = create<CostStore>()(
  persist(
    (set) => ({
      inputs: DEFAULT_INPUTS,
      setInput: (key, value) =>
        set((s) => ({ inputs: { ...s.inputs, [key]: value } })),
      patch: (partial) =>
        set((s) => ({ inputs: { ...s.inputs, ...partial } })),
      reset: () => set({ inputs: DEFAULT_INPUTS }),
    }),
    { name: "core-plug-cost-sheet-v1", skipHydration: true },
  ),
);
