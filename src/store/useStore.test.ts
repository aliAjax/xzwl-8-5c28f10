import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { Meteorite, SaleStatus, DisplayCaseCapacityData } from '@/types';
import { DEFAULT_CAPACITY_LIMIT, METEORITE_CATEGORIES } from '@/types';

const createTestMeteorite = (overrides: Partial<Meteorite> = {}): Meteorite => ({
  id: `test-${Date.now()}-${Math.random()}`,
  name: '测试陨石',
  category: METEORITE_CATEGORIES[0],
  location: '测试地点',
  weight: 100,
  sliced: false,
  certificateNumber: 'TEST-001',
  displayCase: 'A-01',
  saleStatus: 'available',
  description: '测试描述',
  imageUrl: 'https://example.com/image.jpg',
  certificateInfo: '测试证书信息',
  discoveredDate: '2024-01-01',
  saleStatusHistory: [
    {
      id: 'test-history-1',
      meteoriteId: 'test-1',
      fromStatus: null,
      toStatus: 'available',
      timestamp: new Date().toISOString(),
      operator: '测试',
      remark: '测试',
    },
  ],
  ...overrides,
});

describe('Store - 筛选和排序逻辑', () => {
  beforeEach(() => {
    useStore.getState().resetToMockData();
  });

  describe('筛选逻辑', () => {
    it('按分类筛选陨石', () => {
      const { setCategoryFilter, getFilteredMeteorites, meteorites } = useStore.getState();
      
      const ironMeteorites = meteorites.filter(m => m.category === '铁陨石');
      expect(ironMeteorites.length).toBeGreaterThan(0);

      setCategoryFilter('铁陨石');
      const filtered = getFilteredMeteorites();
      
      expect(filtered.length).toBe(ironMeteorites.length);
      expect(filtered.every(m => m.category === '铁陨石')).toBe(true);
    });

    it('按重量范围筛选陨石', () => {
      const { setWeightFilter, getFilteredMeteorites } = useStore.getState();
      
      setWeightFilter(100, 500);
      const filtered = getFilteredMeteorites();
      
      expect(filtered.every(m => m.weight >= 100 && m.weight <= 500)).toBe(true);
    });

    it('按销售状态筛选陨石', () => {
      const { setSaleStatusFilter, getFilteredMeteorites, meteorites } = useStore.getState();
      
      const availableCount = meteorites.filter(m => m.saleStatus === 'available').length;
      const reservedCount = meteorites.filter(m => m.saleStatus === 'reserved').length;
      const soldCount = meteorites.filter(m => m.saleStatus === 'sold').length;

      setSaleStatusFilter('available');
      expect(getFilteredMeteorites().length).toBe(availableCount);
      expect(getFilteredMeteorites().every(m => m.saleStatus === 'available')).toBe(true);

      setSaleStatusFilter('reserved');
      expect(getFilteredMeteorites().length).toBe(reservedCount);
      expect(getFilteredMeteorites().every(m => m.saleStatus === 'reserved')).toBe(true);

      setSaleStatusFilter('sold');
      expect(getFilteredMeteorites().length).toBe(soldCount);
      expect(getFilteredMeteorites().every(m => m.saleStatus === 'sold')).toBe(true);

      setSaleStatusFilter('all');
      expect(getFilteredMeteorites().length).toBe(meteorites.length);
    });

    it('组合多个筛选条件', () => {
      const { setCategoryFilter, setWeightFilter, setSaleStatusFilter, getFilteredMeteorites } = useStore.getState();
      
      setCategoryFilter('铁陨石');
      setWeightFilter(500, 2000);
      setSaleStatusFilter('available');
      
      const filtered = getFilteredMeteorites();
      expect(filtered.every(m => 
        m.category === '铁陨石' && 
        m.weight >= 500 && 
        m.weight <= 2000 && 
        m.saleStatus === 'available'
      )).toBe(true);
    });

    it('重置筛选条件', () => {
      const { setCategoryFilter, setWeightFilter, setSaleStatusFilter, resetFilters, getFilteredMeteorites, meteorites } = useStore.getState();
      
      setCategoryFilter('铁陨石');
      setWeightFilter(100, 200);
      setSaleStatusFilter('sold');
      
      resetFilters();
      
      const state = useStore.getState();
      expect(state.filters.category).toBe('all');
      expect(state.filters.minWeight).toBe(0);
      expect(state.filters.saleStatus).toBe('all');
      expect(getFilteredMeteorites().length).toBe(meteorites.length);
    });
  });

  describe('排序逻辑', () => {
    it('按发现日期降序排序（默认）', () => {
      const { getSortedMeteorites, meteorites } = useStore.getState();
      const sorted = getSortedMeteorites(meteorites);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        const date1 = new Date(sorted[i].discoveredDate).getTime();
        const date2 = new Date(sorted[i + 1].discoveredDate).getTime();
        expect(date1).toBeGreaterThanOrEqual(date2);
      }
    });

    it('按重量升序排序', () => {
      const { setSort, getSortedMeteorites, meteorites } = useStore.getState();
      
      setSort('weight', 'asc');
      const sorted = getSortedMeteorites(meteorites);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].weight).toBeLessThanOrEqual(sorted[i + 1].weight);
      }
    });

    it('按重量降序排序', () => {
      const { setSort, getSortedMeteorites, meteorites } = useStore.getState();
      
      setSort('weight', 'desc');
      const sorted = getSortedMeteorites(meteorites);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].weight).toBeGreaterThanOrEqual(sorted[i + 1].weight);
      }
    });

    it('按销售状态排序', () => {
      const { setSort, getSortedMeteorites, meteorites } = useStore.getState();
      
      setSort('saleStatus', 'asc');
      const sorted = getSortedMeteorites(meteorites);
      
      const statusOrder: Record<SaleStatus, number> = {
        available: 0,
        reserved: 1,
        sold: 2,
      };
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(statusOrder[sorted[i].saleStatus]).toBeLessThanOrEqual(statusOrder[sorted[i + 1].saleStatus]);
      }
    });

    it('按藏品编号排序', () => {
      const { setSort, getSortedMeteorites, meteorites } = useStore.getState();
      
      setSort('id', 'asc');
      const sorted = getSortedMeteorites(meteorites);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].id.localeCompare(sorted[i + 1].id, 'zh-CN', { numeric: true })).toBeLessThanOrEqual(0);
      }
    });

    it('切换排序方向', () => {
      const { setSort, toggleSortDirection } = useStore.getState();
      
      setSort('weight', 'asc');
      expect(useStore.getState().sort.direction).toBe('asc');
      
      toggleSortDirection();
      expect(useStore.getState().sort.direction).toBe('desc');
      
      toggleSortDirection();
      expect(useStore.getState().sort.direction).toBe('asc');
    });

    it('重置排序', () => {
      const { setSort, resetSort } = useStore.getState();
      
      setSort('weight', 'asc');
      resetSort();
      
      const state = useStore.getState();
      expect(state.sort.field).toBe('discoveredDate');
      expect(state.sort.direction).toBe('desc');
    });
  });
});

describe('Store - 状态流转逻辑', () => {
  beforeEach(() => {
    useStore.getState().resetToMockData();
  });

  describe('状态转换验证', () => {
    it('验证合法的状态转换', () => {
      const { meteorites, validateStatusTransition } = useStore.getState();
      const availableMeteorite = meteorites.find(m => m.saleStatus === 'available')!;
      const reservedMeteorite = meteorites.find(m => m.saleStatus === 'reserved')!;

      expect(validateStatusTransition(availableMeteorite.id, 'reserved').valid).toBe(true);
      expect(validateStatusTransition(availableMeteorite.id, 'sold').valid).toBe(true);
      expect(validateStatusTransition(reservedMeteorite.id, 'available').valid).toBe(true);
      expect(validateStatusTransition(reservedMeteorite.id, 'sold').valid).toBe(true);
    });

    it('拒绝非法的状态转换', () => {
      const { meteorites, validateStatusTransition } = useStore.getState();
      const soldMeteorite = meteorites.find(m => m.saleStatus === 'sold')!;

      const result1 = validateStatusTransition(soldMeteorite.id, 'available');
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain('不允许');

      const result2 = validateStatusTransition(soldMeteorite.id, 'reserved');
      expect(result2.valid).toBe(false);
    });

    it('拒绝相同状态的转换', () => {
      const { meteorites, validateStatusTransition } = useStore.getState();
      const availableMeteorite = meteorites.find(m => m.saleStatus === 'available')!;

      const result = validateStatusTransition(availableMeteorite.id, 'available');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('相同');
    });

    it('验证不存在的藏品', () => {
      const { validateStatusTransition } = useStore.getState();
      const result = validateStatusTransition('non-existent-id', 'sold');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('未找到');
    });
  });

  describe('添加状态记录', () => {
    it('成功添加状态记录', () => {
      const { meteorites, startAddingStatusRecord, addSaleStatusRecord, getSaleStatusHistory } = useStore.getState();
      const availableMeteorite = meteorites.find(m => m.saleStatus === 'available')!;
      const initialHistoryLength = getSaleStatusHistory(availableMeteorite.id).length;

      const startResult = startAddingStatusRecord(availableMeteorite.id, 'reserved');
      expect(startResult).toBe(true);

      const reservationInfo = {
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        reservedBy: '测试客户',
      };

      const addResult = addSaleStatusRecord(
        availableMeteorite.id,
        'reserved',
        '客户预留',
        '测试操作员',
        reservationInfo
      );

      expect(addResult.success).toBe(true);
      
      const updatedMeteorite = useStore.getState().meteorites.find(m => m.id === availableMeteorite.id)!;
      expect(updatedMeteorite.saleStatus).toBe('reserved');
      expect(updatedMeteorite.reservationInfo).toEqual(reservationInfo);
      expect(getSaleStatusHistory(availableMeteorite.id).length).toBe(initialHistoryLength + 1);
    });

    it('取消添加状态记录', () => {
      const { meteorites, startAddingStatusRecord, cancelAddingStatusRecord } = useStore.getState();
      const availableMeteorite = meteorites.find(m => m.saleStatus === 'available')!;

      startAddingStatusRecord(availableMeteorite.id, 'reserved');
      expect(useStore.getState().isAddingStatusRecord).toBe(true);

      cancelAddingStatusRecord();
      expect(useStore.getState().isAddingStatusRecord).toBe(false);
      expect(useStore.getState().pendingStatusRecord).toBeNull();
      
      const revertedMeteorite = useStore.getState().meteorites.find(m => m.id === availableMeteorite.id)!;
      expect(revertedMeteorite.saleStatus).toBe('available');
    });

    it('释放预留状态', () => {
      const { meteorites, releaseReservation, getSaleStatusHistory } = useStore.getState();
      const reservedMeteorite = meteorites.find(m => m.saleStatus === 'reserved')!;
      const initialHistoryLength = getSaleStatusHistory(reservedMeteorite.id).length;
      const originalReservationInfo = reservedMeteorite.reservationInfo;

      const result = releaseReservation(reservedMeteorite.id, '客户取消', '测试操作员');
      expect(result.success).toBe(true);

      const updatedMeteorite = useStore.getState().meteorites.find(m => m.id === reservedMeteorite.id)!;
      expect(updatedMeteorite.saleStatus).toBe('available');
      expect(updatedMeteorite.reservationInfo).toBeUndefined();
      expect(getSaleStatusHistory(reservedMeteorite.id).length).toBe(initialHistoryLength + 1);
      
      const lastHistory = getSaleStatusHistory(reservedMeteorite.id)[0];
      expect(lastHistory.originalReservationInfo).toEqual(originalReservationInfo);
    });

    it('获取预留状态的子状态', () => {
      const { getReservedMeteoritesWithSubStatus } = useStore.getState();
      const result = getReservedMeteoritesWithSubStatus();
      
      expect(result.every(r => r.meteorite.saleStatus === 'reserved')).toBe(true);
      expect(result.every(r => ['normal', 'expiringSoon', 'expired'].includes(r.subStatus))).toBe(true);
    });
  });
});

describe('Store - 展柜容量逻辑', () => {
  beforeEach(() => {
    useStore.getState().resetToMockData();
  });

  it('获取展柜容量数据', () => {
    const { getDisplayCaseCapacityData, meteorites } = useStore.getState();
    const capacityData = getDisplayCaseCapacityData();

    const displayCases = [...new Set(meteorites.map(m => m.displayCase))];
    expect(capacityData.length).toBeGreaterThanOrEqual(displayCases.length);

    capacityData.forEach((data: DisplayCaseCapacityData) => {
      const expectedMeteorites = meteorites.filter(m => m.displayCase === data.displayCase);
      expect(data.meteorites.length).toBe(expectedMeteorites.length);
      expect(data.count).toBe(expectedMeteorites.length);
      expect(data.totalWeight).toBeCloseTo(expectedMeteorites.reduce((sum, m) => sum + m.weight, 0));
      expect(data.isEmpty).toBe(data.count === 0);
      expect(data.isOverCapacity).toBe(data.count > data.capacityLimit);
      expect(data.statusDistribution.available + data.statusDistribution.reserved + data.statusDistribution.sold).toBe(data.count);
    });
  });

  it('设置展柜容量限制', () => {
    const { setDisplayCaseCapacity, getDisplayCaseCapacityData } = useStore.getState();
    const testCase = 'A-01';

    setDisplayCaseCapacity(testCase, 5);
    expect(useStore.getState().displayCaseCapacities[testCase].capacityLimit).toBe(5);

    const capacityData = getDisplayCaseCapacityData();
    const caseData = capacityData.find(d => d.displayCase === testCase)!;
    expect(caseData.capacityLimit).toBe(5);
  });

  it('检测展柜是否超载', () => {
    const { setDisplayCaseCapacity, getDisplayCaseCapacityData, meteorites } = useStore.getState();
    const testCase = 'A-01';
    const caseMeteorites = meteorites.filter(m => m.displayCase === testCase);

    if (caseMeteorites.length > 0) {
      setDisplayCaseCapacity(testCase, caseMeteorites.length - 1);
      const capacityData = getDisplayCaseCapacityData();
      const caseData = capacityData.find(d => d.displayCase === testCase)!;
      expect(caseData.isOverCapacity).toBe(true);

      setDisplayCaseCapacity(testCase, caseMeteorites.length + 10);
      const updatedData = getDisplayCaseCapacityData().find(d => d.displayCase === testCase)!;
      expect(updatedData.isOverCapacity).toBe(false);
    }
  });

  describe('展柜模拟功能', () => {
    it('开始和取消模拟', () => {
      const { startCaseSimulation, cancelCaseSimulation, caseSimulation } = useStore.getState();

      expect(caseSimulation.isSimulating).toBe(false);

      const result = startCaseSimulation();
      expect(result).toBe(true);
      expect(useStore.getState().caseSimulation.isSimulating).toBe(true);
      expect(useStore.getState().caseSimulation.originalMeteorites.length).toBeGreaterThan(0);

      cancelCaseSimulation();
      expect(useStore.getState().caseSimulation.isSimulating).toBe(false);
      expect(useStore.getState().caseSimulation.originalMeteorites.length).toBe(0);
    });

    it('在模拟中移动陨石到另一个展柜', () => {
      const { startCaseSimulation, moveMeteoriteToCase, meteorites, getSimulatedMeteorites } = useStore.getState();
      const testMeteorite = meteorites[0];
      const originalCase = testMeteorite.displayCase;
      const targetCase = 'TEST-CASE';

      startCaseSimulation();

      const result = moveMeteoriteToCase(testMeteorite.id, targetCase);
      expect(result).toBe(true);

      const simulated = getSimulatedMeteorites();
      const moved = simulated.find(m => m.id === testMeteorite.id)!;
      expect(moved.displayCase).toBe(targetCase);
      expect(useStore.getState().caseSimulation.moveHistory.length).toBe(1);
      expect(useStore.getState().caseSimulation.moveHistory[0]).toEqual({
        meteoriteId: testMeteorite.id,
        fromCase: originalCase,
        toCase: targetCase,
      });
    });

    it('批量移动陨石到展柜', () => {
      const { startCaseSimulation, batchMoveMeteoritesToCase, meteorites, getSimulatedMeteorites } = useStore.getState();
      const targetCase = 'BATCH-CASE';
      const idsToMove = meteorites.slice(0, 3).map(m => m.id);

      startCaseSimulation();

      const movedCount = batchMoveMeteoritesToCase(idsToMove, targetCase);
      expect(movedCount).toBe(idsToMove.length);

      const simulated = getSimulatedMeteorites();
      idsToMove.forEach(id => {
        expect(simulated.find(m => m.id === id)!.displayCase).toBe(targetCase);
      });
    });

    it('确认模拟并保存更改', () => {
      const { startCaseSimulation, moveMeteoriteToCase, confirmCaseSimulation, meteorites } = useStore.getState();
      const testMeteorite = meteorites[0];
      const targetCase = 'CONFIRM-CASE';

      startCaseSimulation();
      moveMeteoriteToCase(testMeteorite.id, targetCase);

      const result = confirmCaseSimulation();
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);

      const finalMeteorite = useStore.getState().meteorites.find(m => m.id === testMeteorite.id)!;
      expect(finalMeteorite.displayCase).toBe(targetCase);
      expect(useStore.getState().caseSimulation.isSimulating).toBe(false);
    });

    it('模拟中的筛选使用模拟数据', () => {
      const { startCaseSimulation, moveMeteoriteToCase, getFilteredMeteorites, meteorites } = useStore.getState();
      const testMeteorite = meteorites[0];
      const targetCase = 'SIMULATED-CASE';

      startCaseSimulation();
      moveMeteoriteToCase(testMeteorite.id, targetCase);

      const filtered = getFilteredMeteorites();
      const found = filtered.find(m => m.id === testMeteorite.id);
      expect(found?.displayCase).toBe(targetCase);
    });
  });
});

describe('Store - 基础操作', () => {
  beforeEach(() => {
    useStore.getState().resetToMockData();
  });

  it('添加新陨石', () => {
    const { addMeteorite, meteorites } = useStore.getState();
    const initialCount = meteorites.length;
    const newMeteorite = createTestMeteorite({ id: 'NEW-001', displayCase: 'NEW-CASE' });

    addMeteorite(newMeteorite);

    const state = useStore.getState();
    expect(state.meteorites.length).toBe(initialCount + 1);
    expect(state.meteorites.find(m => m.id === 'NEW-001')).toBeDefined();
    expect(state.displayCaseCapacities['NEW-CASE']).toBeDefined();
    expect(state.displayCaseCapacities['NEW-CASE'].capacityLimit).toBe(DEFAULT_CAPACITY_LIMIT);
  });

  it('批量添加陨石', () => {
    const { batchAddMeteorites, meteorites } = useStore.getState();
    const initialCount = meteorites.length;
    const newMeteorites = [
      createTestMeteorite({ id: 'BATCH-001' }),
      createTestMeteorite({ id: 'BATCH-002' }),
      createTestMeteorite({ id: 'BATCH-003' }),
    ];

    const addedCount = batchAddMeteorites(newMeteorites);
    expect(addedCount).toBe(3);
    expect(useStore.getState().meteorites.length).toBe(initialCount + 3);
  });

  it('批量添加时跳过重复ID', () => {
    const { batchAddMeteorites, meteorites } = useStore.getState();
    const existingId = meteorites[0].id;
    const newMeteorites = [
      createTestMeteorite({ id: existingId }),
      createTestMeteorite({ id: 'UNIQUE-001' }),
    ];

    const addedCount = batchAddMeteorites(newMeteorites);
    expect(addedCount).toBe(1);
    expect(useStore.getState().meteorites.find(m => m.id === 'UNIQUE-001')).toBeDefined();
  });

  it('更新陨石信息', () => {
    const { updateMeteorite, meteorites } = useStore.getState();
    const target = meteorites[0];
    const updates = { name: '更新后的名称', weight: 999 };

    const result = updateMeteorite(target.id, updates);
    expect(result).toBeDefined();
    expect(result?.name).toBe('更新后的名称');
    expect(result?.weight).toBe(999);

    const updated = useStore.getState().meteorites.find(m => m.id === target.id)!;
    expect(updated.name).toBe('更新后的名称');
    expect(updated.weight).toBe(999);
  });

  it('更新陨石时自动创建新展柜容量配置', () => {
    const { updateMeteorite, meteorites, displayCaseCapacities } = useStore.getState();
    const target = meteorites[0];
    const newCase = 'NEWLY-CREATED-CASE';

    expect(displayCaseCapacities[newCase]).toBeUndefined();

    updateMeteorite(target.id, { displayCase: newCase });

    expect(useStore.getState().displayCaseCapacities[newCase]).toBeDefined();
    expect(useStore.getState().displayCaseCapacities[newCase].capacityLimit).toBe(DEFAULT_CAPACITY_LIMIT);
  });

  it('检查重复ID', () => {
    const { checkDuplicateId, meteorites } = useStore.getState();
    const existingId = meteorites[0].id;
    const nonExistentId = 'NON-EXISTENT-123';

    expect(checkDuplicateId(existingId)).toBe(true);
    expect(checkDuplicateId(nonExistentId)).toBe(false);
    expect(checkDuplicateId(existingId, existingId)).toBe(false);
  });

  it('按证书编号搜索', () => {
    const { searchByCertificateNumber, meteorites } = useStore.getState();
    const target = meteorites[0];

    const result = searchByCertificateNumber(target.certificateNumber);
    expect(result).toBeDefined();
    expect(result?.id).toBe(target.id);

    const caseInsensitiveResult = searchByCertificateNumber(target.certificateNumber.toLowerCase());
    expect(caseInsensitiveResult).toBeDefined();

    const notFound = searchByCertificateNumber('NON-EXISTENT-CERT');
    expect(notFound).toBeUndefined();
  });

  it('重置到模拟数据时保持原有localStorage持久化行为', () => {
    localStorage.setItem('meteorite-filter-views', JSON.stringify([{ id: 'old-view' }]));
    localStorage.setItem('meteorite-pending-status-record', JSON.stringify({ meteoriteId: 'old-id' }));

    useStore.getState().resetToMockData();

    const storedMeteorites = localStorage.getItem('meteorite-collection-data');
    const storedCapacities = localStorage.getItem('meteorite-display-case-capacities');

    expect(storedMeteorites).not.toBeNull();
    expect(JSON.parse(storedMeteorites || '[]').length).toBe(useStore.getState().meteorites.length);
    expect(storedCapacities).not.toBeNull();
    expect(Object.keys(JSON.parse(storedCapacities || '{}')).length).toBeGreaterThan(0);
    expect(localStorage.getItem('meteorite-filter-views')).toBeNull();
    expect(localStorage.getItem('meteorite-pending-status-record')).toBeNull();
  });
});

describe('Store - 筛选视图', () => {
  beforeEach(() => {
    useStore.getState().resetToMockData();
  });

  it('保存筛选视图', () => {
    const { setCategoryFilter, setSort, saveFilterView, filterViews } = useStore.getState();
    const initialCount = filterViews.length;

    setCategoryFilter('铁陨石');
    setSort('weight', 'desc');
    saveFilterView('铁陨石按重量降序');

    const state = useStore.getState();
    expect(state.filterViews.length).toBe(initialCount + 1);
    expect(state.filterViews[state.filterViews.length - 1].name).toBe('铁陨石按重量降序');
    expect(state.filterViews[state.filterViews.length - 1].filters.category).toBe('铁陨石');
    expect(state.filterViews[state.filterViews.length - 1].sort.field).toBe('weight');
    expect(state.filterViews[state.filterViews.length - 1].sort.direction).toBe('desc');
  });

  it('应用筛选视图', () => {
    const { saveFilterView, applyFilterView, setCategoryFilter, resetFilters } = useStore.getState();
    
    setCategoryFilter('铁陨石');
    saveFilterView('测试视图');
    const viewId = useStore.getState().filterViews[0].id;

    resetFilters();
    expect(useStore.getState().filters.category).toBe('all');

    applyFilterView(viewId);
    expect(useStore.getState().filters.category).toBe('铁陨石');
    expect(useStore.getState().activeFilterViewId).toBe(viewId);
  });

  it('删除筛选视图', () => {
    const { saveFilterView, deleteFilterView } = useStore.getState();
    
    saveFilterView('待删除视图');
    const viewId = useStore.getState().filterViews[0].id;
    const initialCount = useStore.getState().filterViews.length;

    deleteFilterView(viewId);
    expect(useStore.getState().filterViews.length).toBe(initialCount - 1);
    expect(useStore.getState().filterViews.find(v => v.id === viewId)).toBeUndefined();
  });
});
