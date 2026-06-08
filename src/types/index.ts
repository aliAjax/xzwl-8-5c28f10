export type SaleStatus = 'available' | 'reserved' | 'sold';

export type ViewMode = 'list' | 'displayCase';

export type MeteoriteCategory = 
  | '普通球粒陨石'
  | '碳质球粒陨石'
  | '顽火辉石球粒陨石'
  | '铁陨石'
  | '石铁陨石'
  | '无球粒陨石'
  | '月球陨石'
  | '火星陨石';

export interface Meteorite {
  id: string;
  name: string;
  category: MeteoriteCategory;
  location: string;
  weight: number;
  sliced: boolean;
  certificateNumber: string;
  displayCase: string;
  saleStatus: SaleStatus;
  description: string;
  imageUrl: string;
  certificateInfo: string;
  discoveredDate: string;
}

export interface FilterState {
  category: string;
  minWeight: number;
  maxWeight: number;
  saleStatus: SaleStatus | 'all';
}

export interface DisplayCaseCapacityConfig {
  capacityLimit: number;
}

export interface DisplayCaseCapacityData {
  displayCase: string;
  meteorites: Meteorite[];
  totalWeight: number;
  count: number;
  capacityLimit: number;
  isOverCapacity: boolean;
  isEmpty: boolean;
  statusDistribution: Record<SaleStatus, number>;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface ImportPreviewData {
  headers: string[];
  headerMapping: Record<string, string>;
  validRows: Meteorite[];
  errorRows: ImportError[];
  duplicateIds: string[];
  totalRows: number;
  validCount: number;
  errorCount: number;
}

export interface StoreState {
  meteorites: Meteorite[];
  filters: FilterState;
  selectedMeteorite: Meteorite | null;
  isModalOpen: boolean;
  isAddModalOpen: boolean;
  isBatchImportModalOpen: boolean;
  isCertificateArchiveOpen: boolean;
  isCapacityPlannerOpen: boolean;
  isEditing: boolean;
  viewMode: ViewMode;
  displayCaseCapacities: Record<string, DisplayCaseCapacityConfig>;
  setCategoryFilter: (category: string) => void;
  setWeightFilter: (min: number, max: number) => void;
  setSaleStatusFilter: (status: SaleStatus | 'all') => void;
  selectMeteorite: (meteorite: Meteorite | null) => void;
  openModal: (meteorite: Meteorite) => void;
  closeModal: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openBatchImportModal: () => void;
  closeBatchImportModal: () => void;
  openCertificateArchive: () => void;
  closeCertificateArchive: () => void;
  openCapacityPlanner: () => void;
  closeCapacityPlanner: () => void;
  addMeteorite: (meteorite: Meteorite) => void;
  batchAddMeteorites: (meteorites: Meteorite[]) => number;
  updateMeteorite: (id: string, updates: Partial<Meteorite>) => Meteorite | undefined;
  startEditing: () => void;
  cancelEditing: () => void;
  resetFilters: () => void;
  getFilteredMeteorites: () => Meteorite[];
  checkDuplicateId: (id: string, excludeId?: string) => boolean;
  searchByCertificateNumber: (certNumber: string) => Meteorite | undefined;
  setViewMode: (mode: ViewMode) => void;
  setDisplayCaseCapacity: (displayCase: string, capacityLimit: number) => void;
  getDisplayCaseCapacityData: () => DisplayCaseCapacityData[];
}

export const METEORITE_CATEGORIES: MeteoriteCategory[] = [
  '普通球粒陨石',
  '碳质球粒陨石',
  '顽火辉石球粒陨石',
  '铁陨石',
  '石铁陨石',
  '无球粒陨石',
  '月球陨石',
  '火星陨石',
];

export const SALE_STATUS_LABELS: Record<SaleStatus | 'all', string> = {
  all: '全部',
  available: '在售',
  reserved: '预留',
  sold: '已售出',
};

export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  available: 'bg-archive-available',
  reserved: 'bg-archive-reserved',
  sold: 'bg-archive-sold',
};

export const DEFAULT_CAPACITY_LIMIT = 10;
