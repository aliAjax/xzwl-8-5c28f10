import { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Scale,
  FileText,
  Calendar,
  Tag,
  Award,
  Package,
  ShoppingBag,
  Scissors,
  Hash,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle,
  Unlock,
  UserPlus,
  AlertTriangle,
  User,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SALE_STATUS_COLORS, SALE_STATUS_LABELS, SaleStatus, VALID_STATUS_TRANSITIONS, getReservedSubStatus, RESERVED_SUBSTATUS_LABELS, RESERVED_SUBSTATUS_TEXT_COLORS, formatDateTime } from '@/types';
import SaleStatusTimeline from './SaleStatusTimeline';
import AddStatusRecordForm from './AddStatusRecordForm';

const DetailModal = () => {
  const {
    isModalOpen,
    selectedMeteorite,
    closeModal,
    isAddingStatusRecord,
    pendingStatusRecord,
    getSaleStatusHistory,
    startAddingStatusRecord,
    cancelAddingStatusRecord,
    releaseReservation,
  } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [releaseOperator, setReleaseOperator] = useState('');
  const [releaseRemark, setReleaseRemark] = useState('');
  const [releaseError, setReleaseError] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, closeModal]);

  const handleClose = () => {
    if (isAddingStatusRecord) {
      const confirmed = window.confirm('正在添加状态记录，确定要关闭吗？未保存的更改将丢失。');
      if (!confirmed) return;
      cancelAddingStatusRecord();
    }
    closeModal();
  };

  const handleStartAddRecord = (targetStatus: SaleStatus) => {
    if (!selectedMeteorite) return;
    const started = startAddingStatusRecord(selectedMeteorite.id, targetStatus);
    if (!started) {
      alert('无法开始添加状态记录，请检查状态是否可跳转。');
    }
  };

  const handleRecordSuccess = () => {
    setSuccessMessage('状态流转记录已添加成功！');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRecordCancel = () => {
    cancelAddingStatusRecord();
  };

  const handleOpenReleaseDialog = () => {
    setShowReleaseDialog(true);
    setReleaseOperator('');
    setReleaseRemark('');
    setReleaseError('');
  };

  const handleCloseReleaseDialog = () => {
    setShowReleaseDialog(false);
    setReleaseOperator('');
    setReleaseRemark('');
    setReleaseError('');
  };

  const handleReleaseReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setReleaseError('');
    setIsReleasing(true);

    if (!releaseOperator.trim()) {
      setReleaseError('请输入操作人');
      setIsReleasing(false);
      return;
    }

    const result = releaseReservation(
      selectedMeteorite!.id,
      releaseRemark.trim(),
      releaseOperator.trim()
    );

    if (result.success) {
      setShowReleaseDialog(false);
      setSuccessMessage('预留已成功解除，状态已变更为在售！');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setReleaseError(result.reason || '解除失败，请重试');
    }
    setIsReleasing(false);
  };

  if (!isModalOpen || !selectedMeteorite) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-archive-bg/90 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-auto">
          <div className="lg:w-1/2 relative">
            <div className="sticky top-0 aspect-square lg:aspect-auto lg:h-full">
              <img
                src={selectedMeteorite.imageUrl}
                alt={selectedMeteorite.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-archive-card via-transparent to-transparent lg:bg-gradient-to-r" />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <div className="file-tag">{selectedMeteorite.id}</div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium text-white ${SALE_STATUS_COLORS[selectedMeteorite.saleStatus]}`}
                >
                  {SALE_STATUS_LABELS[selectedMeteorite.saleStatus]}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:pr-8">
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-archive-cream mb-2">
                  {selectedMeteorite.name}
                </h2>
                <p className="text-archive-gold font-medium">
                  {selectedMeteorite.category}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-archive-cream mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-archive-gold" />
                  <span>藏品描述</span>
                </h3>
                <p className="text-archive-cream/70 leading-relaxed">
                  {selectedMeteorite.description}
                </p>
              </div>

              <div className="gold-dashed-divider" />

              <div>
                <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-archive-gold" />
                  <span>基本信息</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border">
                    <div className="flex items-center space-x-2 text-archive-cream/50 text-xs mb-1">
                      <Hash className="w-3 h-3" />
                      <span>藏品编号</span>
                    </div>
                    <p className="text-archive-cream font-mono">{selectedMeteorite.id}</p>
                  </div>
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border">
                    <div className="flex items-center space-x-2 text-archive-cream/50 text-xs mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>发现地</span>
                    </div>
                    <p className="text-archive-cream text-sm">{selectedMeteorite.location}</p>
                  </div>
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border">
                    <div className="flex items-center space-x-2 text-archive-cream/50 text-xs mb-1">
                      <Scale className="w-3 h-3" />
                      <span>重量</span>
                    </div>
                    <p className="text-archive-cream">{selectedMeteorite.weight.toLocaleString()} 克</p>
                  </div>
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border">
                    <div className="flex items-center space-x-2 text-archive-cream/50 text-xs mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>发现日期</span>
                    </div>
                    <p className="text-archive-cream text-sm">{formatDate(selectedMeteorite.discoveredDate)}</p>
                  </div>
                </div>
              </div>

              <div className="gold-dashed-divider" />

              <div>
                <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-archive-gold" />
                  <span>状态信息</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border text-center">
                    <Scissors className="w-5 h-5 text-archive-gold mx-auto mb-2" />
                    <p className="text-xs text-archive-cream/50 mb-1">切片状态</p>
                    <p className="text-archive-cream font-medium text-sm">
                      {selectedMeteorite.sliced ? '已切片' : '完整个体'}
                    </p>
                  </div>
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border text-center">
                    <ShoppingBag className="w-5 h-5 text-archive-gold mx-auto mb-2" />
                    <p className="text-xs text-archive-cream/50 mb-1">出售状态</p>
                    {selectedMeteorite.saleStatus === 'reserved' ? (
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            RESERVED_SUBSTATUS_TEXT_COLORS[getReservedSubStatus(selectedMeteorite.reservationInfo) || 'normal']
                          }`}
                        >
                          {RESERVED_SUBSTATUS_LABELS[getReservedSubStatus(selectedMeteorite.reservationInfo) || 'normal']}
                        </p>
                        {selectedMeteorite.reservationInfo && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] text-archive-cream/50 flex items-center justify-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              预留人：{selectedMeteorite.reservationInfo.reservedBy}
                            </p>
                            <p className="text-[10px] text-archive-cream/50 flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" />
                              到期：{formatDateTime(selectedMeteorite.reservationInfo.expiresAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p
                        className={`font-medium text-sm ${
                          selectedMeteorite.saleStatus === 'available'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {SALE_STATUS_LABELS[selectedMeteorite.saleStatus]}
                      </p>
                    )}
                  </div>
                  <div className="bg-archive-bg/50 rounded-lg p-4 archive-border text-center">
                    <Hash className="w-5 h-5 text-archive-gold mx-auto mb-2" />
                    <p className="text-xs text-archive-cream/50 mb-1">展示柜</p>
                    <p className="text-archive-cream font-medium">{selectedMeteorite.displayCase}</p>
                  </div>
                </div>
              </div>

              <div className="gold-dashed-divider" />

              <div>
                <h3 className="font-display text-lg font-semibold text-archive-cream mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-archive-gold" />
                  <span>证书信息</span>
                </h3>
                <div className="bg-gradient-to-br from-archive-gold/10 to-transparent rounded-lg p-5 archive-border">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-archive-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-archive-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-archive-cream/50 text-sm">证书编号:</span>
                        <span className="text-archive-gold font-mono font-medium">
                          {selectedMeteorite.certificateNumber}
                        </span>
                      </div>
                      <p className="text-archive-cream/70 text-sm leading-relaxed">
                        {selectedMeteorite.certificateInfo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gold-dashed-divider" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold text-archive-cream flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-archive-gold" />
                    <span>销售流转记录</span>
                  </h3>
                  {!isAddingStatusRecord && (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedMeteorite.saleStatus === 'reserved' && (
                        <button
                          onClick={handleOpenReleaseDialog}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 bg-gradient-to-r from-amber-500 to-orange-500"
                        >
                          <Unlock className="w-3 h-3" />
                          一键解除预留
                        </button>
                      )}
                      {VALID_STATUS_TRANSITIONS[selectedMeteorite.saleStatus].length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-archive-cream/50">变更为：</span>
                          {VALID_STATUS_TRANSITIONS[selectedMeteorite.saleStatus].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStartAddRecord(status)}
                              disabled={isAddingStatusRecord}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 ${SALE_STATUS_COLORS[status]}`}
                            >
                              <Plus className="w-3 h-3" />
                              {SALE_STATUS_LABELS[status]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-archive-cream/40">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          已售出，不可变更
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {showSuccess && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-400">{successMessage}</p>
                  </div>
                )}

                {isAddingStatusRecord && pendingStatusRecord ? (
                  <AddStatusRecordForm
                    meteoriteId={selectedMeteorite.id}
                    currentStatus={pendingStatusRecord.originalStatus}
                    initialTargetStatus={pendingStatusRecord.newStatus}
                    onSuccess={handleRecordSuccess}
                    onCancel={handleRecordCancel}
                  />
                ) : (
                  <SaleStatusTimeline
                    records={getSaleStatusHistory(selectedMeteorite.id)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReleaseDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseReleaseDialog} />
          <div className="relative w-full max-w-md bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up">
            <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-archive-cream">解除预留</h2>
                  <p className="text-archive-cream/50 text-sm">将状态变更为在售</p>
                </div>
              </div>
              <button
                onClick={handleCloseReleaseDialog}
                className="w-8 h-8 rounded-full bg-archive-bg/50 flex items-center justify-center text-archive-cream/50 hover:text-archive-cream hover:bg-archive-bg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedMeteorite?.reservationInfo && (
              <div className="px-6 pt-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-400 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    原预留信息
                  </p>
                  <div className="space-y-1 text-sm text-archive-cream/70">
                    <p>预留人：<span className="text-archive-cream">{selectedMeteorite.reservationInfo.reservedBy}</span></p>
                    <p>到期时间：<span className="text-archive-cream">{formatDateTime(selectedMeteorite.reservationInfo.expiresAt)}</span></p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleReleaseReservation} className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-archive-cream/70 text-sm mb-2">
                  <User className="w-4 h-4 text-archive-gold" />
                  <span>操作人 <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={releaseOperator}
                  onChange={(e) => {
                    setReleaseOperator(e.target.value);
                    if (releaseError) setReleaseError('');
                  }}
                  placeholder="请输入操作人姓名"
                  className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-archive-cream/70 text-sm mb-2">
                  <MessageSquare className="w-4 h-4 text-archive-gold" />
                  <span>解除原因</span>
                </label>
                <textarea
                  value={releaseRemark}
                  onChange={(e) => setReleaseRemark(e.target.value)}
                  rows={3}
                  placeholder="请输入解除预留的原因（可选）"
                  className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all resize-none"
                />
              </div>

              {releaseError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{releaseError}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseReleaseDialog}
                  disabled={isReleasing}
                  className="px-5 py-2.5 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isReleasing}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Unlock className="w-4 h-4" />
                  {isReleasing ? '提交中...' : '确认解除'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailModal;
