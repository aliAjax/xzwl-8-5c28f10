import type { Meteorite, FilterView, DisplayCaseCapacityConfig, StoreState } from '@/types';

export const FILTER_VIEWS_STORAGE_KEY = 'meteorite-filter-views';
export const METEORITES_STORAGE_KEY = 'meteorite-collection-data';
export const DISPLAY_CASE_CAPACITIES_STORAGE_KEY = 'meteorite-display-case-capacities';
export const PENDING_STATUS_RECORD_STORAGE_KEY = 'meteorite-pending-status-record';

export const loadFilterViews = (defaultSort: any): FilterView[] => {
  try {
    const stored = localStorage.getItem(FILTER_VIEWS_STORAGE_KEY);
    if (stored) {
      const views = JSON.parse(stored);
      return views.map((view: FilterView) => ({
        ...view,
        sort: view.sort || { ...defaultSort },
      }));
    }
  } catch (e) {
    console.error('Failed to load filter views from localStorage:', e);
  }
  return [];
};

export const persistFilterViews = (views: FilterView[]) => {
  try {
    localStorage.setItem(FILTER_VIEWS_STORAGE_KEY, JSON.stringify(views));
  } catch (e) {
    console.error('Failed to persist filter views to localStorage:', e);
  }
};

export const loadMeteorites = (fallbackMeteorites: Meteorite[]): Meteorite[] => {
  try {
    const stored = localStorage.getItem(METEORITES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load meteorites from localStorage:', e);
  }
  return fallbackMeteorites;
};

export const persistMeteorites = (meteorites: Meteorite[]) => {
  try {
    localStorage.setItem(METEORITES_STORAGE_KEY, JSON.stringify(meteorites));
  } catch (e) {
    console.error('Failed to persist meteorites to localStorage:', e);
  }
};

export const loadDisplayCaseCapacities = (
  fallbackMeteorites: Meteorite[],
  defaultCapacityLimit: number
): Record<string, DisplayCaseCapacityConfig> => {
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
    capacities[dc] = { capacityLimit: defaultCapacityLimit };
  });
  return capacities;
};

export const persistDisplayCaseCapacities = (capacities: Record<string, DisplayCaseCapacityConfig>) => {
  try {
    localStorage.setItem(DISPLAY_CASE_CAPACITIES_STORAGE_KEY, JSON.stringify(capacities));
  } catch (e) {
    console.error('Failed to persist display case capacities to localStorage:', e);
  }
};

export const loadPendingStatusRecord = (): StoreState['pendingStatusRecord'] => {
  try {
    const stored = localStorage.getItem(PENDING_STATUS_RECORD_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load pending status record from localStorage:', e);
  }
  return null;
};

export const persistPendingStatusRecord = (record: StoreState['pendingStatusRecord']) => {
  try {
    if (record) {
      localStorage.setItem(PENDING_STATUS_RECORD_STORAGE_KEY, JSON.stringify(record));
    } else {
      localStorage.removeItem(PENDING_STATUS_RECORD_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to persist pending status record to localStorage:', e);
  }
};

export const clearAllStorage = () => {
  localStorage.removeItem(FILTER_VIEWS_STORAGE_KEY);
  localStorage.removeItem(METEORITES_STORAGE_KEY);
  localStorage.removeItem(DISPLAY_CASE_CAPACITIES_STORAGE_KEY);
  localStorage.removeItem(PENDING_STATUS_RECORD_STORAGE_KEY);
};
