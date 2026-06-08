import type { StateCreator } from 'zustand';
import type { StoreState, Meteorite } from '@/types';

export interface CertificateSearchSlice {
  isCertificateArchiveOpen: boolean;
  searchByCertificateNumber: (certNumber: string) => Meteorite | undefined;
  searchCertificates: (keyword: string) => Meteorite[];
  openCertificateArchive: () => void;
  closeCertificateArchive: () => void;
}

export const createCertificateSearchSlice: StateCreator<StoreState, [], [], CertificateSearchSlice> = (set, get) => ({
  isCertificateArchiveOpen: false,

  searchByCertificateNumber: (certNumber: string) => {
    const { meteorites } = get();
    const trimmed = certNumber.trim().toUpperCase();
    return meteorites.find((m) => m.certificateNumber.toUpperCase() === trimmed);
  },

  searchCertificates: (keyword: string) => {
    const { meteorites } = get();
    const trimmed = keyword.trim();
    if (!trimmed) return [];

    const searchTerm = trimmed.toLowerCase();

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

    return meteorites.filter((m) => {
      const certNumberMatch = m.certificateNumber.toLowerCase().includes(searchTerm);
      const nameMatch = m.name.toLowerCase().includes(searchTerm);
      const agencyMatch = extractCertAgency(m.certificateInfo).toLowerCase().includes(searchTerm);
      const agencyNameMatch = extractAgencyName(m.certificateInfo).toLowerCase().includes(searchTerm);
      const certInfoMatch = m.certificateInfo.toLowerCase().includes(searchTerm);
      return certNumberMatch || nameMatch || agencyMatch || agencyNameMatch || certInfoMatch;
    });
  },

  openCertificateArchive: () =>
    set({ isCertificateArchiveOpen: true }),

  closeCertificateArchive: () =>
    set({ isCertificateArchiveOpen: false }),
});
