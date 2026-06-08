import type { StateCreator } from 'zustand';
import type {
  StoreState,
  SaleStatus,
  SaleStatusRecord,
  ReservationInfo,
  ReservedSubStatus,
  Meteorite,
} from '@/types';
import { VALID_STATUS_TRANSITIONS, getReservedSubStatus } from '@/types';
import { persistMeteorites, persistPendingStatusRecord } from '../storage';

export interface SaleStatusSlice {
  isAddingStatusRecord: boolean;
  pendingStatusRecord: {
    meteoriteId: string;
    newStatus: SaleStatus;
    originalStatus: SaleStatus;
  } | null;
  validateStatusTransition: (meteoriteId: string, newStatus: SaleStatus, fromStatus?: SaleStatus) => { valid: boolean; reason?: string };
  startAddingStatusRecord: (meteoriteId: string, newStatus: SaleStatus) => boolean;
  cancelAddingStatusRecord: () => void;
  addSaleStatusRecord: (meteoriteId: string, newStatus: SaleStatus, remark: string, operator: string, reservationInfo?: ReservationInfo) => { success: boolean; reason?: string };
  getSaleStatusHistory: (meteoriteId: string) => SaleStatusRecord[];
  releaseReservation: (meteoriteId: string, remark: string, operator: string) => { success: boolean; reason?: string };
  getReservedMeteoritesWithSubStatus: () => { meteorite: Meteorite; subStatus: ReservedSubStatus }[];
}

export const createSaleStatusSlice: StateCreator<StoreState, [], [], SaleStatusSlice> = (set, get) => ({
  isAddingStatusRecord: false,
  pendingStatusRecord: null,

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
    const pendingRecord = {
      meteoriteId,
      newStatus,
      originalStatus,
    };
    persistMeteorites(newMeteorites);
    persistPendingStatusRecord(pendingRecord);
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: true,
      pendingStatusRecord: pendingRecord,
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
    persistPendingStatusRecord(null);
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: false,
      pendingStatusRecord: null,
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
  },

  addSaleStatusRecord: (meteoriteId: string, newStatus: SaleStatus, remark: string, operator: string, reservationInfo?: ReservationInfo) => {
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
      reservationInfo: newStatus === 'reserved' ? reservationInfo : undefined,
      originalReservationInfo: newStatus === 'available' && pendingStatusRecord.originalStatus === 'reserved' ? meteorite.reservationInfo : undefined,
    };
    const newMeteorites = meteorites.map((m) =>
      m.id === meteoriteId
        ? {
            ...m,
            saleStatus: newStatus,
            saleStatusHistory: [...m.saleStatusHistory, newRecord],
            reservationInfo: newStatus === 'reserved' ? reservationInfo : undefined,
          }
        : m
    );
    persistMeteorites(newMeteorites);
    persistPendingStatusRecord(null);
    set({
      meteorites: newMeteorites,
      isAddingStatusRecord: false,
      pendingStatusRecord: null,
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
    return { success: true };
  },

  releaseReservation: (meteoriteId: string, remark: string, operator: string) => {
    const { meteorites } = get();
    const meteorite = meteorites.find((m) => m.id === meteoriteId);
    if (!meteorite) {
      return { success: false, reason: '未找到该藏品' };
    }
    if (meteorite.saleStatus !== 'reserved') {
      return { success: false, reason: '该藏品当前不处于预留状态' };
    }
    const newRecord: SaleStatusRecord = {
      id: `${meteoriteId}-history-${Date.now()}`,
      meteoriteId,
      fromStatus: 'reserved',
      toStatus: 'available',
      timestamp: new Date().toISOString(),
      operator: operator || '系统',
      remark: remark || '预留到期解除',
      originalReservationInfo: meteorite.reservationInfo,
    };
    const newMeteorites = meteorites.map((m) =>
      m.id === meteoriteId
        ? {
            ...m,
            saleStatus: 'available' as SaleStatus,
            saleStatusHistory: [...m.saleStatusHistory, newRecord],
            reservationInfo: undefined,
          }
        : m
    );
    persistMeteorites(newMeteorites);
    set({
      meteorites: newMeteorites,
      selectedMeteorite: newMeteorites.find((m) => m.id === meteoriteId) || null,
    });
    return { success: true };
  },

  getReservedMeteoritesWithSubStatus: () => {
    const { meteorites } = get();
    return meteorites
      .filter((m) => m.saleStatus === 'reserved')
      .map((meteorite) => {
        const subStatus = getReservedSubStatus(meteorite.reservationInfo);
        return {
          meteorite,
          subStatus: (subStatus || 'normal') as ReservedSubStatus,
        };
      });
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
});
