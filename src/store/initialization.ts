import type { Meteorite, SortState, DisplayCaseCapacityConfig } from '@/types';
import { DEFAULT_CAPACITY_LIMIT, DEFAULT_SORT } from './constants';
import {
  loadMeteorites,
  loadPendingStatusRecord,
  loadDisplayCaseCapacities,
  loadFilterViews,
  persistMeteorites,
  persistPendingStatusRecord,
} from './storage';
import { mockMeteorites } from '@/data/mockData';

export const calculateWeightRange = (meteorites: Meteorite[]): [number, number] => {
  const weights = meteorites.map(m => m.weight);
  return [Math.min(...weights), Math.max(...weights)];
};

export const loadAndValidateMeteorites = (): Meteorite[] => {
  const meteorites = loadMeteorites(mockMeteorites);
  const pendingRecord = loadPendingStatusRecord();

  if (pendingRecord) {
    const { meteoriteId, originalStatus } = pendingRecord;
    const index = meteorites.findIndex(m => m.id === meteoriteId);
    if (index !== -1 && meteorites[index].saleStatus !== originalStatus) {
      meteorites[index] = { ...meteorites[index], saleStatus: originalStatus };
      persistMeteorites(meteorites);
    }
    persistPendingStatusRecord(null);
  }

  return meteorites;
};

export const initializeStoreData = () => {
  const initialMeteorites = loadAndValidateMeteorites();
  const [minWeight, maxWeight] = calculateWeightRange(initialMeteorites);
  const initialDisplayCaseCapacities = loadDisplayCaseCapacities(initialMeteorites, DEFAULT_CAPACITY_LIMIT);
  const initialFilterViews = loadFilterViews(DEFAULT_SORT);

  return {
    initialMeteorites,
    minWeight,
    maxWeight,
    initialDisplayCaseCapacities,
    initialFilterViews,
  };
};

export const resetToMockData = (
  _defaultSort: SortState,
  defaultCapacityLimit: number
): {
  meteorites: Meteorite[];
  displayCaseCapacities: Record<string, DisplayCaseCapacityConfig>;
  filters: {
    category: string;
    minWeight: number;
    maxWeight: number;
    saleStatus: 'all';
  };
  filterViews: any[];
} => {
  const capacities: Record<string, DisplayCaseCapacityConfig> = {};
  const displayCases = [...new Set(mockMeteorites.map(m => m.displayCase))];
  displayCases.forEach(dc => {
    capacities[dc] = { capacityLimit: defaultCapacityLimit };
  });
  const [, newMax] = calculateWeightRange(mockMeteorites);

  return {
    meteorites: mockMeteorites,
    displayCaseCapacities: capacities,
    filters: {
      category: 'all',
      minWeight: 0,
      maxWeight: newMax + 100,
      saleStatus: 'all',
    },
    filterViews: [],
  };
};
