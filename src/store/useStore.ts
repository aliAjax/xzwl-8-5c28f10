import { create } from 'zustand';
import { StoreState, Meteorite, SaleStatus, ViewMode, DEFAULT_CAPACITY_LIMIT, DisplayCaseCapacityData, DisplayCaseCapacityConfig, VALID_STATUS_TRANSITIONS, SaleStatusRecord, FilterView, SortState, SALE_STATUS_SORT_ORDER } from '@/types';
import { mockMeteorites } from '@/data/mockData';

const FILTER_VIEWS_STORAGE_KEY = 'meteorite-filter-views';
const METEORITES_STORAGE_KEY = 'meteorite-collection-data';
const DISPLAY_CASE_CAPACITIES_STORAGE_KEY = 'meteorite-display-case-capacities';

const DEFAULT_SORT: SortState = {
  field: 'discoveredDate',
  direction: 'desc',
};

const loadFilterViews = (): FilterView[] => {
  try {
    const stored = localStorage.getItem(FILTER_VIEWS_STORAGE_KEY);
    if (stored) {
      const views = JSON.parse(stored);
      return views.map((view: FilterView) => ({
        ...view,
        sort: view.sort || { ...DEFAULT_SORT },
      }));
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

const loadMeteorites = (): Meteorite[] => {
  try {
    const stored = localStorage.getItem(METEORITES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load meteorites from localStorage:', e);
  }
  return mockMeteorites;
};

const persistMeteorites = (meteorites: Meteorite[]) => {
  try {
    localStorage.setItem(METEORITES_STORAGE_KEY, JSON.stringify(meteorites));
  } catch (e) {
    console.error('Failed to persist meteorites to localStorage:', e);
  }
};

const loadDisplayCaseCapacities = (fallbackMeteorites: Meteorite[]): Record<string, DisplayCaseCapacityConfig> => {
  try {
    const stored = localStorage.getItem(DISPLAY_CASE_CAPACITIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load display case capacities from localStorage:', e);
  }
  const capacities: Record<string, DisplayCaseCapacityConfig> = {};
  const displayCases = [...new Set(fallbackMeteorites.map(m => m.displayCase))];
  displayCases.forEach(dc => {
    capacities[dc] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
  });
  return capacities;
};

const persistDisplayCaseCapacities = (capacities: Record<string, DisplayCaseCapacityConfig>) => {
  try {
    localStorage.setItem(DISPLAY_CASE_CAPACITIES_STORAGE_KEY, JSON.stringify(capacities));
  } catch (e) {
    console.error('Failed to persist display case capacities to localStorage:', e);
  }
};

const calculateWeightRange = (meteorites: Meteorite[]): [number, number] => {
  const weights = meteorites.map(m => m.weight);
  return [Math.min(...weights), Math.max(...weights)];
};

const initialMeteorites = loadMeteorites();
const [minWeight, maxWeight] = calculateWeightRange(initialMeteorites);
const initialDisplayCaseCapacities = loadDisplayCaseCapacities(initialMeteorites);

export const useStore = create<StoreState>((set, get) => ({
  meteorites: initialMeteorites,
  filters: {
    category: 'all',
    minWeight: 0,
    maxWeight: maxWeight + 100,
    saleStatus: 'all',
  },
  sort: { ...DEFAULT_SORT },
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
  displayCaseCapacities: initialDisplayCaseCapacities,
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

  setSort: (field, direction) =>
    set(() => ({
      sort: { field, direction },
      activeFilterViewId: null,
    })),

  toggleSortDirection: () =>
    set((state) => ({
      sort: {
        ...state.sort,
        direction: state.sort.direction === 'asc' ? 'desc' : 'asc',
      },
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
      const newMeteorites = [meteorite, ...state.meteorites];
      persistMeteorites(newMeteorites);
      persistDisplayCaseCapacities(newCapacities);
      return {
        meteorites: newMeteorites,
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

    const finalMeteorites = [...uniqueMeteorites, ...existingMeteorites];
    set({
      meteorites: finalMeteorites,
      displayCaseCapacities: newCapacities,
    });
    persistMeteorites(finalMeteorites);
    persistDisplayCaseCapacities(newCapacities);

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
    persistMeteorites(newMeteorites);
    persistDisplayCaseCapacities(newCapacities);
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

  resetSort: () =>
    set({
      sort: { ...DEFAULT_SORT },
    }),

  getSortedMeteorites: (meteorites: Meteorite[]) => {
    const { sort } = get();
    return [...meteorites].sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'discoveredDate':
          comparison = new Date(a.discoveredDate).getTime() - new Date(b.discoveredDate).getTime();
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id, 'zh-CN', { numeric: true });
          break;
        case 'saleStatus':
          comparison = SALE_STATUS_SORT_ORDER[a.saleStatus] - SALE_STATUS_SORT_ORDER[b.saleStatus];
          break;
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  },

  getFilteredMeteorites: () => {
    const { meteorites, filters, getSortedMeteorites } = get();
    const filtered = meteorites.filter((m) => {
      const categoryMatch = filters.category === 'all' || m.category === filters.category;
      const weightMatch = m.weight >= filters.minWeight && m.weight <= filters.maxWeight;
      const statusMatch = filters.saleStatus === 'all' || m.saleStatus === filters.saleStatus;
      return categoryMatch && weightMatch && statusMatch;
    });
    return getSortedMeteorites(filtered);
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
    persistMeteorites(newMeteorites);
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
    persistMeteorites(newMeteorites);
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
    persistMeteorites(newMeteorites);
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
    const { filters, filterViews, sort } = get();
    const newView: FilterView = {
      id: `view-${Date.now()}`,
      name: name.trim(),
      filters: { ...filters },
      sort: { ...sort },
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
        sort: { ...view.sort },
        activeFilterViewId: id,
      });
    }
  },

  clearActiveFilterView: () => {
    set({ activeFilterViewId: null });
  },

  resetToMockData: () => {
    const capacities: Record<string, DisplayCaseCapacityConfig> = {};
    const displayCases = [...new Set(mockMeteorites.map(m => m.displayCase))];
    displayCases.forEach(dc => {
      capacities[dc] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
    });
    const [, newMax] = calculateWeightRange(mockMeteorites);
    set({
      meteorites: mockMeteorites,
      displayCaseCapacities: capacities,
      filters: {
        category: 'all',
        minWeight: 0,
        maxWeight: newMax + 100,
        saleStatus: 'all',
      },
      selectedMeteorite: null,
      isModalOpen: false,
      isEditing: false,
    });
    persistMeteorites(mockMeteorites);
    persistDisplayCaseCapacities(capacities);
    localStorage.removeItem(FILTER_VIEWS_STORAGE_KEY);
  },
}));

export { minWeight, maxWeight };
