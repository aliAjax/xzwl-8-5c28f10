export type SaleStatus = 'available' | 'reserved' | 'sold';

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

export interface StoreState {
  meteorites: Meteorite[];
  filters: FilterState;
  selectedMeteorite: Meteorite | null;
  isModalOpen: boolean;
  setCategoryFilter: (category: string) => void;
  setWeightFilter: (min: number, max: number) => void;
  setSaleStatusFilter: (status: SaleStatus | 'all') => void;
  selectMeteorite: (meteorite: Meteorite | null) => void;
  openModal: (meteorite: Meteorite) => void;
  closeModal: () => void;
  resetFilters: () => void;
  getFilteredMeteorites: () => Meteorite[];
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
