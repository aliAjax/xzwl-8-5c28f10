import type { StateCreator } from 'zustand';
import type {
  StoreState,
  FilterState,
  SortState,
  FilterView,
  Meteorite,
  SortField,
  SortDirection,
  SaleStatus,
} from '@/types';
import { SALE_STATUS_SORT_ORDER } from '@/types';
import { DEFAULT_SORT } from '../constants';
import { persistFilterViews } from '../storage';

export interface FilterSortSlice {
  filters: FilterState;
  sort: SortState;
  filterViews: FilterView[];
  activeFilterViewId: string | null;
  setCategoryFilter: (category: string) => void;
  setWeightFilter: (min: number, max: number) => void;
  setSaleStatusFilter: (status: SaleStatus | 'all') => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  toggleSortDirection: () => void;
  resetFilters: () => void;
  resetSort: () => void;
  getSortedMeteorites: (meteorites: Meteorite[]) => Meteorite[];
  getFilteredMeteorites: () => Meteorite[];
  saveFilterView: (name: string) => void;
  deleteFilterView: (id: string) => void;
  applyFilterView: (id: string) => void;
  clearActiveFilterView: () => void;
}

export const createFilterSortSlice: (
  maxWeight: number,
  defaultSort: SortState
) => StateCreator<StoreState, [], [], FilterSortSlice> = (initialMaxWeight, defaultSort) => (set, get) => ({
  filters: {
    category: 'all',
    minWeight: 0,
    maxWeight: initialMaxWeight + 100,
    saleStatus: 'all',
  },
  sort: { ...defaultSort },
  filterViews: [],
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

  resetFilters: () =>
    set({
      filters: {
        category: 'all',
        minWeight: 0,
        maxWeight: initialMaxWeight + 100,
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
    const { meteorites, filters, getSortedMeteorites, caseSimulation } = get();
    const dataSource = caseSimulation.isSimulating
      ? caseSimulation.simulatedMeteorites
      : meteorites;
    const filtered = dataSource.filter((m) => {
      const categoryMatch = filters.category === 'all' || m.category === filters.category;
      const weightMatch = m.weight >= filters.minWeight && m.weight <= filters.maxWeight;
      const statusMatch = filters.saleStatus === 'all' || m.saleStatus === filters.saleStatus;
      return categoryMatch && weightMatch && statusMatch;
    });
    return getSortedMeteorites(filtered);
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
});
