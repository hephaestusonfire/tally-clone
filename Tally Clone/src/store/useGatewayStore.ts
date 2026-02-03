import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LineColorSettings {
  highlightColor: string;
  selectionBarColor: string;
}

interface GatewayState {
  isDateModalOpen: boolean;
  isLineColorModalOpen: boolean;
  lineColorSettings: LineColorSettings;
  openDateModal: () => void;
  closeDateModal: () => void;
  openLineColorModal: () => void;
  closeLineColorModal: () => void;
  setLineColorSettings: (s: Partial<LineColorSettings>) => void;
  applyLineColors: () => void;
}

const defaultLineColors: LineColorSettings = {
  highlightColor: '#FEE2E2',
  selectionBarColor: '#DC2626',
};

export const useGatewayStore = create<GatewayState>()(
  persist(
    (set, get) => ({
      isDateModalOpen: false,
      isLineColorModalOpen: false,
      lineColorSettings: defaultLineColors,

      openDateModal: () => set({ isDateModalOpen: true }),
      closeDateModal: () => set({ isDateModalOpen: false }),
      openLineColorModal: () => set({ isLineColorModalOpen: true }),
      closeLineColorModal: () => set({ isLineColorModalOpen: false }),

      setLineColorSettings: (partial) =>
        set((s) => ({
          lineColorSettings: { ...s.lineColorSettings, ...partial },
        })),

      applyLineColors: () => {
        const { highlightColor, selectionBarColor } = get().lineColorSettings;
        document.documentElement.style.setProperty('--tally-highlight', highlightColor);
        document.documentElement.style.setProperty('--tally-selection-bar', selectionBarColor);
      },
    }),
    {
      name: 'tally-gateway',
      partialize: (s) => ({ lineColorSettings: s.lineColorSettings }),
    }
  )
);
