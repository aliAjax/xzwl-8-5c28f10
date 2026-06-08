import type { StateCreator } from 'zustand';
import type { StoreState, Meteorite, DisplayCaseCapacityConfig } from '@/types';
import { DEFAULT_CAPACITY_LIMIT } from '../constants';
import { persistMeteorites, persistDisplayCaseCapacities } from '../storage';

export interface MeteoriteDataSlice {
  meteorites: Meteorite[];
  selectedMeteorite: Meteorite | null;
  isModalOpen: boolean;
  isAddModalOpen: boolean;
  isBatchImportModalOpen: boolean;
  isEditing: boolean;
  displayCaseCapacities: Record<string, DisplayCaseCapacityConfig>;
  selectMeteorite: (meteorite: Meteorite | null) => void;
  openModal: (meteorite: Meteorite) => void;
  closeModal: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openBatchImportModal: () => void;
  closeBatchImportModal: () => void;
  addMeteorite: (meteorite: Meteorite) => void;
  batchAddMeteorites: (meteorites: Meteorite[]) => number;
  updateMeteorite: (id: string, updates: Partial<Meteorite>) => Meteorite | undefined;
  startEditing: () => void;
  cancelEditing: () => void;
  checkDuplicateId: (id: string, excludeId?: string) => boolean;
}

export const createMeteoriteDataSlice: (
  initialMeteorites: Meteorite[],
  initialDisplayCaseCapacities: Record<string, DisplayCaseCapacityConfig>
) => StateCreator<StoreState, [], [], MeteoriteDataSlice> = (
  initialMeteorites,
  initialDisplayCaseCapacities
) => (set, get) => ({
  meteorites: initialMeteorites,
  selectedMeteorite: null,
  isModalOpen: false,
  isAddModalOpen: false,
  isBatchImportModalOpen: false,
  isEditing: false,
  displayCaseCapacities: initialDisplayCaseCapacities,

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

  checkDuplicateId: (id: string, excludeId?: string) => {
    const { meteorites } = get();
    return meteorites.some((m) => m.id === id && m.id !== excludeId);
  },
});
