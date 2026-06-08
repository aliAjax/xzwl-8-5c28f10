import { create } from 'zustand';
import type { StoreState } from '@/types';
import { DEFAULT_SORT, DEFAULT_CAPACITY_LIMIT } from './constants';
import { initializeStoreData, resetToMockData as createResetData, calculateWeightRange } from './initialization';
import {
  FILTER_VIEWS_STORAGE_KEY,
  persistDisplayCaseCapacities,
  persistMeteorites,
  persistPendingStatusRecord,
} from './storage';
import {
  createFilterSortSlice,
  createCertificateSearchSlice,
  createMeteoriteDataSlice,
  createSaleStatusSlice,
  createDisplayCaseSlice,
  createCaseSimulationSlice,
} from './slices';

const {
  initialMeteorites,
  minWeight,
  maxWeight,
  initialDisplayCaseCapacities,
  initialFilterViews,
} = initializeStoreData();

export const useStore = create<StoreState>((...args) => {
  const [set] = args;

  const filterSortSlice = createFilterSortSlice(maxWeight, DEFAULT_SORT)(...args);
  const certificateSearchSlice = createCertificateSearchSlice(...args);
  const meteoriteDataSlice = createMeteoriteDataSlice(initialMeteorites, initialDisplayCaseCapacities)(...args);
  const saleStatusSlice = createSaleStatusSlice(...args);
  const displayCaseSlice = createDisplayCaseSlice(...args);
  const caseSimulationSlice = createCaseSimulationSlice(...args);

  return {
    ...filterSortSlice,
    ...certificateSearchSlice,
    ...meteoriteDataSlice,
    ...saleStatusSlice,
    ...displayCaseSlice,
    ...caseSimulationSlice,

    filterViews: initialFilterViews,

    resetToMockData: () => {
      const resetData = createResetData(DEFAULT_SORT, DEFAULT_CAPACITY_LIMIT);
      const [, newMax] = calculateWeightRange(resetData.meteorites);
      set({
        ...resetData,
        selectedMeteorite: null,
        isModalOpen: false,
        isEditing: false,
        activeFilterViewId: null,
        caseSimulation: {
          isSimulating: false,
          originalMeteorites: [],
          simulatedMeteorites: [],
          moveHistory: [],
          selectedMeteoriteIds: new Set<string>(),
        },
        filters: {
          ...resetData.filters,
          maxWeight: newMax + 100,
        },
      });
      persistMeteorites(resetData.meteorites);
      persistDisplayCaseCapacities(resetData.displayCaseCapacities);
      localStorage.removeItem(FILTER_VIEWS_STORAGE_KEY);
      persistPendingStatusRecord(null);
    },
  };
});

export { minWeight, maxWeight };
