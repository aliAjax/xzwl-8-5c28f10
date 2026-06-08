import { useState } from 'react';
import { X, Save, AlertCircle, User, MessageSquare, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SaleStatus, SALE_STATUS_LABELS, VALID_STATUS_TRANSITIONS } from '@/types';

interface AddStatusRecordFormProps {
  meteoriteId: string;
  currentStatus: SaleStatus;
  initialTargetStatus?: SaleStatus;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddStatusRecordForm = ({
  meteoriteId,
  currentStatus,
  initialTargetStatus,
  onSuccess,
  onCancel,
}: AddStatusRecordFormProps) => {
  const { addSaleStatusRecord, cancelAddingStatusRecord } = useStore();
  const [newStatus, setNewStatus] = useState<SaleStatus>(initialTargetStatus || currentStatus);
  const [remark, setRemark] = useState('');
  const [operator, setOperator] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!operator.trim()) {
      setError('请输入操作人');
      setIsSubmitting(false);
      return;
    }

    const result = addSaleStatusRecord(
      meteoriteId,
      newStatus,
      remark.trim(),
      operator.trim()
    );

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.reason || '添加失败，请重试');
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    cancelAddingStatusRecord();
    onCancel?.();
  };

  return (
    <div className="bg-archive-card rounded-xl archive-border overflow-hidden">
      <div className="bg-gradient-to-r from-archive-gold/20 to-transparent px-5 py-4 border-b border-archive-gold/20">
        <h4 className="font-display text-lg font-semibold text-archive-cream flex items-center gap-2">
          <Tag className="w-5 h-5 text-archive-gold" />
          新增状态流转记录
        </h4>
        <p className="text-sm text-archive-cream/50 mt-1">
          当前状态：
          <span className="text-archive-gold font-medium">
            {SALE_STATUS_LABELS[currentStatus]}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="flex items-center gap-2 text-archive-cream/70 text-sm mb-2">
            <Tag className="w-4 h-4 text-archive-gold" />
            <span>目标状态 <span className="text-red-400">*</span></span>
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as SaleStatus)}
            className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
          >
            <option value="" disabled>
              请选择目标状态
            </option>
            {availableTransitions.map((status) => (
              <option key={status} value={status}>
                {SALE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {availableTransitions.length === 0 && (
            <p className="mt-2 text-amber-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              当前状态无可流转的目标状态
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-archive-cream/70 text-sm mb-2">
            <User className="w-4 h-4 text-archive-gold" />
            <span>操作人 <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            value={operator}
            onChange={(e) => {
              setOperator(e.target.value);
              if (error) setError('');
            }}
            placeholder="请输入操作人姓名"
            className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-archive-cream/70 text-sm mb-2">
            <MessageSquare className="w-4 h-4 text-archive-gold" />
            <span>备注说明</span>
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder="请输入状态变更的备注说明（可选）"
            className="w-full px-4 py-3 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:ring-2 focus:ring-archive-gold/30 focus:border-archive-gold/50 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-archive-bg/50 border border-archive-gold/20 rounded-lg text-archive-cream/70 hover:text-archive-cream hover:border-archive-gold/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting || availableTransitions.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? '提交中...' : '确认变更'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStatusRecordForm;
