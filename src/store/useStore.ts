import { create } from 'zustand';
import { StoreState, Meteorite, SaleStatus, ViewMode } from '@/types';
import { mockMeteorites } from '@/data/mockData';

const calculateWeightRange = (meteorites: Meteorite[]): [number, number] => {
  const weights = meteorites.map(m => m.weight);
  return [Math.min(...weights), Math.max(...weights)];
};

const [minWeight, maxWeight] = calculateWeightRange(mockMeteorites);

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
  isEditing: false,
  viewMode: 'list' as ViewMode,

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
    set({ selectedMeteorite: meteorite, isModalOpen: true }),

  closeModal: () =>
    set({ selectedMeteorite: null, isModalOpen: false }),

  openAddModal: () =>
    set({ isAddModalOpen: true }),

  closeAddModal: () =>
    set({ isAddModalOpen: false }),

  addMeteorite: (meteorite: Meteorite) =>
    set((state) => ({
      meteorites: [meteorite, ...state.meteorites],
    })),

  checkDuplicateId: (id: string) => {
    const { meteorites } = get();
    return meteorites.some((m) => m.id === id);
  },

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

  searchByCertificateNumber: (certNumber: string) => {
    const { meteorites } = get();
    const trimmed = certNumber.trim().toUpperCase();
    return meteorites.find((m) => m.certificateNumber.toUpperCase() === trimmed);
  },

  setViewMode: (mode: ViewMode) =>
    set({ viewMode: mode }),
}));

export { minWeight, maxWeight };
