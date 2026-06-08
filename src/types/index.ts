export type SaleStatus = 'available' | 'reserved' | 'sold';

export type ReservedSubStatus = 'normal' | 'expiringSoon' | 'expired';

export interface ReservationInfo {
  expiresAt: string;
  reservedBy: string;
}

export interface SaleStatusRecord {
  id: string;
  meteoriteId: string;
  fromStatus: SaleStatus | null;
  toStatus: SaleStatus;
  timestamp: string;
  operator: string;
  remark: string;
  reservationInfo?: ReservationInfo;
  originalReservationInfo?: ReservationInfo;
}

export const VALID_STATUS_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  available: ['reserved', 'sold'],
  reserved: ['available', 'sold'],
  sold: [],
};

export type ViewMode = 'list' | 'displayCase';

export type SortField = 'discoveredDate' | 'weight' | 'id' | 'saleStatus';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  discoveredDate: '发现日期',
  weight: '重量',
  id: '藏品编号',
  saleStatus: '销售状态',
};

export const SALE_STATUS_SORT_ORDER: Record<SaleStatus, number> = {
  available: 0,
  reserved: 1,
  sold: 2,
};

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
  saleStatusHistory: SaleStatusRecord[];
  reservationInfo?: ReservationInfo;
}

export interface FilterState {
  category: string;
  minWeight: number;
  maxWeight: number;
  saleStatus: SaleStatus | 'all';
}

export interface FilterView {
  id: string;
  name: string;
  filters: FilterState;
  sort: SortState;
  createdAt: number;
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

export interface CaseMoveRecord {
  meteoriteId: string;
  fromCase: string;
  toCase: string;
}

export interface CaseSimulationState {
  isSimulating: boolean;
  originalMeteorites: Meteorite[];
  simulatedMeteorites: Meteorite[];
  moveHistory: CaseMoveRecord[];
  selectedMeteoriteIds: Set<string>;
}

export interface ImportRowData {
  rowKey: string;
  rowNum: number;
  id: string;
  name: string;
  category: string;
  location: string;
  weight: string;
  sliced: string;
  certificateNumber: string;
  displayCase: string;
  saleStatus: string;
  discoveredDate: string;
  description: string;
  imageUrl: string;
  certificateInfo: string;
  errors: ImportError[];
  isValid: boolean;
}

export interface ImportPreviewData {
  headers: string[];
  headerMapping: Record<string, string>;
  allRows: ImportRowData[];
  validRows: Meteorite[];
  errorRows: ImportError[];
  duplicateIds: string[];
  totalRows: number;
  validCount: number;
  errorCount: number;
  selectedRowKeys: Set<string>;
}

export interface StoreState {
  meteorites: Meteorite[];
  filters: FilterState;
  sort: SortState;
  selectedMeteorite: Meteorite | null;
  isModalOpen: boolean;
  isAddModalOpen: boolean;
  isBatchImportModalOpen: boolean;
  isCertificateArchiveOpen: boolean;
  isCapacityPlannerOpen: boolean;
  isEditing: boolean;
  isAddingStatusRecord: boolean;
  pendingStatusRecord: {
    meteoriteId: string;
    newStatus: SaleStatus;
    originalStatus: SaleStatus;
  } | null;
  viewMode: ViewMode;
  displayCaseCapacities: Record<string, DisplayCaseCapacityConfig>;
  filterViews: FilterView[];
  activeFilterViewId: string | null;
  caseSimulation: CaseSimulationState;
  setCategoryFilter: (category: string) => void;
  setWeightFilter: (min: number, max: number) => void;
  setSaleStatusFilter: (status: SaleStatus | 'all') => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  toggleSortDirection: () => void;
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
  resetSort: () => void;
  getFilteredMeteorites: () => Meteorite[];
  getSortedMeteorites: (meteorites: Meteorite[]) => Meteorite[];
  checkDuplicateId: (id: string, excludeId?: string) => boolean;
  searchByCertificateNumber: (certNumber: string) => Meteorite | undefined;
  searchCertificates: (keyword: string) => Meteorite[];
  setViewMode: (mode: ViewMode) => void;
  setDisplayCaseCapacity: (displayCase: string, capacityLimit: number) => void;
  getDisplayCaseCapacityData: (useSimulation?: boolean) => DisplayCaseCapacityData[];
  validateStatusTransition: (meteoriteId: string, newStatus: SaleStatus, fromStatus?: SaleStatus) => { valid: boolean; reason?: string };
  startAddingStatusRecord: (meteoriteId: string, newStatus: SaleStatus) => boolean;
  cancelAddingStatusRecord: () => void;
  addSaleStatusRecord: (meteoriteId: string, newStatus: SaleStatus, remark: string, operator: string, reservationInfo?: ReservationInfo) => { success: boolean; reason?: string };
  getSaleStatusHistory: (meteoriteId: string) => SaleStatusRecord[];
  releaseReservation: (meteoriteId: string, remark: string, operator: string) => { success: boolean; reason?: string };
  getReservedMeteoritesWithSubStatus: () => { meteorite: Meteorite; subStatus: ReservedSubStatus }[];
  saveFilterView: (name: string) => void;
  deleteFilterView: (id: string) => void;
  applyFilterView: (id: string) => void;
  clearActiveFilterView: () => void;
  resetToMockData: () => void;
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

export const RESERVED_SUBSTATUS_LABELS: Record<ReservedSubStatus, string> = {
  normal: '正常预留',
  expiringSoon: '即将到期',
  expired: '已到期',
};

export const RESERVED_SUBSTATUS_COLORS: Record<ReservedSubStatus, string> = {
  normal: 'bg-archive-reserved',
  expiringSoon: 'bg-amber-500',
  expired: 'bg-red-500',
};

export const RESERVED_SUBSTATUS_TEXT_COLORS: Record<ReservedSubStatus, string> = {
  normal: 'text-archive-reserved',
  expiringSoon: 'text-amber-400',
  expired: 'text-red-400',
};

export const RESERVATION_EXPIRING_SOON_DAYS = 3;

export const getReservedSubStatus = (reservationInfo?: ReservationInfo): ReservedSubStatus | null => {
  if (!reservationInfo?.expiresAt) return null;
  const now = new Date();
  const expiresAt = new Date(reservationInfo.expiresAt);
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= RESERVATION_EXPIRING_SOON_DAYS) return 'expiringSoon';
  return 'normal';
};

export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const DEFAULT_CAPACITY_LIMIT = 10;
