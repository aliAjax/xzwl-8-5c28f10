import { Meteorite, SALE_STATUS_LABELS } from '@/types';

const CSV_HEADERS = [
  '藏品编号',
  '名称',
  '分类',
  '发现地',
  '重量(g)',
  '切片状态',
  '证书编号',
  '展示柜',
  '出售状态',
  '发现日期',
];

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const formatMeteoriteRow = (meteorite: Meteorite): string[] => {
  return [
    meteorite.id,
    meteorite.name,
    meteorite.category,
    meteorite.location,
    meteorite.weight.toString(),
    meteorite.sliced ? '是' : '否',
    meteorite.certificateNumber,
    meteorite.displayCase,
    SALE_STATUS_LABELS[meteorite.saleStatus],
    meteorite.discoveredDate,
  ];
};

export const exportToCSV = (meteorites: Meteorite[], filename: string = '藏品列表'): void => {
  if (meteorites.length === 0) {
    return;
  }

  const rows = [
    CSV_HEADERS,
    ...meteorites.map(formatMeteoriteRow),
  ];

  const csvContent = rows
    .map(row => row.map(escapeCSV).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fullFilename = `${filename}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
