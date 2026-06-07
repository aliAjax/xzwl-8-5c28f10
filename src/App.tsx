import Header from '@/components/Header';
import FilterPanel from '@/components/FilterPanel';
import CertificateSearch from '@/components/CertificateSearch';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import MeteoriteList from '@/components/MeteoriteList';
import DisplayCaseView from '@/components/DisplayCaseView';
import ViewToggle from '@/components/ViewToggle';
import DetailModal from '@/components/DetailModal';
import AddMeteoriteModal from '@/components/AddMeteoriteModal';
import CertificateArchive from '@/components/CertificateArchive';
import { useStore } from '@/store/useStore';

function App() {
  const viewMode = useStore((state) => state.viewMode);

  return (
    <div className="min-h-screen bg-archive-bg noise-overlay">
      <Header />
      <FilterPanel />
      <CertificateSearch />
      <StatisticsDashboard />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ViewToggle />
        {viewMode === 'list' ? <MeteoriteList /> : <DisplayCaseView />}
      </main>

      <footer className="border-t border-archive-gold/20 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-archive-cream/30 text-sm">
            © 2024 陨石收藏台账 · Meteorite Collection Archive
          </p>
          <p className="text-archive-cream/20 text-xs mt-1">
            专业陨石收藏管理系统
          </p>
        </div>
      </footer>

      <DetailModal />
      <AddMeteoriteModal />
      <CertificateArchive />
    </div>
  );
}

export default App;
