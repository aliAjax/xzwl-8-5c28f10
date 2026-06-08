import { create } from 'zustand';
import { StoreState, Meteorite, SaleStatus, ViewMode, DEFAULT_CAPACITY_LIMIT, DisplayCaseCapacityData, DisplayCaseCapacityConfig } from '@/types';
import { mockMeteorites } from '@/data/mockData';

const calculateWeightRange = (meteorites: Meteorite[]): [number, number] => {
  const weights = meteorites.map(m => m.weight);
  return [Math.min(...weights), Math.max(...weights)];
};

const [minWeight, maxWeight] = calculateWeightRange(mockMeteorites);

const getInitialDisplayCaseCapacities = (): Record<string, DisplayCaseCapacityConfig> => {
  const capacities: Record<string, DisplayCaseCapacityConfig> = {};
  const displayCases = [...new Set(mockMeteorites.map(m => m.displayCase))];
  displayCases.forEach(dc => {
    capacities[dc] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
  });
  return capacities;
};

export const useStore = create<StoreState>((set, get) => ({
  meteorites: mockMeteorites,
  filters: {
    category: 'all',
    minWeight: 0,
    maxWeight: maxWeight + 100,
    saleStatus: 'all',
  },
  selectedMeteorite: null,
  isModalOpen: false,
  isAddModalOpen: false,
  isBatchImportModalOpen: false,
  isCertificateArchiveOpen: false,
  isCapacityPlannerOpen: false,
  isEditing: false,
  viewMode: 'list' as ViewMode,
  displayCaseCapacities: getInitialDisplayCaseCapacities(),

  setCategoryFilter: (category: string) =>
    set((state) => ({
      filters: { ...state.filters, category },
    })),

  setWeightFilter: (min: number, max: number) =>
    set((state) => ({
      filters: { ...state.filters, minWeight: min, maxWeight: max },
    })),

  setSaleStatusFilter: (status: SaleStatus | 'all') =>
    set((state) => ({
      filters: { ...state.filters, saleStatus: status },
    })),

  selectMeteorite: (meteorite: Meteorite | null) =>
    set({ selectedMeteorite: meteorite }),

  openModal: (meteorite: Meteorite) =>
    set({ selectedMeteorite: meteorite, isModalOpen: true, isEditing: false }),

  closeModal: () =>
    set({ selectedMeteorite: null, isModalOpen: false, isEditing: false }),

  openAddModal: () =>
    set({ isAddModalOpen: true }),

  closeAddModal: () =>
    set({ isAddModalOpen: false }),

  openBatchImportModal: () =>
    set({ isBatchImportModalOpen: true }),

  closeBatchImportModal: () =>
    set({ isBatchImportModalOpen: false }),

  openCertificateArchive: () =>
    set({ isCertificateArchiveOpen: true }),

  closeCertificateArchive: () =>
    set({ isCertificateArchiveOpen: false }),

  openCapacityPlanner: () =>
    set({ isCapacityPlannerOpen: true }),

  closeCapacityPlanner: () =>
    set({ isCapacityPlannerOpen: false }),

  addMeteorite: (meteorite: Meteorite) =>
    set((state) => {
      const newCapacities = { ...state.displayCaseCapacities };
      if (!newCapacities[meteorite.displayCase]) {
        newCapacities[meteorite.displayCase] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
      }
      return {
        meteorites: [meteorite, ...state.meteorites],
        displayCaseCapacities: newCapacities,
      };
    }),

  batchAddMeteorites: (meteorites: Meteorite[]) => {
    const { meteorites: existingMeteorites, displayCaseCapacities } = get();
    const newCapacities = { ...displayCaseCapacities };
    const newIds = new Set(existingMeteorites.map(m => m.id));
    const uniqueMeteorites = meteorites.filter(m => {
      if (newIds.has(m.id)) return false;
      newIds.add(m.id);
      return true;
    });

    uniqueMeteorites.forEach(m => {
      if (!newCapacities[m.displayCase]) {
        newCapacities[m.displayCase] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
      }
    });

    set((state) => ({
      meteorites: [...uniqueMeteorites, ...state.meteorites],
      displayCaseCapacities: newCapacities,
    }));

    return uniqueMeteorites.length;
  },

  updateMeteorite: (id: string, updates: Partial<Meteorite>) => {
    const { meteorites, displayCaseCapacities } = get();
    const index = meteorites.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    const updated = { ...meteorites[index], ...updates };
    const newMeteorites = [...meteorites];
    newMeteorites[index] = updated;

    let newCapacities = displayCaseCapacities;
    if (updates.displayCase && !displayCaseCapacities[updates.displayCase]) {
      newCapacities = {
        ...displayCaseCapacities,
        [updates.displayCase]: { capacityLimit: DEFAULT_CAPACITY_LIMIT },
      };
    }

    set({ meteorites: newMeteorites, displayCaseCapacities: newCapacities });
    return updated;
  },

  startEditing: () =>
    set({ isEditing: true }),

  cancelEditing: () =>
    set({ isEditing: false }),

  resetFilters: () =>
    set({
      filters: {
        category: 'all',
        minWeight: 0,
        maxWeight: maxWeight + 100,
        saleStatus: 'all',
      },
    }),

  getFilteredMeteorites: () => {
    const { meteorites, filters } = get();
    return meteorites.filter((m) => {
      const categoryMatch = filters.category === 'all' || m.category === filters.category;
      const weightMatch = m.weight >= filters.minWeight && m.weight <= filters.maxWeight;
      const statusMatch = filters.saleStatus === 'all' || m.saleStatus === filters.saleStatus;
      return categoryMatch && weightMatch && statusMatch;
    });
  },

  checkDuplicateId: (id: string, excludeId?: string) => {
    const { meteorites } = get();
    return meteorites.some((m) => m.id === id && m.id !== excludeId);
  },

  searchByCertificateNumber: (certNumber: string) => {
    const { meteorites } = get();
    const trimmed = certNumber.trim().toUpperCase();
    return meteorites.find((m) => m.certificateNumber.toUpperCase() === trimmed);
  },

  setViewMode: (mode: ViewMode) =>
    set({ viewMode: mode }),

  setDisplayCaseCapacity: (displayCase: string, capacityLimit: number) =>
    set((state) => ({
      displayCaseCapacities: {
        ...state.displayCaseCapacities,
        [displayCase]: { capacityLimit },
      },
    })),

  getDisplayCaseCapacityData: (): DisplayCaseCapacityData[] => {
    const { meteorites, displayCaseCapacities } = get();
    const allCases = new Set<string>();
    meteorites.forEach(m => allCases.add(m.displayCase));
    Object.keys(displayCaseCapacities).forEach(c => allCases.add(c));
    const displayCases = Array.from(allCases).sort();

    return displayCases.map(dc => {
      const items = meteorites.filter(m => m.displayCase === dc);
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
}));

export { minWeight, maxWeight };
