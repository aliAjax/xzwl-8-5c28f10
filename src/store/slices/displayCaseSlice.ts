import type { StateCreator } from 'zustand';
import type {
  StoreState,
  ViewMode,
  DisplayCaseCapacityData,
  SaleStatus,
} from '@/types';
import { DEFAULT_CAPACITY_LIMIT } from '../constants';
import { persistDisplayCaseCapacities } from '../storage';

export interface DisplayCaseSlice {
  viewMode: ViewMode;
  isCapacityPlannerOpen: boolean;
  setViewMode: (mode: ViewMode) => void;
  openCapacityPlanner: () => void;
  closeCapacityPlanner: () => void;
  setDisplayCaseCapacity: (displayCase: string, capacityLimit: number) => void;
  getDisplayCaseCapacityData: (useSimulation?: boolean) => DisplayCaseCapacityData[];
}

export const createDisplayCaseSlice: StateCreator<StoreState, [], [], DisplayCaseSlice> = (set, get) => ({
  viewMode: 'list' as ViewMode,
  isCapacityPlannerOpen: false,

  setViewMode: (mode: ViewMode) =>
    set({ viewMode: mode }),

  openCapacityPlanner: () =>
    set({ isCapacityPlannerOpen: true }),

  closeCapacityPlanner: () =>
    set({ isCapacityPlannerOpen: false }),

  setDisplayCaseCapacity: (displayCase: string, capacityLimit: number) =>
    set((state) => {
      const newCapacities = {
        ...state.displayCaseCapacities,
        [displayCase]: { capacityLimit },
      };
      persistDisplayCaseCapacities(newCapacities);
      return {
        displayCaseCapacities: newCapacities,
      };
    }),

  getDisplayCaseCapacityData: (useSimulation = false): DisplayCaseCapacityData[] => {
    const { meteorites, displayCaseCapacities, caseSimulation } = get();
    const dataSource = useSimulation && caseSimulation.isSimulating
      ? caseSimulation.simulatedMeteorites
      : meteorites;
    const allCases = new Set<string>();
    dataSource.forEach(m => allCases.add(m.displayCase));
    Object.keys(displayCaseCapacities).forEach(c => allCases.add(c));
    const displayCases = Array.from(allCases).sort();

    return displayCases.map(dc => {
      const items = dataSource.filter(m => m.displayCase === dc);
      const totalWeight = items.reduce((sum, m) => sum + m.weight, 0);
      const capacityLimit = displayCaseCapacities[dc]?.capacityLimit ?? DEFAULT_CAPACITY_LIMIT;

      const statusDistribution: Record<SaleStatus, number> = {
        available: 0,
        reserved: 0,
        sold: 0,
      };
      items.forEach(m => {
        statusDistribution[m.saleStatus]++;
      });

      return {
        displayCase: dc,
        meteorites: items,
        totalWeight,
        count: items.length,
        capacityLimit,
        isOverCapacity: items.length > capacityLimit,
        isEmpty: items.length === 0,
        statusDistribution,
      };
    });
  },
});
