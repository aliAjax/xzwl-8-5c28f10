import { Clock, User, MessageSquare, ArrowRight, Calendar, UserPlus, Unlock } from 'lucide-react';
import { SaleStatusRecord, SaleStatus, SALE_STATUS_LABELS, SALE_STATUS_COLORS, formatDateTime } from '@/types';

interface SaleStatusTimelineProps {
  records: SaleStatusRecord[];
}

const SaleStatusTimeline = ({ records }: SaleStatusTimelineProps) => {
  const getStatusBadge = (status: SaleStatus | null) => {
    if (status === null) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600/50 text-gray-300">
          初始状态
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${SALE_STATUS_COLORS[status]}`}
      >
        {SALE_STATUS_LABELS[status]}
      </span>
    );
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-archive-cream/50">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无流转记录</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-archive-gold/30" />
      
      <div className="space-y-4">
        {sortedRecords.map((record, index) => (
          <div key={record.id} className="relative pl-10">
            <div
              className={`absolute left-2 top-2 w-5 h-5 rounded-full border-2 border-archive-gold/50 ${
                index === sortedRecords.length - 1
                  ? 'bg-archive-gold'
                  : 'bg-archive-card'
              }`}
            >
              {index === sortedRecords.length - 1 && (
                <div className="absolute inset-0 rounded-full bg-archive-gold animate-ping opacity-30" />
              )}
            </div>

            <div className="bg-archive-bg/50 rounded-lg p-4 archive-border">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {getStatusBadge(record.fromStatus)}
                <ArrowRight className="w-3 h-3 text-archive-gold/50" />
                {getStatusBadge(record.toStatus)}
              </div>

              <div className="flex items-center gap-2 text-xs text-archive-cream/50 mb-2">
                <Clock className="w-3 h-3" />
                <span>{formatDateTime(record.timestamp)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-archive-cream/50 mb-2">
                <User className="w-3 h-3" />
                <span>操作人：{record.operator}</span>
              </div>

              {record.remark && (
                <div className="flex items-start gap-2 text-sm text-archive-cream/70">
                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-archive-gold/50" />
                  <span>{record.remark}</span>
                </div>
              )}

              {record.reservationInfo && (
                <div className="mt-3 p-3 bg-archive-reserved/10 border border-archive-reserved/30 rounded-lg">
                  <p className="text-xs text-archive-reserved font-medium mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    预留信息
                  </p>
                  <div className="space-y-1 text-xs text-archive-cream/70">
                    <p className="flex items-center gap-2">
                      <UserPlus className="w-3 h-3 text-archive-gold/50" />
                      预留人：<span className="text-archive-cream">{record.reservationInfo.reservedBy}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-archive-gold/50" />
                      到期时间：<span className="text-archive-cream">{formatDateTime(record.reservationInfo.expiresAt)}</span>
                    </p>
                  </div>
                </div>
              )}

              {record.originalReservationInfo && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-400 font-medium mb-2 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    原预留信息
                  </p>
                  <div className="space-y-1 text-xs text-archive-cream/70">
                    <p className="flex items-center gap-2">
                      <UserPlus className="w-3 h-3 text-archive-gold/50" />
                      预留人：<span className="text-archive-cream">{record.originalReservationInfo.reservedBy}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-archive-gold/50" />
                      到期时间：<span className="text-archive-cream">{formatDateTime(record.originalReservationInfo.expiresAt)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleStatusTimeline;
