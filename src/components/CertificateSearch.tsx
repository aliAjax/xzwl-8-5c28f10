import { useState } from 'react';
import { Search, Award, FileText, X, Eye, AlertCircle, Layers, Building2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Meteorite } from '@/types';

const extractCertAgency = (certInfo: string): string => {
  const match = certInfo.match(/^([^，。]+认证[^，。]*)/);
  if (match) {
    return match[1].trim();
  }
  const shortMatch = certInfo.match(/^([^，。]+)/);
  return shortMatch ? shortMatch[1].trim() : certInfo;
};

const extractAgencyName = (certInfo: string): string => {
  const patterns = [
    /国际陨石收藏家协会\(IMCA\)/,
    /陨石学会\(MSN\)/,
    /全球陨石协会\(GMA\)/,
    /\(IMCA\)/,
    /\(MSN\)/,
    /\(GMA\)/,
  ];
  
  for (const pattern of patterns) {
    const match = certInfo.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  const agencyMatch = certInfo.match(/^([^，。(（]+)/);
  return agencyMatch ? agencyMatch[1].trim() : '未知机构';
};

interface SearchResultItemProps {
  meteorite: Meteorite;
  onViewDetail: () => void;
}

const SearchResultItem = ({ meteorite, onViewDetail }: SearchResultItemProps) => {
  const agency = extractAgencyName(meteorite.certificateInfo);
  
  return (
    <div 
      className="group bg-archive-card archive-border rounded-xl p-4 card-hover cursor-pointer transition-all duration-300 hover:border-archive-gold/50"
      onClick={onViewDetail}
    >
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg archive-border">
          <img
            src={meteorite.imageUrl}
            alt={meteorite.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-archive-cream mb-1 group-hover:text-archive-gold transition-colors truncate">
                {meteorite.name}
              </h3>
              <p className="text-archive-gold font-mono text-xs">
                {meteorite.certificateNumber}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1.5 bg-archive-gold/10 text-archive-gold text-xs rounded-md hover:bg-archive-gold/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>详情</span>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1 text-archive-cream/50">
              <Building2 className="w-3 h-3 text-archive-gold/60" />
              <span className="truncate" title={agency}>{agency}</span>
            </div>
            <span className="text-archive-gold/40">·</span>
            <span className="text-archive-gold/80">{meteorite.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateSearch = () => {
  const [certNumber, setCertNumber] = useState('');
  const [searchResults, setSearchResults] = useState<Meteorite[]>([]);
  const [showEmpty, setShowEmpty] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { searchCertificates, openModal, openCertificateArchive, meteorites } = useStore();

  const handleSearch = () => {
    if (!certNumber.trim()) return;

    const results = searchCertificates(certNumber);
    setHasSearched(true);
    setSearchResults(results);
    setShowEmpty(results.length === 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setCertNumber('');
    setSearchResults([]);
    setShowEmpty(false);
    setHasSearched(false);
  };

  const handleViewDetail = (meteorite: Meteorite) => {
    openModal(meteorite);
  };

  return (
    <div className="bg-archive-card/50 backdrop-blur-sm border-b border-archive-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-archive-gold" />
            <h2 className="font-display text-lg font-semibold text-archive-cream">证书查询</h2>
          </div>
          <button
            onClick={openCertificateArchive}
            className="flex items-center space-x-2 px-3 py-1.5 bg-archive-gold/10 border border-archive-gold/30 rounded-lg text-archive-gold text-sm hover:bg-archive-gold/20 transition-all group"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">按机构浏览</span>
            <span className="sm:hidden">浏览</span>
            <span className="px-1.5 py-0.5 bg-archive-gold/20 rounded text-xs font-semibold">
              {meteorites.length}
            </span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入证书编号、认证机构或藏品名称，如：IMCA、00125、阜康"
              className="w-full px-4 py-3 pl-10 pr-10 bg-archive-bg/50 archive-border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:border-archive-gold/50 focus:ring-2 focus:ring-archive-gold/20 transition-all font-mono"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-archive-gold/50" />
            {certNumber && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-archive-cream/40 hover:text-archive-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={!certNumber.trim()}
            className="px-6 py-3 bg-gradient-to-r from-archive-gold to-archive-gold-light rounded-lg text-archive-bg font-semibold hover:shadow-lg hover:shadow-archive-gold/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>查询证书</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-archive-cream/40">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-archive-gold/60" />
            <span>证书编号片段</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-archive-gold/60" />
            <span>认证机构简称</span>
          </div>
          <div className="flex items-center gap-1">
            <Search className="w-3 h-3 text-archive-gold/60" />
            <span>藏品名称</span>
          </div>
        </div>

        {hasSearched && (
          <div className="mt-5 animate-fade-in">
            {searchResults.length === 1 && (
              <div 
                className="group bg-archive-card archive-border rounded-xl p-5 card-hover cursor-pointer" 
                onClick={() => handleViewDetail(searchResults[0])}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg archive-border">
                    <img
                      src={searchResults[0].imageUrl}
                      alt={searchResults[0].name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-archive-card/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-archive-gold/90 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-archive-bg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-archive-cream mb-1 group-hover:text-archive-gold transition-colors">
                          {searchResults[0].name}
                        </h3>
                        <p className="text-archive-gold font-medium text-sm">
                          {searchResults[0].category}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(searchResults[0]);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-archive-gold/10 text-archive-gold text-sm rounded-md hover:bg-archive-gold/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>查看详情</span>
                      </button>
                    </div>

                    <div className="gold-dashed-divider my-3" />

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-archive-gold/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="w-4 h-4 text-archive-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-archive-cream/50 mb-1">认证机构</p>
                          <p className="text-archive-cream/90 text-sm">
                            {extractCertAgency(searchResults[0].certificateInfo)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-archive-gold/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-archive-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-archive-cream/50 mb-1">证书说明</p>
                          <p className="text-archive-cream/70 text-sm leading-relaxed">
                            {searchResults[0].certificateInfo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {searchResults.length > 1 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-archive-gold/60" />
                  <p className="text-sm text-archive-cream/60">
                    找到 <span className="text-archive-gold font-semibold">{searchResults.length}</span> 条匹配结果，请选择查看：
                  </p>
                </div>
                <div className="space-y-3">
                  {searchResults.map((meteorite) => (
                    <SearchResultItem
                      key={meteorite.id}
                      meteorite={meteorite}
                      onViewDetail={() => handleViewDetail(meteorite)}
                    />
                  ))}
                </div>
              </div>
            )}

            {showEmpty && searchResults.length === 0 && (
              <div className="bg-archive-card archive-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-archive-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-archive-gold/60" />
                </div>
                <h3 className="font-display text-lg font-semibold text-archive-cream/80 mb-2">
                  未找到匹配的证书
                </h3>
                <p className="text-archive-cream/40 text-sm max-w-md mx-auto">
                  请尝试输入证书编号片段、认证机构简称或藏品名称进行搜索。
                  <br />
                  <span className="text-archive-gold/60 font-mono mt-2 inline-block">
                    您输入的关键词: {certNumber}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateSearch;
