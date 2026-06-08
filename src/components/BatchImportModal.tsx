import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Upload,
  Clipboard,
  CheckCircle,
  AlertCircle,
  Table,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  Tag,
  MapPin,
  Scale,
  Award,
  Package,
  ShoppingBag,
  Calendar,
  Image,
  Loader2,
  Download,
  Copy,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ImportPreviewData, SALE_STATUS_COLORS, ImportError, METEORITE_CATEGORIES } from '@/types';
import { parseAndValidateCSV, getRecognizedFields, getMissingRequiredFields, revalidatePreviewData, parseSaleStatus, convertRowDataToMeteorite } from '@/utils/importCSV';

const FIELD_LABELS: Record<string, string> = {
  id: '藏品编号',
  name: '名称',
  category: '分类',
  location: '发现地',
  weight: '重量',
  sliced: '切片状态',
  certificateNumber: '证书编号',
  displayCase: '展示柜',
  saleStatus: '出售状态',
  discoveredDate: '发现日期',
  description: '描述',
  imageUrl: '图片地址',
  certificateInfo: '证书描述',
};

const FIELD_ICONS: Record<string, React.ReactNode> = {
  id: <Hash className="w-3 h-3" />,
  name: <Tag className="w-3 h-3" />,
  category: <Package className="w-3 h-3" />,
  location: <MapPin className="w-3 h-3" />,
  weight: <Scale className="w-3 h-3" />,
  certificateNumber: <Award className="w-3 h-3" />,
  displayCase: <Package className="w-3 h-3" />,
  saleStatus: <ShoppingBag className="w-3 h-3" />,
  discoveredDate: <Calendar className="w-3 h-3" />,
  description: <FileText className="w-3 h-3" />,
  imageUrl: <Image className="w-3 h-3" />,
};

type Step = 'input' | 'preview' | 'importing' | 'success';

const BatchImportModal = () => {
  const { isBatchImportModalOpen, closeBatchImportModal, meteorites, batchAddMeteorites } = useStore();
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const existingIds = useMemo(() => new Set(meteorites.map(m => m.id)), [meteorites]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isBatchImportModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isBatchImportModalOpen]);

  useEffect(() => {
    if (isBatchImportModalOpen) {
      resetState();
    }
  }, [isBatchImportModalOpen]);

  const resetState = () => {
    setCsvText('');
    setStep('input');
    setPreviewData(null);
    setExpandedRows(new Set());
    setShowErrorDetails(false);
    setImportCount(0);
    setCopySuccess(false);
    setDownloadSuccess(false);
  };

  const CSV_FIELDS = [
    { key: 'id', label: '藏品编号' },
    { key: 'name', label: '名称' },
    { key: 'category', label: '分类' },
    { key: 'location', label: '发现地' },
    { key: 'weight', label: '重量(g)' },
    { key: 'sliced', label: '切片状态' },
    { key: 'certificateNumber', label: '证书编号' },
    { key: 'displayCase', label: '展示柜' },
    { key: 'saleStatus', label: '出售状态' },
    { key: 'discoveredDate', label: '发现日期' },
    { key: 'description', label: '描述' },
    { key: 'imageUrl', label: '图片地址' },
    { key: 'certificateInfo', label: '证书描述' },
  ];

  const generateCSVTemplate = (): string => {
    const header = CSV_FIELDS.map(f => f.label).join(',');
    return header + '\n';
  };

  const generateSampleData = (): string => {
    const header = CSV_FIELDS.map(f => f.label).join(',');

    const samples = [
      {
        id: 'MET-SAMPLE-001',
        name: '普通球粒陨石标本',
        category: METEORITE_CATEGORIES[0],
        location: '俄罗斯 车里雅宾斯克',
        weight: '125.5',
        sliced: '是',
        certificateNumber: 'IMCA-2024-12345',
        displayCase: 'A-01',
        saleStatus: '在售',
        discoveredDate: '2013-02-15',
        description: '经典L5型普通球粒陨石，2013年坠落于俄罗斯车里雅宾斯克州。本标本重量125.5克，具有清晰的熔壳和气印特征。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ordinary%20chondrite%20meteorite%20fragment%20with%20fusion%20crust%20on%20dark%20velvet%20background&image_size=square_hd',
        certificateInfo: '国际陨石收藏家协会(IMCA)认证证书，编号IMCA-2024-12345。类型L5，风化等级W1。',
      },
      {
        id: 'MET-SAMPLE-002',
        name: '穆瓦西拉铁陨石',
        category: METEORITE_CATEGORIES[3],
        location: '纳米比亚 霍巴',
        weight: '2500',
        sliced: '是',
        certificateNumber: 'MSN-2024-67890',
        displayCase: 'B-02',
        saleStatus: '预留',
        discoveredDate: '1920-06-15',
        description: '精品IVA组铁陨石切片，呈现经典的维德曼交角花纹。表面经过精细抛光和蚀刻处理，花纹清晰精美。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iron%20meteorite%20slice%20with%20Widmanstatten%20pattern%20polished%20etching%20museum%20display&image_size=square_hd',
        certificateInfo: '陨石学会(MSN)认证，编号MSN-2024-67890。IVA组铁陨石，镍含量7.9%。',
      },
      {
        id: 'MET-SAMPLE-003',
        name: '阿连德碳质球粒陨石',
        category: METEORITE_CATEGORIES[1],
        location: '墨西哥 奇瓦瓦州',
        weight: '45.2',
        sliced: '否',
        certificateNumber: 'IMCA-2024-54321',
        displayCase: 'C-03',
        saleStatus: '已售出',
        discoveredDate: '1969-02-08',
        description: '著名的CV3型碳质球粒陨石，1969年坠落于墨西哥。包含丰富的富钙铝包体(CAIs)，是太阳系最古老的物质之一。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=carbonaceous%20chondrite%20meteorite%20fragment%20showing%20chondrules%20dark%20background&image_size=square_hd',
        certificateInfo: '国际陨石收藏家协会(IMCA)认证证书，编号IMCA-2024-54321。类型CV3，含有多个毫米级CAIs。',
      },
    ];

    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = samples.map(sample =>
      CSV_FIELDS.map(f => escapeCSV(sample[f.key as keyof typeof sample] || '')).join(',')
    );

    return [header, ...rows].join('\n') + '\n';
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '陨石藏品导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleCopySampleData = async () => {
    const sampleData = generateSampleData();
    try {
      await navigator.clipboard.writeText(sampleData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert('复制失败，请手动复制以下内容：\n\n' + sampleData);
    }
  };

  const handleClose = () => {
    if (step !== 'importing') {
      closeBatchImportModal();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCsvText(text);
    } catch {
      alert('请手动粘贴CSV文本到输入框');
    }
  };

  const handlePreview = () => {
    if (!csvText.trim()) return;
    const result = parseAndValidateCSV(csvText, existingIds);
    setPreviewData(result);
    setStep('preview');
  };

  const handleBack = () => {
    setStep('input');
    setPreviewData(null);
  };

  const handleToggleRowSelection = (rowKey: string) => {
    if (!previewData) return;

    const row = previewData.allRows.find(r => r.rowKey === rowKey);
    if (!row || !row.isValid) return;

    const newSelected = new Set(previewData.selectedRowKeys);
    if (newSelected.has(rowKey)) {
      newSelected.delete(rowKey);
    } else {
      newSelected.add(rowKey);
    }
    setPreviewData({
      ...previewData,
      selectedRowKeys: newSelected,
    });
  };

  const handleSelectAll = () => {
    if (!previewData) return;
    const allValidKeys = new Set(previewData.allRows.filter(r => r.isValid).map(r => r.rowKey));
    setPreviewData({
      ...previewData,
      selectedRowKeys: allValidKeys,
    });
  };

  const handleDeselectAll = () => {
    if (!previewData) return;
    setPreviewData({
      ...previewData,
      selectedRowKeys: new Set(),
    });
  };

  const isAllSelected = useMemo(() => {
    if (!previewData) return false;
    const validRows = previewData.allRows.filter(r => r.isValid);
    if (validRows.length === 0) return false;
    return validRows.every(r => previewData.selectedRowKeys.has(r.rowKey));
  }, [previewData]);

  const selectedCount = useMemo(() => {
    if (!previewData) return 0;
    return previewData.selectedRowKeys.size;
  }, [previewData]);

  const hasErrors = useMemo(() => {
    if (!previewData) return false;
    return previewData.allRows.some(r => !r.isValid);
  }, [previewData]);

  const handleFieldEdit = (rowKey: string, field: string, value: string) => {
    if (!previewData) return;

    const updatedAllRows = previewData.allRows.map(row => {
      if (row.rowKey !== rowKey) return row;

      const updated = { ...row };
      switch (field) {
        case 'category':
          updated.category = value;
          break;
        case 'weight':
          updated.weight = value;
          break;
        case 'saleStatus':
          updated.saleStatus = value;
          break;
        case 'displayCase':
          updated.displayCase = value;
          break;
        case 'id':
          updated.id = value.trim();
          break;
        case 'name':
          updated.name = value.trim();
          break;
        case 'location':
          updated.location = value.trim();
          break;
        case 'certificateNumber':
          updated.certificateNumber = value.trim();
          break;
        case 'discoveredDate':
          updated.discoveredDate = value.trim();
          break;
        case 'description':
          updated.description = value.trim();
          break;
        case 'imageUrl':
          updated.imageUrl = value.trim();
          break;
      }
      return updated;
    });

    const revalidated = revalidatePreviewData(updatedAllRows, existingIds, previewData.selectedRowKeys);

    setPreviewData({
      ...previewData,
      ...revalidated,
    });
  };

  const handleImport = async () => {
    if (!previewData || previewData.selectedRowKeys.size === 0) return;

    setStep('importing');

    await new Promise(resolve => setTimeout(resolve, 800));

    const selectedRows = previewData.allRows
      .filter(row => row.isValid && previewData.selectedRowKeys.has(row.rowKey))
      .map((row, index) => convertRowDataToMeteorite(row, index));

    const count = batchAddMeteorites(selectedRows);
    setImportCount(count);
    setStep('success');
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const recognizedFields = previewData ? getRecognizedFields(previewData.headerMapping) : [];
  const missingFields = previewData ? getMissingRequiredFields(previewData.headerMapping) : [];

  const errorsByRow = useMemo(() => {
    if (!previewData) return new Map<number, ImportError[]>();
    const grouped = new Map<number, ImportError[]>();
    previewData.errorRows.forEach(error => {
      if (!grouped.has(error.row)) {
        grouped.set(error.row, []);
      }
      grouped.get(error.row)!.push(error);
    });
    return grouped;
  }, [previewData]);

  if (!isBatchImportModalOpen) return null;

  const renderInputStep = () => (
    <div className="p-6 space-y-6">
      <div className="gold-dashed-divider" />
      
      <div className="bg-archive-bg/50 rounded-xl p-5 archive-border">
        <h3 className="font-display text-lg font-semibold text-archive-cream mb-3 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-archive-gold" />
          <span>CSV格式说明</span>
        </h3>
        <p className="text-archive-cream/60 text-sm mb-3">
          请粘贴包含以下字段的CSV文本，第一行为表头。支持的字段名称：
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2 text-archive-cream/70">
              <span className="text-archive-gold">{FIELD_ICONS[key] || '•'}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-archive-gold/10 rounded-lg border border-archive-gold/20">
          <p className="text-archive-gold text-xs">
            <strong>必填字段：</strong>藏品编号、名称、分类、发现地、重量、证书编号、展示柜、发现日期、描述、图片地址
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              downloadSuccess
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-archive-gold/20 border border-archive-gold/30 text-archive-gold hover:bg-archive-gold/30'
            }`}
          >
            {downloadSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm">{downloadSuccess ? '下载成功' : '下载CSV模板'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySampleData}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              copySuccess
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-archive-gold/20 border border-archive-gold/30 text-archive-gold hover:bg-archive-gold/30'
            }`}
          >
            {copySuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-sm">{copySuccess ? '已复制到剪贴板' : '复制示例数据'}</span>
          </button>
        </div>

        <div className="mt-3 p-3 bg-archive-cream/5 rounded-lg border border-archive-cream/10">
          <p className="text-archive-cream/50 text-xs">
            <strong className="text-archive-cream/70">提示：</strong>
            下载模板后填入数据，或复制示例数据直接粘贴到下方输入框，点击"预览数据"即可验证导入流程。
            示例数据包含3条不同分类（{METEORITE_CATEGORIES[0]}、{METEORITE_CATEGORIES[3]}、{METEORITE_CATEGORIES[1]}）、
            不同销售状态（在售、预留、已售出）和标准证书格式（IMCA-2024-XXXXX、MSN-2024-XXXXX）的陨石数据。
          </p>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-archive-cream/70 text-sm mb-2">
          <span className="flex items-center space-x-2">
            <Clipboard className="w-4 h-4 text-archive-gold" />
            <span>粘贴CSV文本</span>
          </span>
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center space-x-1 px-3 py-1.5 bg-archive-gold/20 rounded-lg text-archive-gold text-xs hover:bg-archive-gold/30 transition-all"
          >
            <Clipboard className="w-3 h-3" />
            <span>从剪贴板粘贴</span>
          </button>
        </label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`藏品编号,名称,分类,发现地,重量(g),切片状态,证书编号,展示柜,出售状态,发现日期,描述,图片地址\nMET-001,示例陨石,普通球粒陨石,俄罗斯,150,否,IMCA-001,A-01,在售,2024-01-01,示例描述,https://example.com/image.jpg`}
          rows={12}
          className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all font-mono text-sm resize-none"
        />
        <p className="mt-2 text-archive-cream/40 text-xs">
          已输入 {csvText.split('\n').filter(l => l.trim()).length} 行
        </p>
      </div>

      <div className="gold-dashed-divider" />

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={!csvText.trim()}
          className="px-8 py-3 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Table className="w-5 h-5" />
          <span>预览数据</span>
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!previewData) return null;

    return (
      <div className="p-6 space-y-6">
        <div className="gold-dashed-divider" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-archive-bg/50 rounded-xl p-4 archive-border text-center">
            <p className="text-archive-cream/50 text-xs mb-1">数据总行数</p>
            <p className="font-display text-3xl font-bold text-archive-cream">{previewData.totalRows}</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 text-center">
            <p className="text-green-400/70 text-xs mb-1">可导入数量</p>
            <p className="font-display text-3xl font-bold text-green-400">{previewData.validCount}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
            <p className="text-blue-400/70 text-xs mb-1">已选择导入</p>
            <p className="font-display text-3xl font-bold text-blue-400">{selectedCount}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
            <p className="text-red-400/70 text-xs mb-1">错误行数</p>
            <p className="font-display text-3xl font-bold text-red-400">{previewData.errorCount}</p>
          </div>
          <div className="bg-archive-gold/10 rounded-xl p-4 border border-archive-gold/30 text-center">
            <p className="text-archive-gold/70 text-xs mb-1">重复编号</p>
            <p className="font-display text-3xl font-bold text-archive-gold">{previewData.duplicateIds.length}</p>
          </div>
        </div>

        <div className="bg-archive-bg/50 rounded-xl p-5 archive-border">
          <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-archive-gold" />
            <span>字段识别结果</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recognizedFields.map(field => (
              <div key={field} className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">{FIELD_LABELS[field] || field}</span>
              </div>
            ))}
            {missingFields.map(field => (
              <div key={field} className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">缺失: {FIELD_LABELS[field] || field}</span>
              </div>
            ))}
          </div>
        </div>

        {previewData.errorRows.length > 0 && (
          <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              <h3 className="font-display text-lg font-semibold text-red-400 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>错误行摘要 ({previewData.errorCount} 行存在问题)</span>
              </h3>
              <button className="text-red-400">
                {showErrorDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            {showErrorDetails && (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {Array.from(errorsByRow.entries()).map(([rowNum, errors]) => (
                  <div key={rowNum} className="bg-archive-bg/50 rounded-lg p-3 border border-red-500/20">
                    <p className="text-archive-cream font-medium text-sm mb-2">第 {rowNum} 行：</p>
                    <ul className="space-y-1">
                      {errors.map((error: ImportError, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>{error.field}</strong>: {error.message}
                            {error.value !== undefined && ` (值: "${error.value}")`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {previewData.allRows.length > 0 && (
          <div className="bg-archive-bg/50 rounded-xl p-5 archive-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-archive-cream flex items-center space-x-2">
                {hasErrors ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <span>数据预览 ({previewData.allRows.length} 条，有效 {previewData.validCount} 条，已选择 {selectedCount} 条)</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-xs bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                >
                  全选有效
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 text-xs bg-archive-cream/10 border border-archive-cream/20 text-archive-cream/70 rounded-lg hover:bg-archive-cream/20 transition-all"
                >
                  取消全选
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-archive-card">
                  <tr className="text-archive-cream/50 text-xs uppercase tracking-wider">
                    <th className="px-3 py-2 text-left w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        className="w-4 h-4 accent-archive-gold rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-2 text-left w-10"></th>
                    <th className="px-3 py-2 text-left">行号</th>
                    <th className="px-3 py-2 text-left">编号</th>
                    <th className="px-3 py-2 text-left">名称</th>
                    <th className="px-3 py-2 text-left">分类</th>
                    <th className="px-3 py-2 text-left">重量(g)</th>
                    <th className="px-3 py-2 text-left">展示柜</th>
                    <th className="px-3 py-2 text-left">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-archive-gold/10">
                  {previewData.allRows.map((row, index) => {
                    const hasError = !row.isValid;
                    const isSelected = previewData.selectedRowKeys.has(row.rowKey);
                    const saleStatusValue = parseSaleStatus(row.saleStatus);

                    return (
                      <React.Fragment key={row.rowKey}>
                        <tr
                          className={`hover:bg-archive-gold/5 transition-colors ${
                            hasError ? 'bg-red-500/5' : !isSelected ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleRowSelection(row.rowKey)}
                              disabled={hasError}
                              className={`w-4 h-4 accent-archive-gold rounded ${
                                hasError ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2" onClick={() => toggleRow(index)}>
                            {expandedRows.has(index) ? (
                              <ChevronUp className="w-4 h-4 text-archive-gold cursor-pointer" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-archive-gold cursor-pointer" />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {hasError ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                第{row.rowNum}行
                              </span>
                            ) : (
                              <span className="text-archive-cream/50 text-xs">第{row.rowNum}行</span>
                            )}
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={row.id}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'id', e.target.value)}
                              className={`w-full px-2 py-1 rounded text-sm font-mono focus:outline-none focus:ring-2 ${
                                row.errors.some(e => e.field === '藏品编号')
                                  ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                  : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                              }`}
                              placeholder="藏品编号"
                            />
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'name', e.target.value)}
                              className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                row.errors.some(e => e.field === '名称')
                                  ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                  : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                              }`}
                              placeholder="名称"
                            />
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={row.category || ''}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'category', e.target.value)}
                              className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 cursor-pointer ${
                                row.errors.some(e => e.field === '分类')
                                  ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                  : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                              }`}
                            >
                              <option value="">请选择分类</option>
                              {METEORITE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              value={row.weight}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'weight', e.target.value)}
                              className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                row.errors.some(e => e.field === '重量')
                                  ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                  : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                              }`}
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={row.displayCase}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'displayCase', e.target.value)}
                              className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                row.errors.some(e => e.field === '展示柜')
                                  ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                  : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                              }`}
                              placeholder="例如: A-01"
                            />
                          </td>
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={saleStatusValue}
                              onChange={(e) => handleFieldEdit(row.rowKey, 'saleStatus', e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-medium text-white border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-archive-gold/50 ${SALE_STATUS_COLORS[saleStatusValue]}`}
                            >
                              <option value="available">在售</option>
                              <option value="reserved">预留</option>
                              <option value="sold">已售出</option>
                            </select>
                          </td>
                        </tr>
                        {expandedRows.has(index) && (
                          <tr>
                            <td colSpan={9} className="px-3 py-4 bg-archive-bg/30">
                              {hasError && row.errors.length > 0 && (
                                <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                  <p className="text-red-400 text-xs font-semibold mb-2">错误信息：</p>
                                  <ul className="space-y-1">
                                    {row.errors.map((error, errIdx) => (
                                      <li key={errIdx} className="flex items-start space-x-2 text-red-400 text-xs">
                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>
                                          <strong>{error.field}</strong>: {error.message}
                                          {error.value !== undefined && ` (原值: "${error.value}")`}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <p className="text-archive-cream/50 text-xs mb-1">发现地</p>
                                  <input
                                    type="text"
                                    value={row.location}
                                    onChange={(e) => handleFieldEdit(row.rowKey, 'location', e.target.value)}
                                    className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                      row.errors.some(e => e.field === '发现地')
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                        : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                                    }`}
                                    placeholder="发现地"
                                  />
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <p className="text-archive-cream/50 text-xs mb-1">发现日期</p>
                                  <input
                                    type="text"
                                    value={row.discoveredDate}
                                    onChange={(e) => handleFieldEdit(row.rowKey, 'discoveredDate', e.target.value)}
                                    className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                      row.errors.some(e => e.field === '发现日期')
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                        : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                                    }`}
                                    placeholder="YYYY-MM-DD"
                                  />
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <p className="text-archive-cream/50 text-xs mb-1">证书编号</p>
                                  <input
                                    type="text"
                                    value={row.certificateNumber}
                                    onChange={(e) => handleFieldEdit(row.rowKey, 'certificateNumber', e.target.value)}
                                    className={`w-full px-2 py-1 rounded text-sm font-mono focus:outline-none focus:ring-2 ${
                                      row.errors.some(e => e.field === '证书编号')
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                        : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                                    }`}
                                    placeholder="证书编号"
                                  />
                                </div>
                                <div>
                                  <p className="text-archive-cream/50 text-xs mb-1">切片状态</p>
                                  <p className="text-archive-cream">{row.sliced ? '已切片' : '完整个体'}</p>
                                </div>
                                <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-archive-cream/50 text-xs mb-1">描述</p>
                                  <input
                                    type="text"
                                    value={row.description}
                                    onChange={(e) => handleFieldEdit(row.rowKey, 'description', e.target.value)}
                                    className={`w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 ${
                                      row.errors.some(e => e.field === '描述')
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                        : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                                    }`}
                                    placeholder="描述"
                                  />
                                </div>
                                <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-archive-cream/50 text-xs mb-1">图片地址</p>
                                  <input
                                    type="text"
                                    value={row.imageUrl}
                                    onChange={(e) => handleFieldEdit(row.rowKey, 'imageUrl', e.target.value)}
                                    className={`w-full px-2 py-1 rounded text-sm font-mono focus:outline-none focus:ring-2 ${
                                      row.errors.some(e => e.field === '图片地址')
                                        ? 'bg-red-500/10 border border-red-500/50 text-red-400 focus:ring-red-500/50'
                                        : 'bg-archive-bg/50 border border-archive-gold/30 text-archive-cream focus:ring-archive-gold/50'
                                    }`}
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400/80 text-xs flex items-start space-x-2">
                <span>💡</span>
                <span>提示：红色标记的行存在错误，可直接在表格中修改所有字段（<strong>编号</strong>、<strong>名称</strong>、<strong>分类</strong>、<strong>重量</strong>、<strong>展示柜</strong>、<strong>销售状态</strong>等），修正后系统会自动重新验证。勾选的有效行才会被导入。</span>
              </p>
            </div>
          </div>
        )}

        <div className="gold-dashed-divider" />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all"
          >
            返回修改
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={selectedCount === 0}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            <span>确认导入 {selectedCount} 条数据</span>
          </button>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="p-12 text-center">
      <div className="w-20 h-20 bg-archive-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-10 h-10 text-archive-gold animate-spin" />
      </div>
      <h3 className="font-display text-2xl font-bold text-archive-cream mb-2">正在导入...</h3>
      <p className="text-archive-cream/60">请稍候，正在批量导入藏品数据</p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="p-12 text-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      <h3 className="font-display text-2xl font-bold text-archive-cream mb-2">导入成功</h3>
      <p className="text-archive-cream/60 mb-6">
        成功导入 <span className="text-green-400 font-bold">{importCount}</span> 条藏品数据
      </p>
      <p className="text-archive-cream/40 text-sm mb-8">
        统计看板、筛选、证书查询和展示柜视图已自动更新
      </p>
      <button
        type="button"
        onClick={handleClose}
        className="px-8 py-3 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all"
      >
        完成
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-archive-bg/90 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-6xl max-h-[90vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-archive-bg" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-archive-cream">批量导入预览</h2>
              <p className="text-archive-cream/50 text-sm">
                {step === 'input' && '粘贴CSV文本，开始批量导入'}
                {step === 'preview' && '确认数据后导入'}
                {step === 'importing' && '正在导入数据'}
                {step === 'success' && '导入完成'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'importing'}
            className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 'input' && renderInputStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;
