import { useState } from 'react';
import { Search, Award, FileText, X, Eye, AlertCircle, Archive } from 'lucide-react';
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

const CertificateSearch = () => {
  const [certNumber, setCertNumber] = useState('');
  const [searchResult, setSearchResult] = useState<Meteorite | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { searchByCertificateNumber, openModal } = useStore();

  const handleSearch = () => {
    if (!certNumber.trim()) return;

    const result = searchByCertificateNumber(certNumber);
    setHasSearched(true);

    if (result) {
      setSearchResult(result);
      setShowEmpty(false);
    } else {
      setSearchResult(null);
      setShowEmpty(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setCertNumber('');
    setSearchResult(null);
    setShowEmpty(false);
    setHasSearched(false);
  };

  const handleViewDetail = () => {
    if (searchResult) {
      openModal(searchResult);
    }
  };

  return (
    <div className="bg-archive-card/50 backdrop-blur-sm border-b border-archive-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-archive-gold" />
          <h2 className="font-display text-lg font-semibold text-archive-cream">证书查询</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入证书编号，如：IMCA-2024-00125"
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

        {hasSearched && (
          <div className="mt-5 animate-fade-in">
            {searchResult && (
              <div className="group bg-archive-card archive-border rounded-xl p-5 card-hover cursor-pointer" onClick={handleViewDetail}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg archive-border">
                    <img
                      src={searchResult.imageUrl}
                      alt={searchResult.name}
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
                          {searchResult.name}
                        </h3>
                        <p className="text-archive-gold font-medium text-sm">
                          {searchResult.category}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail();
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
                            {extractCertAgency(searchResult.certificateInfo)}
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
                            {searchResult.certificateInfo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showEmpty && !searchResult && (
              <div className="bg-archive-card archive-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-archive-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-archive-gold/60" />
                </div>
                <h3 className="font-display text-lg font-semibold text-archive-cream/80 mb-2">
                  未找到匹配的证书
                </h3>
                <p className="text-archive-cream/40 text-sm max-w-md mx-auto">
                  请检查证书编号是否正确，或联系管理员确认证书信息。
                  <br />
                  <span className="text-archive-gold/60 font-mono mt-2 inline-block">
                    您输入的编号: {certNumber}
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
