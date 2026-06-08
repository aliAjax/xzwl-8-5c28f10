import { describe, it, expect, vi } from 'vitest';
import {
  getReservedSubStatus,
  formatDateTime,
  RESERVATION_EXPIRING_SOON_DAYS,
  VALID_STATUS_TRANSITIONS,
  SALE_STATUS_SORT_ORDER,
} from './index';
import type { ReservationInfo } from './index';

describe('getReservedSubStatus', () => {
  const createReservation = (daysFromNow: number): ReservationInfo => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(23, 59, 59, 999);
    return {
      expiresAt: date.toISOString(),
      reservedBy: '测试用户',
    };
  };

  it('没有预留信息时返回null', () => {
    expect(getReservedSubStatus(undefined)).toBeNull();
    expect(getReservedSubStatus(null as unknown as ReservationInfo)).toBeNull();
  });

  it('过期时间缺失时返回null', () => {
    const invalidInfo = { reservedBy: '测试' } as ReservationInfo;
    expect(getReservedSubStatus(invalidInfo)).toBeNull();
  });

  it('已过期的预留返回expired', () => {
    const reservation = createReservation(-5);
    expect(getReservedSubStatus(reservation)).toBe('expired');
  });

  it('即将到期的预留返回expiringSoon', () => {
    const reservation = createReservation(RESERVATION_EXPIRING_SOON_DAYS - 1);
    expect(getReservedSubStatus(reservation)).toBe('expiringSoon');

    const reservation2 = createReservation(1);
    expect(getReservedSubStatus(reservation2)).toBe('expiringSoon');
  });

  it('正常预留返回normal', () => {
    const reservation = createReservation(RESERVATION_EXPIRING_SOON_DAYS + 1);
    expect(getReservedSubStatus(reservation)).toBe('normal');

    const reservation2 = createReservation(30);
    expect(getReservedSubStatus(reservation2)).toBe('normal');
  });

  it('使用固定时间测试边界条件', () => {
    const fixedNow = new Date('2024-06-01T12:00:00Z');
    vi.useFakeTimers().setSystemTime(fixedNow);

    const expired: ReservationInfo = {
      expiresAt: '2024-05-31T23:59:59Z',
      reservedBy: 'test',
    };
    expect(getReservedSubStatus(expired)).toBe('expired');

    const expiringSoon: ReservationInfo = {
      expiresAt: '2024-06-04T12:00:00Z',
      reservedBy: 'test',
    };
    expect(getReservedSubStatus(expiringSoon)).toBe('expiringSoon');

    const normal: ReservationInfo = {
      expiresAt: '2024-06-10T12:00:00Z',
      reservedBy: 'test',
    };
    expect(getReservedSubStatus(normal)).toBe('normal');

    vi.useRealTimers();
  });
});

describe('formatDateTime', () => {
  it('格式化ISO日期字符串为中文格式', () => {
    const isoString = '2024-06-15T14:30:00Z';
    const result = formatDateTime(isoString);
    expect(result).toContain('2024');
    expect(result).toContain('06');
    expect(result).toContain('15');
  });

  it('处理不同的日期时间', () => {
    const result = formatDateTime('2023-12-01T08:00:00Z');
    expect(result).toContain('2023');
    expect(result).toContain('12');
    expect(result).toContain('01');
  });
});

describe('VALID_STATUS_TRANSITIONS', () => {
  it('允许available转换为reserved和sold', () => {
    expect(VALID_STATUS_TRANSITIONS.available).toContain('reserved');
    expect(VALID_STATUS_TRANSITIONS.available).toContain('sold');
    expect(VALID_STATUS_TRANSITIONS.available).toHaveLength(2);
  });

  it('允许reserved转换为available和sold', () => {
    expect(VALID_STATUS_TRANSITIONS.reserved).toContain('available');
    expect(VALID_STATUS_TRANSITIONS.reserved).toContain('sold');
    expect(VALID_STATUS_TRANSITIONS.reserved).toHaveLength(2);
  });

  it('不允许sold进行任何转换', () => {
    expect(VALID_STATUS_TRANSITIONS.sold).toEqual([]);
  });
});

describe('SALE_STATUS_SORT_ORDER', () => {
  it('排序顺序为available < reserved < sold', () => {
    expect(SALE_STATUS_SORT_ORDER.available).toBe(0);
    expect(SALE_STATUS_SORT_ORDER.reserved).toBe(1);
    expect(SALE_STATUS_SORT_ORDER.sold).toBe(2);
    expect(SALE_STATUS_SORT_ORDER.available).toBeLessThan(SALE_STATUS_SORT_ORDER.reserved);
    expect(SALE_STATUS_SORT_ORDER.reserved).toBeLessThan(SALE_STATUS_SORT_ORDER.sold);
  });
});
