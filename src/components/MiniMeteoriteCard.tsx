import { Eye } from 'lucide-react';
import { Meteorite, SALE_STATUS_COLORS } from '@/types';
import { useStore } from '@/store/useStore';

interface MiniMeteoriteCardProps {
  meteorite: Meteorite;
}

const MiniMeteoriteCard = ({ meteorite }: MiniMeteoriteCardProps) => {
  const { openModal } = useStore();

  return (
    <div
      onClick={() => openModal(meteorite)}
      className="group relative bg-archive-bg/60 archive-border rounded-lg overflow-hidden cursor-pointer card-hover flex-shrink-0 w-28"
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-1.5">
        <div
          className={`px-1.5 py-0.5 rounded text-xs font-medium text-white ${SALE_STATUS_COLORS[meteorite.saleStatus]}`}
        >
          {meteorite.saleStatus === 'available' ? '在售' : meteorite.saleStatus === 'reserved' ? '预留' : '已售'}
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden">
        <img
          src={meteorite.imageUrl}
          alt={meteorite.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-archive-card via-transparent to-transparent opacity-70" />
        <div className="absolute inset-0 bg-archive-gold/0 group-hover:bg-archive-gold/15 transition-colors duration-300" />
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-7 h-7 bg-archive-gold/90 rounded-full flex items-center justify-center shadow-lg">
            <Eye className="w-3.5 h-3.5 text-archive-bg" />
          </div>
        </div>
      </div>

      <div className="p-2">
        <h4 className="font-display text-sm font-medium text-archive-cream truncate group-hover:text-archive-gold transition-colors">
          {meteorite.name}
        </h4>
        <p className="text-xs text-archive-cream/50 truncate">
          {meteorite.weight.toLocaleString()} 克
        </p>
      </div>
    </div>
  );
};

export default MiniMeteoriteCard;
