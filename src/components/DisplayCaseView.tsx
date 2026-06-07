import { useMemo } from 'react';
import { Inbox, Archive, Scale, Package } from 'lucide-react';
import { Meteorite } from '@/types';
import { useStore } from '@/store/useStore';
import MiniMeteoriteCard from './MiniMeteoriteCard';

interface DisplayCaseGroup {
  displayCase: string;
  meteorites: Meteorite[];
  totalWeight: number;
}

const DisplayCaseView = () => {
  const meteoritesData = useStore((state) => state.meteorites);
  const filters = useStore((state) => state.filters);
  const getFilteredMeteorites = useStore((state) => state.getFilteredMeteorites);

  const filteredMeteorites = useMemo(() => {
    return getFilteredMeteorites();
  }, [meteoritesData, filters, getFilteredMeteorites]);

  const groupedByCase = filteredMeteorites.reduce<Record<string, DisplayCaseGroup>>((acc, meteorite) => {
    const caseKey = meteorite.displayCase || '未分组';
    if (!acc[caseKey]) {
      acc[caseKey] = {
        displayCase: caseKey,
        meteorites: [],
        totalWeight: 0,
      };
    }
    acc[caseKey].meteorites.push(meteorite);
    acc[caseKey].totalWeight += meteorite.weight;
    return acc;
  }, {});

  const sortedCases = Object.values(groupedByCase).sort((a, b) =>
    a.displayCase.localeCompare(b.displayCase, 'zh-CN')
  );

  if (sortedCases.length === 0) {
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
    <div className="space-y-8">
      {sortedCases.map((caseGroup, caseIndex) => (
        <div
          key={caseGroup.displayCase}
          className="bg-archive-card archive-border rounded-2xl overflow-hidden animate-slide-up"
          style={{ animationDelay: `${caseIndex * 80}ms` }}
        >
          <div className="bg-gradient-to-r from-archive-gold/15 to-transparent px-6 py-4 border-b border-archive-gold/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-archive-gold/20 rounded-xl flex items-center justify-center archive-border">
                  <Archive className="w-6 h-6 text-archive-gold" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-archive-cream flex items-center space-x-2">
                    <span className="text-archive-gold">展示柜</span>
                    <span>{caseGroup.displayCase}</span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-archive-bg/50 px-4 py-2 rounded-lg archive-border">
                  <Package className="w-4 h-4 text-archive-gold" />
                  <span className="text-archive-cream/60 text-sm">藏品数量</span>
                  <span className="text-archive-cream font-semibold text-lg">
                    {caseGroup.meteorites.length}
                  </span>
                  <span className="text-archive-cream/40 text-sm">件</span>
                </div>
                <div className="flex items-center space-x-2 bg-archive-bg/50 px-4 py-2 rounded-lg archive-border">
                  <Scale className="w-4 h-4 text-archive-gold" />
                  <span className="text-archive-cream/60 text-sm">总重量</span>
                  <span className="text-archive-cream font-semibold text-lg">
                    {caseGroup.totalWeight.toLocaleString()}
                  </span>
                  <span className="text-archive-cream/40 text-sm">克</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-archive-gold/30 scrollbar-track-transparent">
              {caseGroup.meteorites.map((meteorite) => (
                <MiniMeteoriteCard
                  key={meteorite.id}
                  meteorite={meteorite}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayCaseView;
