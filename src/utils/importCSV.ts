import { Meteorite, MeteoriteCategory, SaleStatus, METEORITE_CATEGORIES, ImportError, ImportPreviewData, SaleStatusRecord, ImportRowData } from '@/types';

const HEADER_MAPPING: Record<string, string> = {
  '藏品编号': 'id',
  '编号': 'id',
  'id': 'id',
  'ID': 'id',
  '名称': 'name',
  '陨石名称': 'name',
  'name': 'name',
  '分类': 'category',
  '陨石分类': 'category',
  'category': 'category',
  '发现地': 'location',
  '地点': 'location',
  'location': 'location',
  '重量(g)': 'weight',
  '重量': 'weight',
  'weight': 'weight',
  '切片状态': 'sliced',
  '是否切片': 'sliced',
  'sliced': 'sliced',
  '证书编号': 'certificateNumber',
  '证书号': 'certificateNumber',
  'certificateNumber': 'certificateNumber',
  '展示柜': 'displayCase',
  '展柜': 'displayCase',
  'displayCase': 'displayCase',
  '出售状态': 'saleStatus',
  '销售状态': 'saleStatus',
  'saleStatus': 'saleStatus',
  '发现日期': 'discoveredDate',
  '日期': 'discoveredDate',
  'discoveredDate': 'discoveredDate',
  '描述': 'description',
  '藏品描述': 'description',
  'description': 'description',
  '图片地址': 'imageUrl',
  '图片': 'imageUrl',
  'imageUrl': 'imageUrl',
  '证书描述': 'certificateInfo',
  '证书信息': 'certificateInfo',
  'certificateInfo': 'certificateInfo',
};

const SALE_STATUS_REVERSE_MAP: Record<string, SaleStatus> = {
  '在售': 'available',
  'available': 'available',
  '预留': 'reserved',
  'reserved': 'reserved',
  '已售出': 'sold',
  'sold': 'sold',
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
};

export const parseCSV = (csvText: string): string[][] => {
  const cleanedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanedText) return [];
  
  const lines = cleanedText.split('\n').filter(line => line.trim());
  return lines.map(parseCSVLine);
};

const mapHeaders = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim();
    const mappedKey = HEADER_MAPPING[normalizedHeader] || HEADER_MAPPING[normalizedHeader.toLowerCase()];
    if (mappedKey) {
      mapping[index] = mappedKey;
    }
  });
  return mapping;
};

const validateRequiredFields = (data: Record<string, string>, rowNum: number): ImportError[] => {
  const errors: ImportError[] = [];
  const requiredFields = [
    { key: 'id', label: '藏品编号' },
    { key: 'name', label: '名称' },
    { key: 'category', label: '分类' },
    { key: 'location', label: '发现地' },
    { key: 'weight', label: '重量' },
    { key: 'certificateNumber', label: '证书编号' },
    { key: 'displayCase', label: '展示柜' },
    { key: 'discoveredDate', label: '发现日期' },
    { key: 'description', label: '描述' },
    { key: 'imageUrl', label: '图片地址' },
  ];
  
  requiredFields.forEach(field => {
    const value = data[field.key];
    if (!value || !value.trim()) {
      errors.push({
        row: rowNum,
        field: field.label,
        message: `${field.label}不能为空`,
        value: value,
      });
    }
  });
  
  return errors;
};

const validateWeight = (weightStr: string, rowNum: number): ImportError | null => {
  if (!weightStr || !weightStr.trim()) return null;
  
  const weight = parseFloat(weightStr);
  if (isNaN(weight) || weight <= 0) {
    return {
      row: rowNum,
      field: '重量',
      message: '重量必须为正数',
      value: weightStr,
    };
  }
  return null;
};

const validateCategory = (categoryStr: string, rowNum: number): ImportError | null => {
  if (!categoryStr || !categoryStr.trim()) return null;
  
  const trimmedCategory = categoryStr.trim() as MeteoriteCategory;
  if (!METEORITE_CATEGORIES.includes(trimmedCategory)) {
    return {
      row: rowNum,
      field: '分类',
      message: `分类"${categoryStr}"不合法，必须是以下之一: ${METEORITE_CATEGORIES.join(', ')}`,
      value: categoryStr,
    };
  }
  return null;
};

const parseSliced = (slicedStr: string): boolean => {
  if (!slicedStr) return false;
  const trimmed = slicedStr.trim().toLowerCase();
  return trimmed === '是' || trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === '已切片';
};

export const parseSaleStatus = (statusStr: string): SaleStatus => {
  if (!statusStr) return 'available';
  const trimmed = statusStr.trim();
  return SALE_STATUS_REVERSE_MAP[trimmed] || SALE_STATUS_REVERSE_MAP[trimmed.toLowerCase()] || 'available';
};

export const parseAndValidateCSV = (
  csvText: string,
  existingIds: Set<string>
): ImportPreviewData => {
  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return {
      headers: [],
      headerMapping: {},
      allRows: [],
      validRows: [],
      errorRows: [],
      duplicateIds: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      selectedRowIds: new Set(),
    };
  }
  
  const headers = rows[0];
  const headerMapping = mapHeaders(headers);
  const dataRows = rows.slice(1);
  
  const allRows: ImportRowData[] = [];
  const validRows: Meteorite[] = [];
  const errorRows: ImportError[] = [];
  const duplicateIds: string[] = [];
  const seenIds = new Set<string>();
  
  dataRows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 2;
    const data: Record<string, string> = {};
    
    Object.entries(headerMapping).forEach(([index, key]) => {
      data[key] = row[parseInt(index)] || '';
    });
    
    const rowErrors: ImportError[] = [];
    
    rowErrors.push(...validateRequiredFields(data, rowNum));
    
    const weightError = validateWeight(data.weight, rowNum);
    if (weightError) rowErrors.push(weightError);
    
    const categoryError = validateCategory(data.category, rowNum);
    if (categoryError) rowErrors.push(categoryError);
    
    const id = data.id?.trim() || '';
    if (id) {
      if (existingIds.has(id) || seenIds.has(id)) {
        rowErrors.push({
          row: rowNum,
          field: '藏品编号',
          message: `藏品编号"${id}"已存在`,
          value: id,
        });
        if (!duplicateIds.includes(id)) {
          duplicateIds.push(id);
        }
      } else {
        seenIds.add(id);
      }
    }
    
    const rowData: ImportRowData = {
      rowNum,
      id: data.id?.trim() || '',
      name: data.name?.trim() || '',
      category: data.category?.trim() || '',
      location: data.location?.trim() || '',
      weight: data.weight?.trim() || '',
      sliced: data.sliced?.trim() || '',
      certificateNumber: data.certificateNumber?.trim() || '',
      displayCase: data.displayCase?.trim() || '',
      saleStatus: data.saleStatus?.trim() || '',
      discoveredDate: data.discoveredDate?.trim() || '',
      description: data.description?.trim() || '',
      imageUrl: data.imageUrl?.trim() || '',
      certificateInfo: data.certificateInfo?.trim() || '',
      errors: rowErrors,
      isValid: rowErrors.length === 0,
    };
    allRows.push(rowData);
    
    if (rowErrors.length > 0) {
      errorRows.push(...rowErrors);
    } else {
      const saleStatus = parseSaleStatus(data.saleStatus);
      const initialHistory: SaleStatusRecord[] = [
        {
          id: `${id}-history-${Date.now()}-${rowIndex}`,
          meteoriteId: id,
          fromStatus: null,
          toStatus: saleStatus,
          timestamp: new Date().toISOString(),
          operator: '批量导入',
          remark: '藏品批量入库，初始状态',
        },
      ];
      const meteorite: Meteorite = {
        id: id,
        name: data.name.trim(),
        category: data.category.trim() as MeteoriteCategory,
        location: data.location.trim(),
        weight: parseFloat(data.weight),
        sliced: parseSliced(data.sliced),
        certificateNumber: data.certificateNumber.trim(),
        displayCase: data.displayCase.trim(),
        saleStatus: saleStatus,
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim(),
        certificateInfo: data.certificateInfo?.trim() || `证书编号: ${data.certificateNumber.trim()}`,
        discoveredDate: data.discoveredDate.trim(),
        saleStatusHistory: initialHistory,
      };
      validRows.push(meteorite);
    }
  });
  
  const selectedRowIds = new Set(validRows.map(m => m.id));
  
  return {
    headers,
    headerMapping,
    allRows,
    validRows,
    errorRows,
    duplicateIds,
    totalRows: dataRows.length,
    validCount: validRows.length,
    errorCount: errorRows.length > 0 ? new Set(errorRows.map(e => e.row)).size : 0,
    selectedRowIds,
  };
};

export const getRecognizedFields = (headerMapping: Record<string, string>): string[] => {
  return Object.values(headerMapping);
};

export const getMissingRequiredFields = (headerMapping: Record<string, string>): string[] => {
  const requiredFields = [
    'id', 'name', 'category', 'location', 'weight', 
    'certificateNumber', 'displayCase', 'discoveredDate',
    'description', 'imageUrl'
  ];
  const mappedFields = new Set(Object.values(headerMapping));
  return requiredFields.filter(field => !mappedFields.has(field));
};

export const validateSingleField = (
  field: string,
  value: string,
  rowNum: number
): ImportError | null => {
  switch (field) {
    case 'weight':
      return validateWeight(value, rowNum);
    case 'category':
      return validateCategory(value, rowNum);
    default:
      if (!value || !value.trim()) {
        const fieldLabels: Record<string, string> = {
          id: '藏品编号',
          name: '名称',
          category: '分类',
          location: '发现地',
          weight: '重量',
          certificateNumber: '证书编号',
          displayCase: '展示柜',
          discoveredDate: '发现日期',
          description: '描述',
          imageUrl: '图片地址',
        };
        return {
          row: rowNum,
          field: fieldLabels[field] || field,
          message: `${fieldLabels[field] || field}不能为空`,
          value: value,
        };
      }
      return null;
  }
};

export const generateInitialHistory = (id: string, saleStatus: SaleStatus, index: number): SaleStatusRecord[] => [
  {
    id: `${id}-history-${Date.now()}-${index}`,
    meteoriteId: id,
    fromStatus: null,
    toStatus: saleStatus,
    timestamp: new Date().toISOString(),
    operator: '批量导入',
    remark: '藏品批量入库，初始状态',
  },
];

export const convertRowDataToMeteorite = (rowData: ImportRowData, index: number): Meteorite => {
  const saleStatus = parseSaleStatus(rowData.saleStatus);
  const initialHistory = generateInitialHistory(rowData.id, saleStatus, index);
  
  return {
    id: rowData.id,
    name: rowData.name,
    category: rowData.category as MeteoriteCategory,
    location: rowData.location,
    weight: parseFloat(rowData.weight) || 0,
    sliced: parseSliced(rowData.sliced),
    certificateNumber: rowData.certificateNumber,
    displayCase: rowData.displayCase,
    saleStatus: saleStatus,
    description: rowData.description,
    imageUrl: rowData.imageUrl,
    certificateInfo: rowData.certificateInfo || `证书编号: ${rowData.certificateNumber}`,
    discoveredDate: rowData.discoveredDate,
    saleStatusHistory: initialHistory,
  };
};

export const revalidatePreviewData = (
  allRows: ImportRowData[],
  existingIds: Set<string>,
  previousSelectedIds: Set<string>
): Omit<ImportPreviewData, 'headers' | 'headerMapping' | 'totalRows'> => {
  const errorRows: ImportError[] = [];
  const duplicateIds: string[] = [];
  const seenIds = new Set<string>();
  const newValidRows: Meteorite[] = [];
  const newAllRows: ImportRowData[] = [];

  allRows.forEach((rowData, index) => {
    const rowNum = rowData.rowNum;
    const rowErrors: ImportError[] = [];

    const requiredFields = [
      { key: 'id', value: rowData.id },
      { key: 'name', value: rowData.name },
      { key: 'category', value: rowData.category },
      { key: 'location', value: rowData.location },
      { key: 'weight', value: rowData.weight },
      { key: 'certificateNumber', value: rowData.certificateNumber },
      { key: 'displayCase', value: rowData.displayCase },
      { key: 'discoveredDate', value: rowData.discoveredDate },
      { key: 'description', value: rowData.description },
      { key: 'imageUrl', value: rowData.imageUrl },
    ];

    requiredFields.forEach(({ key, value }) => {
      const error = validateSingleField(key, value, rowNum);
      if (error) rowErrors.push(error);
    });

    const weightError = validateWeight(rowData.weight, rowNum);
    if (weightError) rowErrors.push(weightError);

    const categoryError = validateCategory(rowData.category, rowNum);
    if (categoryError) rowErrors.push(categoryError);

    const id = rowData.id;
    if (id) {
      if (existingIds.has(id) || seenIds.has(id)) {
        const isDuplicateInBatch = seenIds.has(id);
        rowErrors.push({
          row: rowNum,
          field: '藏品编号',
          message: isDuplicateInBatch 
            ? `藏品编号"${id}"在导入数据中重复` 
            : `藏品编号"${id}"已存在`,
          value: id,
        });
        if (!duplicateIds.includes(id)) {
          duplicateIds.push(id);
        }
      } else {
        seenIds.add(id);
      }
    }

    const isValid = rowErrors.length === 0;
    const updatedRowData: ImportRowData = {
      ...rowData,
      errors: rowErrors,
      isValid,
    };
    newAllRows.push(updatedRowData);

    if (rowErrors.length > 0) {
      errorRows.push(...rowErrors);
    } else {
      const meteorite = convertRowDataToMeteorite(updatedRowData, index);
      newValidRows.push(meteorite);
    }
  });

  const newSelectedIds = new Set<string>();
  previousSelectedIds.forEach(id => {
    if (newValidRows.some(m => m.id === id)) {
      newSelectedIds.add(id);
    }
  });
  newValidRows.forEach(m => {
    if (previousSelectedIds.has(m.id) || !previousSelectedIds.size) {
      newSelectedIds.add(m.id);
    }
  });

  return {
    allRows: newAllRows,
    validRows: newValidRows,
    errorRows,
    duplicateIds,
    validCount: newValidRows.length,
    errorCount: errorRows.length > 0 ? new Set(errorRows.map(e => e.row)).size : 0,
    selectedRowIds: newSelectedIds,
  };
};
