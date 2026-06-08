import { useState, useEffect } from 'react';
import { Gem, Archive, Plus, Upload, BookOpen, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Header = () => {
  const { meteorites, getFilteredMeteorites, openAddModal, openBatchImportModal, openCertificateArchive, resetToMockData } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const filteredCount = getFilteredMeteorites().length;
  const totalCount = meteorites.length;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResetConfirm(false);
    };
    if (showResetConfirm) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showResetConfirm]);

  const handleResetConfirm = () => {
    resetToMockData();
    setShowResetConfirm(false);
  };

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
              onClick={openCertificateArchive}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-archive-card border border-archive-gold/40 rounded-lg text-archive-gold font-semibold hover:bg-archive-gold/10 hover:border-archive-gold/60 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">证书档案库</span>
            </button>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-archive-gold/30 to-transparent" />

            <button
              onClick={openBatchImportModal}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-archive-card border border-archive-gold/40 rounded-lg text-archive-gold font-semibold hover:bg-archive-gold/10 hover:border-archive-gold/60 transition-all"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">批量导入</span>
            </button>

            <button
              onClick={openAddModal}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-archive-gold to-archive-gold-light rounded-lg text-archive-bg font-semibold hover:shadow-lg hover:shadow-archive-gold/30 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新增藏品</span>
            </button>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-archive-gold/30 to-transparent" />

            <button
              onClick={() => setShowResetConfirm(true)}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-archive-card border border-red-500/40 rounded-lg text-red-400 font-semibold hover:bg-red-500/10 hover:border-red-500/60 transition-all"
              title="恢复初始示例数据"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">恢复初始数据</span>
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          <div className="absolute inset-0 bg-archive-bg/90 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-md bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-archive-cream">恢复初始数据</h2>
                  <p className="text-archive-cream/50 text-sm">重置所有数据到初始示例状态</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-archive-cream mb-2">
                  确认要恢复初始数据吗？
                </h3>
                  <p className="text-archive-cream/60 text-sm leading-relaxed">
                    此操作将：
                  </p>
                  <ul className="mt-3 space-y-1 text-archive-cream/50 text-sm">
                    <li>• 删除所有您新增、编辑、批量导入的藏品数据</li>
                    <li>• 重置所有展柜容量设置为默认值</li>
                    <li>• 清除所有保存的筛选视图</li>
                    <li>• 恢复到最初的 12 条示例藏品数据</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-6 py-3 bg-archive-bg/50 border border-archive-gold/30 rounded-lg text-archive-cream font-semibold hover:bg-archive-gold/10 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  确认恢复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
