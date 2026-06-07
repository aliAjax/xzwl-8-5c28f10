import { useState, useEffect, useRef } from 'react';
import {
  Hash,
  Tag,
  MapPin,
  Scale,
  Calendar,
  Scissors,
  ShoppingBag,
  Award,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Meteorite, METEORITE_CATEGORIES, SALE_STATUS_LABELS, SaleStatus, MeteoriteCategory } from '@/types';

interface FormData {
  id: string;
  name: string;
  category: MeteoriteCategory;
  location: string;
  weight: string;
  sliced: boolean;
  certificateNumber: string;
  displayCase: string;
  saleStatus: SaleStatus;
  description: string;
  imageUrl: string;
  certificateInfo: string;
  discoveredDate: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  location?: string;
  weight?: string;
  certificateNumber?: string;
  displayCase?: string;
  description?: string;
  imageUrl?: string;
  discoveredDate?: string;
}

const EditMeteoriteForm = () => {
  const {
    selectedMeteorite,
    isEditing,
    updateMeteorite,
    cancelEditing,
    checkDuplicateId,
    getFilteredMeteorites,
  } = useStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const prevSaleStatusRef = useRef<SaleStatus | null>(null);

  useEffect(() => {
    if (isEditing && selectedMeteorite) {
      setFormData({
        id: selectedMeteorite.id,
        name: selectedMeteorite.name,
        category: selectedMeteorite.category,
        location: selectedMeteorite.location,
        weight: selectedMeteorite.weight.toString(),
        sliced: selectedMeteorite.sliced,
        certificateNumber: selectedMeteorite.certificateNumber,
        displayCase: selectedMeteorite.displayCase,
        saleStatus: selectedMeteorite.saleStatus,
        description: selectedMeteorite.description,
        imageUrl: selectedMeteorite.imageUrl,
        certificateInfo: selectedMeteorite.certificateInfo,
        discoveredDate: selectedMeteorite.discoveredDate,
      });
      prevSaleStatusRef.current = selectedMeteorite.saleStatus;
      setErrors({});
      setSubmitSuccess(false);
    }
  }, [isEditing, selectedMeteorite]);

  if (!isEditing || !selectedMeteorite || !formData) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = '编号不能为空';
    } else if (checkDuplicateId(formData.id.trim(), selectedMeteorite.id)) {
      newErrors.id = '该编号已存在，请使用其他编号';
    }

    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    }

    if (!formData.location.trim()) {
      newErrors.location = '发现地不能为空';
    }

    const weightNum = parseFloat(formData.weight);
    if (!formData.weight.trim()) {
      newErrors.weight = '重量不能为空';
    } else if (isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = '重量必须为正数';
    }

    if (!formData.certificateNumber.trim()) {
      newErrors.certificateNumber = '证书编号不能为空';
    }

    if (!formData.displayCase.trim()) {
      newErrors.displayCase = '展示柜不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '描述不能为空';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = '图片地址不能为空';
    }

    if (!formData.discoveredDate.trim()) {
      newErrors.discoveredDate = '发现日期不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'saleStatus' && prevSaleStatusRef.current === 'available' && (value === 'reserved' || value === 'sold')) {
      const confirmed = window.confirm(
        `确认将出售状态从"${SALE_STATUS_LABELS[prevSaleStatusRef.current]}"变更为"${SALE_STATUS_LABELS[value as SaleStatus]}"吗？`
      );
      if (!confirmed) {
        (e.target as HTMLSelectElement).value = prevSaleStatusRef.current;
        return;
      }
    }

    if (name === 'saleStatus') {
      prevSaleStatusRef.current = value as SaleStatus;
    }

    setFormData((prev) => ({
      ...prev!,
      [name]: newValue,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updates: Partial<Meteorite> = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      category: formData.category,
      location: formData.location.trim(),
      weight: parseFloat(formData.weight),
      sliced: formData.sliced,
      certificateNumber: formData.certificateNumber.trim(),
      displayCase: formData.displayCase.trim(),
      saleStatus: formData.saleStatus,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
      certificateInfo: formData.certificateInfo.trim() || `证书编号: ${formData.certificateNumber.trim()}`,
      discoveredDate: formData.discoveredDate,
    };

    updateMeteorite(selectedMeteorite.id, updates);
    setSubmitSuccess(true);

    setTimeout(() => {
      const filtered = getFilteredMeteorites();
      const stillInList = filtered.find((m) => m.id === formData.id.trim());
      if (!stillInList) {
        alert('保存成功！注意：该藏品已从当前筛选列表中消失，可能是因为筛选条件不匹配。');
      } else {
        alert('保存成功！');
      }
      cancelEditing();
    }, 1500);
  };

  const handleCancel = () => {
    cancelEditing();
  };

  return (
    <div className="w-full bg-archive-card rounded-2xl archive-border overflow-hidden shadow-xl shadow-black/30">
      <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-archive-bg" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-archive-cream">编辑藏品</h2>
            <p className="text-archive-cream/50 text-sm">修改陨石收藏信息</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {submitSuccess ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="font-display text-2xl font-bold text-archive-cream mb-2">保存成功</h3>
          <p className="text-archive-cream/60">藏品信息已成功更新...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="gold-dashed-divider" />

            <div>
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-archive-gold" />
                <span>基本信息</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Hash className="w-4 h-4 text-archive-gold" />
                    <span>藏品编号 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="例如：MET-2024-013"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.id
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.id && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.id}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Tag className="w-4 h-4 text-archive-gold" />
                    <span>名称 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="例如：阿林铁陨石"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Tag className="w-4 h-4 text-archive-gold" />
                    <span>分类 <span className="text-red-400">*</span></span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
                  >
                    {METEORITE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-archive-gold" />
                    <span>发现地 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="例如：俄罗斯 阿林"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.location
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.location}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Scale className="w-4 h-4 text-archive-gold" />
                    <span>重量（克） <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="例如：150"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.weight
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.weight && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.weight}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Calendar className="w-4 h-4 text-archive-gold" />
                    <span>发现日期 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="date"
                    name="discoveredDate"
                    value={formData.discoveredDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream focus:outline-none focus:ring-2 transition-all ${
                      errors.discoveredDate
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.discoveredDate && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.discoveredDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="gold-dashed-divider" />

            <div>
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-archive-gold" />
                <span>状态信息</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Scissors className="w-4 h-4 text-archive-gold" />
                    <span>是否切片</span>
                  </label>
                  <div className="flex items-center h-[50px] px-4 bg-archive-bg/50 border border-archive-gold/20 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="sliced"
                        checked={formData.sliced}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-archive-gold/30 bg-archive-bg text-archive-gold focus:ring-archive-gold/50"
                      />
                      <span className="text-archive-cream">{formData.sliced ? '已切片' : '完整个体'}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <ShoppingBag className="w-4 h-4 text-archive-gold" />
                    <span>出售状态</span>
                  </label>
                  <select
                    name="saleStatus"
                    value={formData.saleStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
                  >
                    <option value="available">{SALE_STATUS_LABELS.available}</option>
                    <option value="reserved">{SALE_STATUS_LABELS.reserved}</option>
                    <option value="sold">{SALE_STATUS_LABELS.sold}</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Hash className="w-4 h-4 text-archive-gold" />
                    <span>展示柜 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="displayCase"
                    value={formData.displayCase}
                    onChange={handleInputChange}
                    placeholder="例如：B-02"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.displayCase
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.displayCase && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.displayCase}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="gold-dashed-divider" />

            <div>
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-archive-gold" />
                <span>证书信息</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <Award className="w-4 h-4 text-archive-gold" />
                    <span>证书编号 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleInputChange}
                    placeholder="例如：IMCA-2024-00999"
                    className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                      errors.certificateNumber
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                    }`}
                  />
                  {errors.certificateNumber && (
                    <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.certificateNumber}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                    <FileText className="w-4 h-4 text-archive-gold" />
                    <span>证书描述</span>
                  </label>
                  <input
                    type="text"
                    name="certificateInfo"
                    value={formData.certificateInfo}
                    onChange={handleInputChange}
                    placeholder="证书详细信息（可选）"
                    className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="gold-dashed-divider" />

            <div>
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                <Image className="w-5 h-5 text-archive-gold" />
                <span>图片信息</span>
              </h3>
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                  <Image className="w-4 h-4 text-archive-gold" />
                  <span>图片地址 <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="例如：https://example.com/meteorite.jpg"
                  className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all ${
                    errors.imageUrl
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                  }`}
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.imageUrl}</span>
                  </p>
                )}
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="mt-3 relative aspect-video max-w-md bg-archive-bg/50 rounded-lg overflow-hidden archive-border">
                    <img
                      src={formData.imageUrl}
                      alt="预览"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-archive-cream/40 text-sm">
                      图片预览
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="gold-dashed-divider" />

            <div>
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-archive-gold" />
                <span>藏品描述</span>
              </h3>
              <div>
                <label className="flex items-center space-x-2 text-archive-cream/70 text-sm mb-2">
                  <FileText className="w-4 h-4 text-archive-gold" />
                  <span>描述 <span className="text-red-400">*</span></span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="请详细描述该陨石的特征、历史、科学价值等信息..."
                  className={`w-full px-4 py-3 bg-archive-bg/50 border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.description
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-archive-gold/20 focus:ring-archive-gold/30 focus:border-archive-gold/50'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-red-400 text-xs flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="gold-dashed-divider mt-8 mb-6" />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>取消</span>
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>保存修改</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditMeteoriteForm;
