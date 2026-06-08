import { create } from 'zustand';
import { StoreState, Meteorite, SaleStatus, ViewMode, DEFAULT_CAPACITY_LIMIT, DisplayCaseCapacityData, DisplayCaseCapacityConfig, VALID_STATUS_TRANSITIONS, SaleStatusRecord, FilterView } from '@/types';
import { mockMeteorites } from '@/data/mockData';

const FILTER_VIEWS_STORAGE_KEY = 'meteorite-filter-views';

const loadFilterViews = (): FilterView[] => {
  try {
    const stored = localStorage.getItem(FILTER_VIEWS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load filter views from localStorage:', e);
  }
  return [];
};

const persistFilterViews = (views: FilterView[]) => {
  try {
    localStorage.setItem(FILTER_VIEWS_STORAGE_KEY, JSON.stringify(views));
  } catch (e) {
    console.error('Failed to persist filter views to localStorage:', e);
  }
};

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
  isAddingStatusRecord: false,
  pendingStatusRecord: null,
  viewMode: 'list' as ViewMode,
  displayCaseCapacities: getInitialDisplayCaseCapacities(),
  filterViews: loadFilterViews(),
  activeFilterViewId: null,

  setCategoryFilter: (category: string) =>
    set((state) => ({
      filters: { ...state.filters, category },
      activeFilterViewId: null,
    })),

  setWeightFilter: (min: number, max: number) =>
    set((state) => ({
      filters: { ...state.filters, minWeight: min, maxWeight: max },
      activeFilterViewId: null,
    })),

  setSaleStatusFilter: (status: SaleStatus | 'all') =>
    set((state) => ({
      filters: { ...state.filters, saleStatus: status },
      activeFilterViewId: null,
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
      activeFilterViewId: null,
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

  validateStatusTransition: (meteoriteId: string, newStatus: SaleStatus, fromStatus?: SaleStatus) => {
    const { meteorites } = get();
    const meteorite = meteorites.find((m) => m.id === meteoriteId);
    if (!meteorite) {
      return { valid: false, reason: '未找到该藏品' };
    }
    const currentStatus = fromStatus ?? meteorite.saleStatus;
    if (currentStatus === newStatus) {
      return { valid: false, reason: '目标状态与当前状态相同' };
    }
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      return { valid: false, reason: `不允许从"${currentStatus}"跳转到"${newStatus}"` };
    }
    return { valid: true };
  },

  startAddingStatusRecord: (meteoriteId: string, newStatus: SaleStatus) => {
    const { meteorites, isAddingStatusRecord } = get();
    if (isAddingStatusRecord) {
      return false;
    }
    const meteorite = meteorites.find((m) => m.id === meteoriteId);
    if (!meteorite) {
      return false;
    }
    const validation = get().validateStatusTransition(meteoriteId, newStatus);
    if (!validation.valid) {
      return false;
    }
    const originalStatus = meteorite.saleStatus;
    const newMeteorites = meteorites.map((m) =>
      m.id === meteoriteId ? { ...m, saleStatus: newStatus } : m
    );
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: true,
      pendingStatusRecord: {
        meteoriteId,
        newStatus,
        originalStatus,
      },
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
    return true;
  },

  cancelAddingStatusRecord: () => {
    const { pendingStatusRecord, meteorites } = get();
    if (!pendingStatusRecord) {
      return;
    }
    const { meteoriteId, originalStatus } = pendingStatusRecord;
    const newMeteorites = meteorites.map((m) =>
      m.id === meteoriteId ? { ...m, saleStatus: originalStatus } : m
    );
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: false,
      pendingStatusRecord: null,
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
  },

  addSaleStatusRecord: (meteoriteId: string, newStatus: SaleStatus, remark: string, operator: string) => {
    const { meteorites, pendingStatusRecord } = get();
    if (!pendingStatusRecord || pendingStatusRecord.meteoriteId !== meteoriteId) {
      return { success: false, reason: '请先开始添加状态记录' };
    }
    const validation = get().validateStatusTransition(meteoriteId, newStatus, pendingStatusRecord.originalStatus);
    if (!validation.valid) {
      get().cancelAddingStatusRecord();
      return { success: false, reason: validation.reason };
    }
    const meteorite = meteorites.find((m) => m.id === meteoriteId);
    if (!meteorite) {
      get().cancelAddingStatusRecord();
      return { success: false, reason: '未找到该藏品' };
    }
    const newRecord: SaleStatusRecord = {
      id: `${meteoriteId}-history-${Date.now()}`,
      meteoriteId,
      fromStatus: pendingStatusRecord.originalStatus,
      toStatus: newStatus,
      timestamp: new Date().toISOString(),
      operator: operator || '系统',
      remark: remark || '状态变更',
    };
    const newMeteorites = meteorites.map((m) =>
      m.id === meteoriteId
        ? {
            ...m,
            saleStatus: newStatus,
            saleStatusHistory: [...m.saleStatusHistory, newRecord],
          }
        : m
    );
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: false,
      pendingStatusRecord: null,
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
    return { success: true };
  },

  getSaleStatusHistory: (meteoriteId: string) => {
    const { meteorites } = get();
    const meteorite = meteorites.find((m) => m.id === meteoriteId);
    if (!meteorite) {
      return [];
    }
    return [...meteorite.saleStatusHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  saveFilterView: (name: string) => {
    const { filters, filterViews } = get();
    const newView: FilterView = {
      id: `view-${Date.now()}`,
      name: name.trim(),
      filters: { ...filters },
      createdAt: Date.now(),
    };
    const newViews = [...filterViews, newView];
    set({ filterViews: newViews, activeFilterViewId: newView.id });
    persistFilterViews(newViews);
  },

  deleteFilterView: (id: string) => {
    const { filterViews, activeFilterViewId } = get();
    const newViews = filterViews.filter(v => v.id !== id);
    const newActiveId = activeFilterViewId === id ? null : activeFilterViewId;
    set({ filterViews: newViews, activeFilterViewId: newActiveId });
    persistFilterViews(newViews);
  },

  applyFilterView: (id: string) => {
    const { filterViews } = get();
    const view = filterViews.find(v => v.id === id);
    if (view) {
      set({
        filters: { ...view.filters },
        activeFilterViewId: id,
      });
    }
  },

  clearActiveFilterView: () => {
    set({ activeFilterViewId: null });
  },
}));

export { minWeight, maxWeight };
