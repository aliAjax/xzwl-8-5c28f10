import { MapPin, Scale, FileText, Eye, Clock, AlertTriangle } from 'lucide-react';
import { Meteorite, SALE_STATUS_COLORS, SALE_STATUS_LABELS, getReservedSubStatus, RESERVED_SUBSTATUS_LABELS, RESERVED_SUBSTATUS_COLORS, formatDateTime } from '@/types';
import { useStore } from '@/store/useStore';

interface MeteoriteCardProps {
  meteorite: Meteorite;
  index: number;
}

const MeteoriteCard = ({ meteorite, index }: MeteoriteCardProps) => {
  const { openModal } = useStore();

  const reservedSubStatus = meteorite.saleStatus === 'reserved' 
    ? getReservedSubStatus(meteorite.reservationInfo) 
    : null;

  const getStatusBadge = () => {
    if (meteorite.saleStatus !== 'reserved' || !reservedSubStatus) {
      return (
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${SALE_STATUS_COLORS[meteorite.saleStatus]}`}
        >
          {SALE_STATUS_LABELS[meteorite.saleStatus]}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-1">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${RESERVED_SUBSTATUS_COLORS[reservedSubStatus]} flex items-center gap-1`}
        >
          {reservedSubStatus === 'expired' && <AlertTriangle className="w-3 h-3" />}
          {reservedSubStatus === 'expiringSoon' && <Clock className="w-3 h-3" />}
          {RESERVED_SUBSTATUS_LABELS[reservedSubStatus]}
        </div>
        {meteorite.reservationInfo && (
          <div className="text-[10px] text-archive-cream/60">
            {meteorite.reservationInfo.reservedBy} · {formatDateTime(meteorite.reservationInfo.expiresAt)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={() => openModal(meteorite)}
      className="group relative bg-archive-card archive-border rounded-xl overflow-hidden cursor-pointer card-hover animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-3">
        <div className="file-tag">
          {meteorite.id}
        </div>
        {getStatusBadge()}
      </div>

      <div className="relative aspect-square overflow-hidden">
        <img
          src={meteorite.imageUrl}
          alt={meteorite.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-archive-card via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-archive-gold/0 group-hover:bg-archive-gold/10 transition-colors duration-300" />
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 bg-archive-gold/90 rounded-full flex items-center justify-center shadow-lg">
            <Eye className="w-5 h-5 text-archive-bg" />
          </div>
        </div>
      </div>

      <div className="p-4 relative z-10">
        <h3 className="font-display text-lg font-semibold text-archive-cream mb-2 group-hover:text-archive-gold transition-colors">
          {meteorite.name}
        </h3>

        <div className="gold-dashed-divider my-3" />

        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-archive-gold/70 flex-shrink-0" />
            <span className="text-archive-cream/60">{meteorite.category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-archive-gold/70 flex-shrink-0" />
            <span className="text-archive-cream/60 truncate">{meteorite.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-archive-gold/70 flex-shrink-0" />
            <span className="text-archive-cream/60">{meteorite.weight.toLocaleString()} 克</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-archive-cream/40">
          <span>展示柜: {meteorite.displayCase}</span>
          <span>{meteorite.sliced ? '已切片' : '完整个体'}</span>
        </div>
      </div>
    </div>
  );
};

export default MeteoriteCard;
