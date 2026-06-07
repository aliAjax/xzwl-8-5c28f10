import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Hash,
  MapPin,
  Scale,
  FileText,
  Calendar,
  Tag,
  Award,
  Package,
  ShoppingBag,
  Scissors,
  Image,
  CheckCircle,
  AlertCircle,
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
  category?: string;
  location?: string;
  weight?: string;
  certificateNumber?: string;
  displayCase?: string;
  description?: string;
  imageUrl?: string;
  discoveredDate?: string;
}

const AddMeteoriteModal = () => {
  const { isAddModalOpen, closeAddModal, addMeteorite, checkDuplicateId } = useStore();
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    category: '普通球粒陨石',
    location: '',
    weight: '',
    sliced: false,
    certificateNumber: '',
    displayCase: '',
    saleStatus: 'available',
    description: '',
    imageUrl: '',
    certificateInfo: '',
    discoveredDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddModal();
    };
    if (isAddModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, closeAddModal]);

  useEffect(() => {
    if (isAddModalOpen) {
      setFormData({
        id: '',
        name: '',
        category: '普通球粒陨石',
        location: '',
        weight: '',
        sliced: false,
        certificateNumber: '',
        displayCase: '',
        saleStatus: 'available',
        description: '',
        imageUrl: '',
        certificateInfo: '',
        discoveredDate: '',
      });
      setErrors({});
      setSubmitSuccess(false);
    }
  }, [isAddModalOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = '编号不能为空';
    } else if (checkDuplicateId(formData.id.trim())) {
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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

    const newMeteorite: Meteorite = {
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

    addMeteorite(newMeteorite);
    setSubmitSuccess(true);

    setTimeout(() => {
      closeAddModal();
    }, 1500);
  };

  if (!isAddModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={closeAddModal}
    >
      <div className="absolute inset-0 bg-archive-bg/90 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-archive-bg" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-archive-cream">新增藏品</h2>
              <p className="text-archive-cream/50 text-sm">录入新的陨石收藏信息</p>
            </div>
          </div>
          <button
            onClick={closeAddModal}
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
            <h3 className="font-display text-2xl font-bold text-archive-cream mb-2">录入成功</h3>
            <p className="text-archive-cream/60">藏品信息已成功添加，正在返回...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
                      <Package className="w-4 h-4 text-archive-gold" />
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
                onClick={closeAddModal}
                className="px-6 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>提交录入</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMeteoriteModal;
