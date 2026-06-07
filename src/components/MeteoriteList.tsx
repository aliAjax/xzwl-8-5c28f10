import { Inbox } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MeteoriteCard from './MeteoriteCard';

const MeteoriteList = () => {
  const allMeteorites = useStore((state) => state.meteorites);
  const filters = useStore((state) => state.filters);
  const meteorites = allMeteorites.filter((meteorite) => {
    const categoryMatch = filters.category === 'all' || meteorite.category === filters.category;
    const weightMatch = meteorite.weight >= filters.minWeight && meteorite.weight <= filters.maxWeight;
    const statusMatch = filters.saleStatus === 'all' || meteorite.saleStatus === filters.saleStatus;

    return categoryMatch && weightMatch && statusMatch;
  });

  if (meteorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-archive-card rounded-full flex items-center justify-center mb-6 archive-border">
          <Inbox className="w-10 h-10 text-archive-gold/50" />
        </div>
        <h3 className="font-display text-xl font-semibold text-archive-cream mb-2">
          未找到匹配的藏品
        </h3>
        <p className="text-archive-cream/50 max-w-md">
          请尝试调整筛选条件，或点击"重置筛选"查看全部藏品
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {meteorites.map((meteorite, index) => (
        <MeteoriteCard
          key={meteorite.id}
          meteorite={meteorite}
          index={index}
        />
      ))}
    </div>
  );
};

export default MeteoriteList;
