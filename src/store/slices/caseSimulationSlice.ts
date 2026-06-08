import type { StateCreator } from 'zustand';
import type { StoreState, CaseSimulationState, Meteorite } from '@/types';
import { DEFAULT_CAPACITY_LIMIT } from '../constants';
import { persistMeteorites, persistDisplayCaseCapacities } from '../storage';

export interface CaseSimulationSlice {
  caseSimulation: CaseSimulationState;
  startCaseSimulation: () => boolean;
  cancelCaseSimulation: () => void;
  confirmCaseSimulation: () => { success: boolean; updatedCount: number };
  moveMeteoriteToCase: (meteoriteId: string, targetCase: string) => boolean;
  batchMoveMeteoritesToCase: (meteoriteIds: string[], targetCase: string) => number;
  toggleMeteoriteSelection: (meteoriteId: string) => void;
  clearMeteoriteSelection: () => void;
  selectAllMeteoritesInCase: (displayCase: string) => void;
  getSimulatedMeteorites: () => Meteorite[];
  getSimulationMoveCount: () => number;
}

export const createCaseSimulationSlice: StateCreator<StoreState, [], [], CaseSimulationSlice> = (set, get) => ({
  caseSimulation: {
    isSimulating: false,
    originalMeteorites: [],
    simulatedMeteorites: [],
    moveHistory: [],
    selectedMeteoriteIds: new Set<string>(),
  },

  startCaseSimulation: () => {
    const { meteorites, caseSimulation } = get();
    if (caseSimulation.isSimulating) {
      return false;
    }
    const snapshot = meteorites.map(m => ({ ...m }));
    set({
      caseSimulation: {
        isSimulating: true,
        originalMeteorites: snapshot,
        simulatedMeteorites: snapshot.map(m => ({ ...m })),
        moveHistory: [],
        selectedMeteoriteIds: new Set<string>(),
      },
    });
    return true;
  },

  cancelCaseSimulation: () => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return;
    }
    set({
      caseSimulation: {
        isSimulating: false,
        originalMeteorites: [],
        simulatedMeteorites: [],
        moveHistory: [],
        selectedMeteoriteIds: new Set<string>(),
      },
    });
  },

  confirmCaseSimulation: () => {
    const { caseSimulation, displayCaseCapacities } = get();
    if (!caseSimulation.isSimulating) {
      return { success: false, updatedCount: 0 };
    }
    const { moveHistory, simulatedMeteorites } = caseSimulation;

    if (moveHistory.length === 0) {
      set({
        caseSimulation: {
          isSimulating: false,
          originalMeteorites: [],
          simulatedMeteorites: [],
          moveHistory: [],
          selectedMeteoriteIds: new Set<string>(),
        },
      });
      return { success: true, updatedCount: 0 };
    }

    const updatedIds = new Set(moveHistory.map(m => m.meteoriteId));
    const updatedCount = updatedIds.size;

    const newCapacities = { ...displayCaseCapacities };
    simulatedMeteorites.forEach(m => {
      if (!newCapacities[m.displayCase]) {
        newCapacities[m.displayCase] = { capacityLimit: DEFAULT_CAPACITY_LIMIT };
      }
    });

    const finalMeteorites = simulatedMeteorites.map(m => ({ ...m }));
    persistMeteorites(finalMeteorites);
    persistDisplayCaseCapacities(newCapacities);

    set({
      meteorites: finalMeteorites,
      displayCaseCapacities: newCapacities,
      caseSimulation: {
        isSimulating: false,
        originalMeteorites: [],
        simulatedMeteorites: [],
        moveHistory: [],
        selectedMeteoriteIds: new Set<string>(),
      },
    });

    return { success: true, updatedCount };
  },

  moveMeteoriteToCase: (meteoriteId: string, targetCase: string) => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return false;
    }
    const { simulatedMeteorites, moveHistory } = caseSimulation;
    const meteorite = simulatedMeteorites.find(m => m.id === meteoriteId);
    if (!meteorite) {
      return false;
    }
    if (meteorite.displayCase === targetCase) {
      return false;
    }

    const fromCase = meteorite.displayCase;
    const newSimulatedMeteorites = simulatedMeteorites.map(m =>
      m.id === meteoriteId ? { ...m, displayCase: targetCase } : m
    );
    const newMoveHistory = [
      ...moveHistory,
      { meteoriteId, fromCase, toCase: targetCase },
    ];

    set({
      caseSimulation: {
        ...caseSimulation,
        simulatedMeteorites: newSimulatedMeteorites,
        moveHistory: newMoveHistory,
      },
    });
    return true;
  },

  batchMoveMeteoritesToCase: (meteoriteIds: string[], targetCase: string) => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating || meteoriteIds.length === 0) {
      return 0;
    }
    const { simulatedMeteorites, moveHistory } = caseSimulation;
    const newMoveHistory = [...moveHistory];
    const idSet = new Set(meteoriteIds);

    const newSimulatedMeteorites = simulatedMeteorites.map(m => {
      if (idSet.has(m.id) && m.displayCase !== targetCase) {
        newMoveHistory.push({
          meteoriteId: m.id,
          fromCase: m.displayCase,
          toCase: targetCase,
        });
        return { ...m, displayCase: targetCase };
      }
      return m;
    });

    const movedCount = newMoveHistory.length - moveHistory.length;

    set({
      caseSimulation: {
        ...caseSimulation,
        simulatedMeteorites: newSimulatedMeteorites,
        moveHistory: newMoveHistory,
      },
    });
    return movedCount;
  },

  toggleMeteoriteSelection: (meteoriteId: string) => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return;
    }
    const { selectedMeteoriteIds } = caseSimulation;
    const newSelected = new Set(selectedMeteoriteIds);
    if (newSelected.has(meteoriteId)) {
      newSelected.delete(meteoriteId);
    } else {
      newSelected.add(meteoriteId);
    }
    set({
      caseSimulation: {
        ...caseSimulation,
        selectedMeteoriteIds: newSelected,
      },
    });
  },

  clearMeteoriteSelection: () => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return;
    }
    set({
      caseSimulation: {
        ...caseSimulation,
        selectedMeteoriteIds: new Set<string>(),
      },
    });
  },

  selectAllMeteoritesInCase: (displayCase: string) => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return;
    }
    const { simulatedMeteorites, selectedMeteoriteIds } = caseSimulation;
    const newSelected = new Set(selectedMeteoriteIds);
    const caseMeteoriteIds = simulatedMeteorites
      .filter(m => m.displayCase === displayCase)
      .map(m => m.id);

    const allSelected = caseMeteoriteIds.every(id => newSelected.has(id));

    if (allSelected) {
      caseMeteoriteIds.forEach(id => newSelected.delete(id));
    } else {
      caseMeteoriteIds.forEach(id => newSelected.add(id));
    }

    set({
      caseSimulation: {
        ...caseSimulation,
        selectedMeteoriteIds: newSelected,
      },
    });
  },

  getSimulatedMeteorites: () => {
    const { caseSimulation, meteorites } = get();
    return caseSimulation.isSimulating ? caseSimulation.simulatedMeteorites : meteorites;
  },

  getSimulationMoveCount: () => {
    const { caseSimulation } = get();
    if (!caseSimulation.isSimulating) {
      return 0;
    }
    const uniqueIds = new Set(caseSimulation.moveHistory.map(m => m.meteoriteId));
    return uniqueIds.size;
  },
});
