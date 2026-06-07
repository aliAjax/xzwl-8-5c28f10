import { Gem, Archive, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Header = () => {
  const { meteorites, getFilteredMeteorites, openAddModal } = useStore();
  const filteredCount = getFilteredMeteorites().length;
  const totalCount = meteorites.length;

  return (
    <header className="relative bg-gradient-to-b from-archive-card to-archive-bg border-b border-archive-gold/30 noise-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center shadow-lg shadow-archive-gold/30">
                <Gem className="w-7 h-7 text-archive-bg" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-archive-available rounded-full animate-pulse-gold border-2 border-archive-bg" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold gold-gradient-text tracking-wide">
                陨石收藏台账
              </h1>
              <p className="text-archive-cream/60 text-sm mt-1 font-light tracking-widest">
                METEORITE COLLECTION ARCHIVE
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <Archive className="w-4 h-4 text-archive-gold" />
                <span className="text-archive-gold text-sm font-medium">藏品总数</span>
              </div>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="font-display text-3xl font-bold text-archive-cream">
                  {filteredCount}
                </span>
                <span className="text-archive-cream/40 text-sm">/ {totalCount}</span>
              </div>
            </div>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-archive-gold/30 to-transparent" />

            <div className="hidden sm:block">
              <div className="text-xs text-archive-cream/40 uppercase tracking-wider mb-1">
                稀有度标识
              </div>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-archive-available" />
                  <span className="text-xs text-archive-cream/60">在售</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-archive-reserved" />
                  <span className="text-xs text-archive-cream/60">预留</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-archive-sold" />
                  <span className="text-xs text-archive-cream/60">已售</span>
                </div>
              </div>
            </div>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-archive-gold/30 to-transparent" />

            <button
              onClick={openAddModal}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-archive-gold to-archive-gold-light rounded-lg text-archive-bg font-semibold hover:shadow-lg hover:shadow-archive-gold/30 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新增藏品</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
