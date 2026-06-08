import { useState, useMemo } from 'react';
import { X, Search, Award, FileText, Eye, Archive, Building2, Layers } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Meteorite } from '@/types';

const CERTIFICATION_AUTHORITIES = {
  IMCA: {
    code: 'IMCA',
    name: '国际陨石收藏家协会',
    fullName: '国际陨石收藏家协会(IMCA)',
    pattern: /\(IMCA\)/,
  },
  MSN: {
    code: 'MSN',
    name: '陨石学会',
    fullName: '陨石学会(MSN)',
    pattern: /\(MSN\)/,
  },
  GMA: {
    code: 'GMA',
    name: '全球陨石协会',
    fullName: '全球陨石协会(GMA)',
    pattern: /\(GMA\)/,
  },
} as const;

type AuthorityCode = keyof typeof CERTIFICATION_AUTHORITIES | 'all' | 'other';

const extractCertAgency = (certInfo: string): string => {
  const match = certInfo.match(/^([^，。]+认证[^，。]*)/);
  if (match) {
    return match[1].trim();
  }
  const shortMatch = certInfo.match(/^([^，。]+)/);
  return shortMatch ? shortMatch[1].trim() : certInfo;
};

const getAuthorityCode = (certInfo: string): AuthorityCode => {
  for (const [code, config] of Object.entries(CERTIFICATION_AUTHORITIES)) {
    if (config.pattern.test(certInfo)) {
      return code as AuthorityCode;
    }
  }
  return 'other';
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

interface CertificateItemProps {
  meteorite: Meteorite;
  onViewDetail: () => void;
}

const CertificateItem = ({ meteorite, onViewDetail }: CertificateItemProps) => {
  const agency = extractAgencyName(meteorite.certificateInfo);
  const fullAgency = extractCertAgency(meteorite.certificateInfo);

  return (
    <div 
      className="group bg-archive-card archive-border rounded-xl p-5 card-hover cursor-pointer transition-all duration-300"
      onClick={onViewDetail}
    >
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg archive-border">
          <img
            src={meteorite.imageUrl}
            alt={meteorite.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-archive-card/80 via-transparent to-transparent" />
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 bg-archive-gold/90 rounded-full flex items-center justify-center">
              <Eye className="w-3 h-3 text-archive-bg" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-archive-cream mb-1 truncate group-hover:text-archive-gold transition-colors">
                {meteorite.name}
              </h3>
              <p className="text-archive-gold/80 font-mono text-sm">
                {meteorite.certificateNumber}
              </p>
            </div>
            <span className="flex-shrink-0 px-2 py-1 bg-archive-gold/10 text-archive-gold text-xs rounded-md font-medium">
              {meteorite.category}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-archive-gold/60 flex-shrink-0" />
              <span className="text-archive-cream/70 truncate" title={fullAgency}>
                {agency}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-archive-gold/60 flex-shrink-0 mt-0.5" />
              <p className="text-archive-cream/50 line-clamp-2">
                {meteorite.certificateInfo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateArchive = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityCode>('all');
  const { meteorites, isCertificateArchiveOpen, closeCertificateArchive, openModal } = useStore();

  const authorityGroups = useMemo(() => {
    const groups: Record<AuthorityCode, number> = {
      all: meteorites.length,
      IMCA: 0,
      MSN: 0,
      GMA: 0,
      other: 0,
    };

    for (const m of meteorites) {
      const code = getAuthorityCode(m.certificateInfo);
      groups[code]++;
    }

    return groups;
  }, [meteorites]);

  const filteredCertificates = useMemo(() => {
    let result = meteorites;

    if (selectedAuthority !== 'all') {
      result = result.filter((m) => getAuthorityCode(m.certificateInfo) === selectedAuthority);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((m) => {
        const certNumberMatch = m.certificateNumber.toLowerCase().includes(keyword);
        const agencyMatch = extractCertAgency(m.certificateInfo).toLowerCase().includes(keyword);
        const agencyNameMatch = extractAgencyName(m.certificateInfo).toLowerCase().includes(keyword);
        const certInfoMatch = m.certificateInfo.toLowerCase().includes(keyword);
        return certNumberMatch || agencyMatch || agencyNameMatch || certInfoMatch;
      });
    }

    return result;
  }, [meteorites, searchKeyword, selectedAuthority]);

  const handleViewDetail = (meteorite: Meteorite) => {
    closeCertificateArchive();
    setTimeout(() => {
      openModal(meteorite);
    }, 300);
  };

  const handleClear = () => {
    setSearchKeyword('');
    setSelectedAuthority('all');
  };

  const authorityFilterButtons = [
    { code: 'all' as AuthorityCode, label: '全部', icon: Layers },
    { code: 'IMCA' as AuthorityCode, label: 'IMCA', icon: Award },
    { code: 'MSN' as AuthorityCode, label: 'MSN', icon: Award },
    { code: 'GMA' as AuthorityCode, label: 'GMA', icon: Award },
    { code: 'other' as AuthorityCode, label: '其他', icon: Building2 },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCertificateArchive();
    }
  };

  if (!isCertificateArchiveOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeCertificateArchive}
      />
      
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 flex flex-col animate-fade-in">
        <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-archive-bg" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-archive-cream">证书档案库</h2>
              <p className="text-archive-cream/50 text-sm">
                {selectedAuthority === 'all'
                  ? `共 ${filteredCertificates.length} 份证书档案`
                  : selectedAuthority === 'other'
                  ? `其他机构 · 共 ${filteredCertificates.length} 份证书档案`
                  : `${CERTIFICATION_AUTHORITIES[selectedAuthority as keyof typeof CERTIFICATION_AUTHORITIES]?.name || selectedAuthority} · 共 ${filteredCertificates.length} 份证书档案`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCertificateArchive}
            className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-archive-gold/10 bg-archive-bg/30">
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索证书编号或认证机构，如：IMCA、MSN、GMA..."
              className="w-full px-4 py-3 pl-10 pr-10 bg-archive-bg/50 archive-border rounded-lg text-archive-cream placeholder-archive-cream/30 focus:outline-none focus:border-archive-gold/50 focus:ring-2 focus:ring-archive-gold/20 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-archive-gold/50" />
            {searchKeyword && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-archive-cream/40 hover:text-archive-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-archive-cream/40">
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-archive-gold/60" />
              <span>支持按证书编号搜索</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-archive-gold/60" />
              <span>支持按认证机构搜索</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-archive-gold/10 bg-archive-bg/20">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-archive-gold/60" />
            <span className="text-sm text-archive-cream/60">按认证机构筛选</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {authorityFilterButtons.map(({ code, label, icon: Icon }) => (
              <button
                key={code}
                onClick={() => setSelectedAuthority(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedAuthority === code
                    ? 'bg-archive-gold text-archive-bg shadow-lg shadow-archive-gold/30'
                    : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-gold border border-archive-gold/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <span className={`ml-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${
                  selectedAuthority === code
                    ? 'bg-archive-bg/20 text-archive-bg'
                    : 'bg-archive-gold/10 text-archive-gold'
                }`}>
                  {authorityGroups[code]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCertificates.map((meteorite) => (
                <CertificateItem
                  key={meteorite.id}
                  meteorite={meteorite}
                  onViewDetail={() => handleViewDetail(meteorite)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-archive-gold/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-archive-gold/40" />
              </div>
              <h3 className="font-display text-lg font-semibold text-archive-cream/60 mb-2">
                未找到匹配的证书
              </h3>
              <p className="text-archive-cream/30 text-sm max-w-sm">
                请尝试其他关键词或筛选条件，或清空所有条件查看全部证书档案
              </p>
              {(searchKeyword || selectedAuthority !== 'all') && (
                <button
                  onClick={handleClear}
                  className="mt-4 px-4 py-2 bg-archive-gold/10 text-archive-gold text-sm rounded-md hover:bg-archive-gold/20 transition-colors"
                >
                  清空筛选
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateArchive;
