import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  parseAndValidateCSV,
  revalidatePreviewData,
  convertRowDataToMeteorite,
} from './importCSV';
import { ImportRowData, METEORITE_CATEGORIES } from '@/types';

const VALID_HEADERS =
  '藏品编号,名称,分类,发现地,重量(g),切片状态,证书编号,展示柜,出售状态,发现日期,描述,图片地址,证书描述';

const createValidRow = (id: string, overrides: Record<string, string> = {}) => {
  const base = {
    id,
    name: '测试陨石',
    category: METEORITE_CATEGORIES[0],
    location: '测试地点',
    weight: '100.5',
    sliced: '是',
    certificateNumber: 'TEST-001',
    displayCase: 'A-01',
    saleStatus: '在售',
    discoveredDate: '2024-01-01',
    description: '测试描述',
    imageUrl: 'https://example.com/image.jpg',
    certificateInfo: '测试证书信息',
  };
  return { ...base, ...overrides };
};

const rowToCSV = (row: Record<string, string>) => {
  const escape = (v: string) => (v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v);
  return Object.values(row).map(escape).join(',');
};

describe('parseCSV', () => {
  it('解析基本CSV文本', () => {
    const csv = 'a,b,c\n1,2,3\n4,5,6';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
  });

  it('处理带引号和逗号的字段', () => {
    const csv = 'name,desc\n"Smith, John","He said ""hello"""\n"Doe, Jane",normal';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['name', 'desc'],
      ['Smith, John', 'He said "hello"'],
      ['Doe, Jane', 'normal'],
    ]);
  });

  it('处理多行CSV（不支持引号内换行）', () => {
    const csv = 'name,desc\nLine1,Value1\nLine2,Value2';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['name', 'desc'],
      ['Line1', 'Value1'],
      ['Line2', 'Value2'],
    ]);
  });

  it('处理Windows换行符\\r\\n', () => {
    const csv = 'a,b\r\n1,2\r\n3,4';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('处理空字符串返回空数组', () => {
    expect(parseCSV('')).toEqual([]);
    expect(parseCSV('   ')).toEqual([]);
  });

  it('跳过空行', () => {
    const csv = 'a,b\n\n1,2\n\n\n3,4\n';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('处理字段前后空格', () => {
    const csv = ' a , b , c \n 1 , 2 , 3 ';
    const result = parseCSV(csv);
    expect(result).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });
});

describe('parseAndValidateCSV', () => {
  it('解析并验证有效CSV数据', () => {
    const row1 = createValidRow('MET-001');
    const row2 = createValidRow('MET-002', { name: '第二个陨石' });
    const csv = [VALID_HEADERS, rowToCSV(row1), rowToCSV(row2)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.totalRows).toBe(2);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.validRows).toHaveLength(2);
    expect(result.duplicateIds).toEqual([]);
    expect(result.validRows[0].id).toBe('MET-001');
    expect(result.validRows[1].name).toBe('第二个陨石');
    expect(result.selectedRowKeys.size).toBe(2);
  });

  it('检测重复藏品编号（CSV内部重复）', () => {
    const row1 = createValidRow('MET-DUP-001');
    const row2 = createValidRow('MET-DUP-001', { name: '重复编号' });
    const csv = [VALID_HEADERS, rowToCSV(row1), rowToCSV(row2)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.totalRows).toBe(2);
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateIds).toContain('MET-DUP-001');
    expect(result.allRows[0].isValid).toBe(true);
    expect(result.allRows[0].errors).toEqual([]);
    expect(result.allRows[1].isValid).toBe(false);
    expect(result.allRows[1].errors.some(e => e.field === '藏品编号')).toBe(true);
  });

  it('检测与现有数据重复的藏品编号', () => {
    const row = createValidRow('MET-EXIST-001');
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');
    const existingIds = new Set(['MET-EXIST-001']);

    const result = parseAndValidateCSV(csv, existingIds);

    expect(result.validCount).toBe(0);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateIds).toContain('MET-EXIST-001');
    expect(result.errorRows[0].message).toContain('已存在');
  });

  it('检测非法分类', () => {
    const row = createValidRow('MET-CAT-001', { category: '非法分类' });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(0);
    expect(result.errorCount).toBe(1);
    const categoryError = result.errorRows.find(e => e.field === '分类');
    expect(categoryError).toBeDefined();
    expect(categoryError?.message).toContain('不合法');
  });

  it('检测无效重量（负数）', () => {
    const row = createValidRow('MET-WEIGHT-001', { weight: '-50' });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(0);
    const weightError = result.errorRows.find(e => e.field === '重量');
    expect(weightError).toBeDefined();
    expect(weightError?.message).toContain('正数');
  });

  it('检测无效重量（零）', () => {
    const row = createValidRow('MET-WEIGHT-002', { weight: '0' });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(0);
    expect(result.errorRows.some(e => e.field === '重量')).toBe(true);
  });

  it('检测无效重量（非数字）', () => {
    const row = createValidRow('MET-WEIGHT-003', { weight: 'abc' });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(0);
    expect(result.errorRows.some(e => e.field === '重量')).toBe(true);
  });

  it('检测空必填字段', () => {
    const row = createValidRow('MET-EMPTY-001', { name: '', description: '' });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(0);
    expect(result.errorRows.some(e => e.field === '名称' && e.message.includes('不能为空'))).toBe(true);
    expect(result.errorRows.some(e => e.field === '描述' && e.message.includes('不能为空'))).toBe(true);
  });

  it('处理带引号和逗号的描述字段', () => {
    const row = createValidRow('MET-QUOTED-001', {
      description: '这是, 包含逗号 和 "引号" 的描述',
      name: '正常名称',
    });
    const csv = [VALID_HEADERS, rowToCSV(row)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.validCount).toBe(1);
    expect(result.validRows[0].description).toBe('这是, 包含逗号 和 "引号" 的描述');
  });

  it('空CSV文本返回空结果', () => {
    const result = parseAndValidateCSV('', new Set());
    expect(result.totalRows).toBe(0);
    expect(result.validCount).toBe(0);
    expect(result.allRows).toEqual([]);
  });

  it('混合有效和无效行', () => {
    const validRow = createValidRow('MET-MIX-001');
    const invalidRow = createValidRow('MET-MIX-002', { category: '非法分类', weight: '' });
    const csv = [VALID_HEADERS, rowToCSV(validRow), rowToCSV(invalidRow)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.totalRows).toBe(2);
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.validRows[0].id).toBe('MET-MIX-001');
    expect(result.allRows[0].isValid).toBe(true);
    expect(result.allRows[1].isValid).toBe(false);
    expect(result.selectedRowKeys.has(result.allRows[0].rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(result.allRows[1].rowKey)).toBe(false);
  });

  it('只选中有效行', () => {
    const row1 = createValidRow('MET-SEL-001');
    const row2 = createValidRow('MET-SEL-002', { category: '坏分类' });
    const row3 = createValidRow('MET-SEL-003');
    const csv = [VALID_HEADERS, rowToCSV(row1), rowToCSV(row2), rowToCSV(row3)].join('\n');

    const result = parseAndValidateCSV(csv, new Set());

    expect(result.selectedRowKeys.size).toBe(2);
    expect(result.selectedRowKeys.has(result.allRows[0].rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(result.allRows[1].rowKey)).toBe(false);
    expect(result.selectedRowKeys.has(result.allRows[2].rowKey)).toBe(true);
  });
});

describe('convertRowDataToMeteorite', () => {
  const createValidRowData = (id: string, overrides: Partial<ImportRowData> = {}): ImportRowData => ({
    rowKey: `row-${id}`,
    rowNum: 2,
    id,
    name: '测试陨石',
    category: METEORITE_CATEGORIES[0],
    location: '测试地点',
    weight: '150.75',
    sliced: '是',
    certificateNumber: 'CERT-001',
    displayCase: 'B-02',
    saleStatus: '预留',
    discoveredDate: '2023-06-15',
    description: '详细描述',
    imageUrl: 'https://example.com/img.jpg',
    certificateInfo: '证书详情',
    errors: [],
    isValid: true,
    ...overrides,
  });

  it('正确转换有效行数据', () => {
    const rowData = createValidRowData('MET-CONV-001');
    const result = convertRowDataToMeteorite(rowData, 0);

    expect(result.id).toBe('MET-CONV-001');
    expect(result.name).toBe('测试陨石');
    expect(result.category).toBe(METEORITE_CATEGORIES[0]);
    expect(result.location).toBe('测试地点');
    expect(result.weight).toBe(150.75);
    expect(result.sliced).toBe(true);
    expect(result.certificateNumber).toBe('CERT-001');
    expect(result.displayCase).toBe('B-02');
    expect(result.saleStatus).toBe('reserved');
    expect(result.discoveredDate).toBe('2023-06-15');
    expect(result.description).toBe('详细描述');
    expect(result.imageUrl).toBe('https://example.com/img.jpg');
    expect(result.certificateInfo).toBe('证书详情');
    expect(result.saleStatusHistory).toHaveLength(1);
    expect(result.saleStatusHistory[0].meteoriteId).toBe('MET-CONV-001');
    expect(result.saleStatusHistory[0].toStatus).toBe('reserved');
    expect(result.saleStatusHistory[0].operator).toBe('批量导入');
  });

  it('处理切片状态的各种取值', () => {
    const testCases = [
      { input: '是', expected: true },
      { input: '已切片', expected: true },
      { input: 'true', expected: true },
      { input: '1', expected: true },
      { input: 'yes', expected: true },
      { input: '否', expected: false },
      { input: '', expected: false },
      { input: 'unknown', expected: false },
    ];

    testCases.forEach(({ input, expected }) => {
      const rowData = createValidRowData('MET-SLICE-001', { sliced: input });
      const result = convertRowDataToMeteorite(rowData, 0);
      expect(result.sliced).toBe(expected);
    });
  });

  it('转换销售状态', () => {
    const testCases = [
      { input: '在售', expected: 'available' },
      { input: 'available', expected: 'available' },
      { input: '预留', expected: 'reserved' },
      { input: 'reserved', expected: 'reserved' },
      { input: '已售出', expected: 'sold' },
      { input: 'sold', expected: 'sold' },
      { input: '', expected: 'available' },
      { input: 'unknown', expected: 'available' },
    ];

    testCases.forEach(({ input, expected }) => {
      const rowData = createValidRowData('MET-SALE-001', { saleStatus: input });
      const result = convertRowDataToMeteorite(rowData, 0);
      expect(result.saleStatus).toBe(expected);
    });
  });

  it('证书信息为空时使用证书编号生成默认值', () => {
    const rowData = createValidRowData('MET-CERT-001', {
      certificateInfo: '',
      certificateNumber: 'CERT-AUTO-001',
    });
    const result = convertRowDataToMeteorite(rowData, 0);
    expect(result.certificateInfo).toBe('证书编号: CERT-AUTO-001');
  });
});

describe('revalidatePreviewData', () => {
  const createRowData = (id: string, overrides: Partial<ImportRowData> = {}): ImportRowData => ({
    rowKey: `row-${id}`,
    rowNum: 2,
    id,
    name: '测试陨石',
    category: METEORITE_CATEGORIES[0],
    location: '测试地点',
    weight: '100',
    sliced: '否',
    certificateNumber: 'CERT-001',
    displayCase: 'A-01',
    saleStatus: '在售',
    discoveredDate: '2024-01-01',
    description: '描述',
    imageUrl: 'https://example.com/img.jpg',
    certificateInfo: '',
    errors: [],
    isValid: true,
    ...overrides,
  });

  it('编辑预览行后重新校验（修正错误）', () => {
    const row1 = createRowData('MET-REV-001');
    const row2 = createRowData('MET-REV-002', {
      category: '非法分类',
      weight: '-50',
      isValid: false,
      errors: [{ row: 3, field: '分类', message: '分类不合法' }],
    });
    const previousSelected = new Set([row1.rowKey]);

    const updatedRow2 = {
      ...row2,
      category: METEORITE_CATEGORIES[1],
      weight: '200.5',
    };
    const updatedAllRows = [row1, updatedRow2];

    const result = revalidatePreviewData(updatedAllRows, new Set(), previousSelected);

    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.allRows[1].isValid).toBe(true);
    expect(result.allRows[1].errors).toEqual([]);
    expect(result.selectedRowKeys.has(row1.rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(row2.rowKey)).toBe(false);
  });

  it('编辑后引入新错误', () => {
    const row = createRowData('MET-REV-003');
    const previousSelected = new Set([row.rowKey]);

    const updatedRow = { ...row, category: '坏分类', weight: '0' };
    const result = revalidatePreviewData([updatedRow], new Set<string>(), previousSelected);

    expect(result.validCount).toBe(0);
    expect(result.errorCount).toBe(1);
    expect(result.allRows[0].errors.some(e => e.field === '分类')).toBe(true);
    expect(result.allRows[0].errors.some(e => e.field === '重量')).toBe(true);
    expect(result.selectedRowKeys.has(row.rowKey)).toBe(false);
  });

  it('编辑后产生重复编号（与现有数据冲突）', () => {
    const row1 = createRowData('MET-REV-004');
    const row2 = createRowData('MET-REV-005', { id: 'MET-REV-005' });
    const previousSelected = new Set([row1.rowKey, row2.rowKey]);
    const existingIds = new Set(['MET-REV-006']);

    const updatedRow2 = { ...row2, id: 'MET-REV-006' };
    const result = revalidatePreviewData([row1, updatedRow2], existingIds, previousSelected);

    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateIds).toContain('MET-REV-006');
    expect(result.allRows[1].errors.some(e => e.field === '藏品编号' && e.message.includes('已存在'))).toBe(true);
    expect(result.selectedRowKeys.has(row1.rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(row2.rowKey)).toBe(false);
  });

  it('编辑后产生重复编号（CSV内部冲突）', () => {
    const row1 = createRowData('MET-REV-007');
    const row2 = createRowData('MET-REV-008');
    const previousSelected = new Set([row1.rowKey, row2.rowKey]);

    const updatedRow2 = { ...row2, id: 'MET-REV-007' };
    const result = revalidatePreviewData([row1, updatedRow2], new Set<string>(), previousSelected);

    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateIds).toContain('MET-REV-007');
    expect(result.allRows[0].isValid).toBe(true);
    expect(result.allRows[0].errors).toEqual([]);
    expect(result.allRows[1].isValid).toBe(false);
    expect(result.allRows[1].errors.some(e => e.field === '藏品编号' && e.message.includes('导入数据中重复'))).toBe(true);
    expect(result.selectedRowKeys.size).toBe(1);
    expect(result.selectedRowKeys.has(row1.rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(row2.rowKey)).toBe(false);
  });

  it('修正必填字段为空的错误', () => {
    const row = createRowData('MET-REV-009', {
      name: '',
      description: '',
      isValid: false,
      errors: [
        { row: 2, field: '名称', message: '名称不能为空' },
        { row: 2, field: '描述', message: '描述不能为空' },
      ],
    });
    const previousSelected = new Set<string>();

    const updatedRow = { ...row, name: '新名称', description: '新描述' };
    const result = revalidatePreviewData([updatedRow], new Set<string>(), previousSelected);

    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.allRows[0].isValid).toBe(true);
  });

  it('保持之前选中的行（如果仍然有效）', () => {
    const row1 = createRowData('MET-REV-010');
    const row2 = createRowData('MET-REV-011');
    const row3 = createRowData('MET-REV-012');
    const allRows = [row1, row2, row3];
    const previousSelected = new Set([row1.rowKey, row3.rowKey]);

    const result = revalidatePreviewData(allRows, new Set<string>(), previousSelected);

    expect(result.selectedRowKeys.has(row1.rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(row2.rowKey)).toBe(false);
    expect(result.selectedRowKeys.has(row3.rowKey)).toBe(true);
  });

  it('之前无选中时自动选中所有有效行', () => {
    const row1 = createRowData('MET-REV-013');
    const row2 = createRowData('MET-REV-014');
    const allRows = [row1, row2];
    const previousSelected = new Set<string>();

    const result = revalidatePreviewData(allRows, new Set(), previousSelected);

    expect(result.selectedRowKeys.has(row1.rowKey)).toBe(true);
    expect(result.selectedRowKeys.has(row2.rowKey)).toBe(true);
  });

  it('只导入被选中的有效行', () => {
    const row1 = createRowData('MET-SEL-IMP-001');
    const row2 = createRowData('MET-SEL-IMP-002', { category: '非法', isValid: false });
    const row3 = createRowData('MET-SEL-IMP-003');
    const allRows = [row1, row2, row3];
    const previousSelected = new Set([row1.rowKey]);

    const result = revalidatePreviewData(allRows, new Set<string>(), previousSelected);

    const selectedValidRows = result.allRows.filter(
      r => r.isValid && result.selectedRowKeys.has(r.rowKey)
    );
    expect(selectedValidRows).toHaveLength(1);
    expect(selectedValidRows[0].id).toBe('MET-SEL-IMP-001');

    const converted = selectedValidRows.map((r, i) => convertRowDataToMeteorite(r, i));
    expect(converted).toHaveLength(1);
    expect(converted[0].id).toBe('MET-SEL-IMP-001');
  });

  it('取消选中部分有效行后只导入选中的', () => {
    const row1 = createRowData('MET-SEL-IMP-004');
    const row2 = createRowData('MET-SEL-IMP-005');
    const row3 = createRowData('MET-SEL-IMP-006');
    const allRows = [row1, row2, row3];
    const previousSelected = new Set([row1.rowKey, row3.rowKey]);

    const result = revalidatePreviewData(allRows, new Set<string>(), previousSelected);

    const selectedValidRows = result.allRows.filter(
      r => r.isValid && result.selectedRowKeys.has(r.rowKey)
    );
    expect(selectedValidRows).toHaveLength(2);
    expect(selectedValidRows.map(r => r.id)).toEqual(expect.arrayContaining(['MET-SEL-IMP-004', 'MET-SEL-IMP-006']));
  });
});
