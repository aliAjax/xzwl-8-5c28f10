import { Meteorite, SaleStatusRecord, SaleStatus, ReservationInfo } from '@/types';

const generateInitialHistory = (
  meteoriteId: string, 
  currentStatus: SaleStatus, 
  reservationInfo?: ReservationInfo
): SaleStatusRecord[] => {
  const history: SaleStatusRecord[] = [];
  const baseTime = new Date('2024-01-01T10:00:00').getTime();

  history.push({
    id: `${meteoriteId}-history-1`,
    meteoriteId,
    fromStatus: null,
    toStatus: 'available',
    timestamp: new Date(baseTime).toISOString(),
    operator: '系统初始化',
    remark: '藏品入库，初始状态为在售',
  });

  if (currentStatus === 'reserved') {
    history.push({
      id: `${meteoriteId}-history-2`,
      meteoriteId,
      fromStatus: 'available',
      toStatus: 'reserved',
      timestamp: new Date(baseTime + 86400000 * 30).toISOString(),
      operator: '张经理',
      remark: '客户意向确认，预留藏品',
      reservationInfo,
    });
  } else if (currentStatus === 'sold') {
    const hasReservedStage = Math.random() > 0.5;
    if (hasReservedStage) {
      history.push({
        id: `${meteoriteId}-history-2`,
        meteoriteId,
        fromStatus: 'available',
        toStatus: 'reserved',
        timestamp: new Date(baseTime + 86400000 * 15).toISOString(),
        operator: '李经理',
        remark: '客户支付定金，预留藏品',
      });
      history.push({
        id: `${meteoriteId}-history-3`,
        meteoriteId,
        fromStatus: 'reserved',
        toStatus: 'sold',
        timestamp: new Date(baseTime + 86400000 * 45).toISOString(),
        operator: '王主管',
        remark: '客户付清全款，交易完成',
      });
    } else {
      history.push({
        id: `${meteoriteId}-history-2`,
        meteoriteId,
        fromStatus: 'available',
        toStatus: 'sold',
        timestamp: new Date(baseTime + 86400000 * 60).toISOString(),
        operator: '赵经理',
        remark: '客户直接购买，交易完成',
      });
    }
  }

  return history;
};

export const mockMeteorites: Meteorite[] = [
  {
    id: 'MET-2024-001',
    name: '奈梅亨铁陨石',
    category: '铁陨石',
    location: '纳米比亚 霍巴',
    weight: 1250,
    sliced: true,
    certificateNumber: 'IMCA-2024-00125',
    displayCase: 'A-01',
    saleStatus: 'available',
    description: '精品IVA组铁陨石切片，呈现经典的维德曼交角花纹。该陨石于1920年在纳米比亚被发现，总重量约60吨，是迄今发现的最大陨石之一。本切片表面经过精细抛光，蚀刻处理后花纹清晰可见，具有极高的收藏价值。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iron%20meteorite%20slice%20with%20Widmanstatten%20pattern%20on%20dark%20velvet%20background%20museum%20display&image_size=square_hd',
    certificateInfo: '国际陨石收藏家协会(IMCA)认证证书，编号IMCA-2024-00125。经光谱分析确认为IVA组铁陨石，镍含量7.9%，钴含量0.5%。',
    discoveredDate: '1920-06-15',
    saleStatusHistory: generateInitialHistory('MET-2024-001', 'available'),
  },
  {
    id: 'MET-2024-002',
    name: '阿连德碳质球粒陨石',
    category: '碳质球粒陨石',
    location: '墨西哥 奇瓦瓦州',
    weight: 85,
    sliced: true,
    certificateNumber: 'MSN-2024-00342',
    displayCase: 'B-03',
    saleStatus: 'available',
    description: '著名的CV3型碳质球粒陨石，1969年坠落于墨西哥。包含丰富的富钙铝包体(CAIs)，是太阳系最古老的物质之一，距今约45.6亿年。本切片展示了清晰的球粒结构和基质特征。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=carbonaceous%20chondrite%20meteorite%20slice%20showing%20chondrules%20and%20CAIs%20dark%20background%20museum%20quality&image_size=square_hd',
    certificateInfo: '陨石学会(MSN)认证，编号MSN-2024-00342。类型CV3，总重量2吨，本标本85克，含有多个毫米级CAIs。',
    discoveredDate: '1969-02-08',
    saleStatusHistory: generateInitialHistory('MET-2024-002', 'available'),
  },
  {
    id: 'MET-2024-003',
    name: '阜康橄榄陨铁',
    category: '石铁陨石',
    location: '中国 新疆 阜康',
    weight: 320,
    sliced: true,
    certificateNumber: 'GMA-2024-00567',
    displayCase: 'A-05',
    saleStatus: 'reserved',
    description: '2000年发现于中国新疆的阜康橄榄陨铁，属于罕见的Pallasite类。美丽的橄榄石晶体镶嵌在铁镍金属基质中，形成绚丽的"太空宝石"效果。本切片经过双面抛光，橄榄石晶体呈金黄色半透明状。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pallasite%20meteorite%20slice%20with%20olivine%20crystals%20peridot%20in%20iron%20nickel%20matrix%20translucent%20gem%20quality&image_size=square_hd',
    certificateInfo: '全球陨石协会(GMA)认证，编号GMA-2024-00567。Pallasite类型，总重量约1吨，橄榄石含量约50%。',
    discoveredDate: '2000-09-20',
    reservationInfo: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '陈收藏家' };
    })(),
    saleStatusHistory: generateInitialHistory('MET-2024-003', 'reserved', (() => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '陈收藏家' };
    })()),
  },
  {
    id: 'MET-2024-004',
    name: 'NWA 869普通球粒陨石',
    category: '普通球粒陨石',
    location: '西北非 阿尔及利亚',
    weight: 450,
    sliced: false,
    certificateNumber: 'IMCA-2024-00789',
    displayCase: 'C-02',
    saleStatus: 'available',
    description: 'L3.8型普通球粒陨石，2001年发现于西北非沙漠地区。完整的融合壳陨石个体，呈现典型的黑色熔融外壳和流纹特征。内部包含丰富的球粒结构，是球粒陨石教学和收藏的佳品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=complete%20ordinary%20chondrite%20meteorite%20with%20fusion%20crust%20dark%20desert%20stone%20on%20black%20background&image_size=square_hd',
    certificateInfo: '国际陨石收藏家协会(IMCA)认证，编号IMCA-2024-00789。类型L3.8，450克完整个体，90%以上原始融合壳。',
    discoveredDate: '2001-11-10',
    saleStatusHistory: generateInitialHistory('MET-2024-004', 'available'),
  },
  {
    id: 'MET-2024-005',
    name: 'NWA 10597月球陨石',
    category: '月球陨石',
    location: '西北非 摩洛哥',
    weight: 68,
    sliced: true,
    certificateNumber: 'MSN-2024-00901',
    displayCase: 'A-02',
    saleStatus: 'sold',
    description: '珍贵的月球斜长岩陨石，2017年发现于摩洛哥。属于月球高地角砾岩，由多种月球岩石碎屑胶结而成。切片显示典型的浅灰色基质和矿物碎屑，是来自月球的珍贵礼物。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lunar%20meteorite%20slice%20pale%20gray%20anorthositic%20breccia%20moon%20rock%20on%20dark%20velvet%20museum&image_size=square_hd',
    certificateInfo: '陨石学会(MSN)认证，编号MSN-2024-00901。月球斜长岩角砾岩，68克切片，经同位素分析确认为月球来源。',
    discoveredDate: '2017-05-22',
    saleStatusHistory: generateInitialHistory('MET-2024-005', 'sold'),
  },
  {
    id: 'MET-2024-006',
    name: '提森特火星陨石',
    category: '火星陨石',
    location: '摩洛哥 提森特',
    weight: 156,
    sliced: true,
    certificateNumber: 'GMA-2024-01123',
    displayCase: 'A-03',
    saleStatus: 'available',
    description: '著名的Shergottite型火星陨石，2011年坠落于摩洛哥。属于辉石玄武岩，包含特征的橄榄石斑晶和熔长石玻璃。本切片展示了典型的深灰色基质和冲击熔融特征，是研究火星地质的重要标本。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mars%20meteorite%20shergottite%20slice%20dark%20gray%20basaltic%20rock%20with%20olivine%20phenocrysts%20museum%20quality&image_size=square_hd',
    certificateInfo: '全球陨石协会(GMA)认证，编号GMA-2024-01123。Shergottite类型，156克切片，确认火星来源。',
    discoveredDate: '2011-07-18',
    saleStatusHistory: generateInitialHistory('MET-2024-006', 'available'),
  },
  {
    id: 'MET-2024-007',
    name: '顽火辉石球粒陨石',
    category: '顽火辉石球粒陨石',
    location: '美国 新墨西哥州',
    weight: 230,
    sliced: true,
    certificateNumber: 'IMCA-2024-01345',
    displayCase: 'B-01',
    saleStatus: 'available',
    description: '罕见的EH4型顽火辉石球粒陨石，1951年发现于美国。富含金属铁和硫化物，在还原条件下形成。切片中可见特征的金属颗粒和陨硫铁团块，具有独特的金属光泽。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=enstatite%20chondrite%20meteorite%20slice%20with%20metallic%20iron%20grains%20shiny%20reflective%20minerals%20dark%20background&image_size=square_hd',
    certificateInfo: '国际陨石收藏家协会(IMCA)认证，编号IMCA-2024-01345。类型EH4，230克切片，金属含量约25%。',
    discoveredDate: '1951-03-12',
    saleStatusHistory: generateInitialHistory('MET-2024-007', 'available'),
  },
  {
    id: 'MET-2024-008',
    name: 'NWA 725无球粒陨石',
    category: '无球粒陨石',
    location: '西北非 马里',
    weight: 98,
    sliced: false,
    certificateNumber: 'MSN-2024-01567',
    displayCase: 'C-05',
    saleStatus: 'reserved',
    description: 'HED族无球粒陨石，属于古铜钙长无球粒陨石(Howardite)。是小行星灶神星的喷发物，由多种岩石碎屑混合而成。完整的风化表面个体，内部含有典型的辉石和斜长石矿物组合。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=achondrite%20meteorite%20howardite%20complete%20individual%20gray%20stone%20with%20weathered%20surface%20on%20black&image_size=square_hd',
    certificateInfo: '陨石学会(MSN)认证，编号MSN-2024-01567。Howardite类型，98克完整个体，灶神星来源。',
    discoveredDate: '2010-08-05',
    reservationInfo: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '刘经理' };
    })(),
    saleStatusHistory: generateInitialHistory('MET-2024-008', 'reserved', (() => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '刘经理' };
    })()),
  },
  {
    id: 'MET-2024-009',
    name: '吉丙铁陨石',
    category: '铁陨石',
    location: '纳米比亚 吉丙',
    weight: 890,
    sliced: true,
    certificateNumber: 'GMA-2024-01789',
    displayCase: 'A-04',
    saleStatus: 'available',
    description: '著名的IIIB组铁陨石，史前时代坠落于纳米比亚。表面呈现自然的风化铜绿色，内部金属光泽闪亮。本切片经过深度蚀刻，展示了粗犷的维德曼花纹和诺依曼线，是铁陨石中的经典品种。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gibeon%20iron%20meteorite%20slice%20etched%20Widmanstatten%20pattern%20large%20impressive%20museum%20display&image_size=square_hd',
    certificateInfo: '全球陨石协会(GMA)认证，编号GMA-2024-01789。类型IIIB，890克切片，史前坠落。',
    discoveredDate: '1836-01-01',
    saleStatusHistory: generateInitialHistory('MET-2024-009', 'available'),
  },
  {
    id: 'MET-2024-010',
    name: '穆雷碳质球粒陨石',
    category: '碳质球粒陨石',
    location: '美国 肯塔基州',
    weight: 45,
    sliced: true,
    certificateNumber: 'IMCA-2024-02001',
    displayCase: 'B-05',
    saleStatus: 'sold',
    description: 'CM2型碳质球粒陨石，1952年坠落于美国。含有丰富的有机化合物和氨基酸，是研究生命起源的重要材料。切片显示典型的暗色基质和变形球粒结构，具有重要的科学价值。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=carbonaceous%20chondrite%20CM2%20meteorite%20slice%20dark%20matrix%20with%20chondrules%20scientific%20sample%20on%20black&image_size=square_hd',
    certificateInfo: '国际陨石收藏家协会(IMCA)认证，编号IMCA-2024-02001。类型CM2，45克切片，已检测出多种氨基酸。',
    discoveredDate: '1952-04-25',
    saleStatusHistory: generateInitialHistory('MET-2024-010', 'sold'),
  },
  {
    id: 'MET-2024-011',
    name: 'NWA 11228普通球粒陨石',
    category: '普通球粒陨石',
    location: '西北非 阿尔及利亚',
    weight: 1680,
    sliced: false,
    certificateNumber: 'MSN-2024-02234',
    displayCase: 'D-01',
    saleStatus: 'available',
    description: '大型H5型普通球粒陨石，2017年发现于西北非。重达1.68公斤的完整个体，保留了约70%的原始融合壳。表面可见清晰的气印和流纹，内部为典型的球粒结构，是收藏展示的佳品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20ordinary%20chondrite%20meteorite%20complete%20individual%20with%20regmaglypts%20and%20fusion%20crust%20impressive%20specimen&image_size=square_hd',
    certificateInfo: '陨石学会(MSN)认证，编号MSN-2024-02234。类型H5，1680克完整个体，70%融合壳。',
    discoveredDate: '2017-10-15',
    saleStatusHistory: generateInitialHistory('MET-2024-011', 'available'),
  },
  {
    id: 'MET-2024-012',
    name: '伊米拉克橄榄陨铁',
    category: '石铁陨石',
    location: '智利 阿塔卡马沙漠',
    weight: 210,
    sliced: true,
    certificateNumber: 'GMA-2024-02456',
    displayCase: 'A-06',
    saleStatus: 'available',
    description: '经典的Pallasite橄榄陨铁，1822年发现于智利。美丽的橄榄石晶体与铁镍金属交织，如同"太空镶嵌画"。本切片经过精细抛光和酸蚀处理，橄榄石晶体呈完美的多边形，金属部分显示维德曼花纹。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=imilac%20pallasite%20meteorite%20slice%20olivine%20crystals%20in%20iron%20matrix%20gem%20quality%20museum%20display%20golden%20peridot&image_size=square_hd',
    certificateInfo: '全球陨石协会(GMA)认证，编号GMA-2024-02456。Pallasite类型，210克切片，宝石级橄榄石含量约45%。',
    discoveredDate: '1822-08-30',
    saleStatusHistory: generateInitialHistory('MET-2024-012', 'available'),
  },
  {
    id: 'MET-2024-013',
    name: '阿颜德碳质球粒陨石',
    category: '碳质球粒陨石',
    location: '墨西哥 奇瓦瓦州',
    weight: 156,
    sliced: true,
    certificateNumber: 'IMCA-2024-02678',
    displayCase: 'B-06',
    saleStatus: 'reserved',
    description: '著名的CV3型碳质球粒陨石，1969年与阿连德陨石同期坠落。含有丰富的太阳系前颗粒和同位素异常，是研究太阳系形成的重要样本。本切片展示了清晰的球粒结构和暗色斑晶。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=allende%20type%20carbonaceous%20chondrite%20meteorite%20slice%20with%20chondrules%20and%20CAIs%20dark%20background%20scientific%20sample&image_size=square_hd',
    certificateInfo: '国际陨石收藏家协会(IMCA)认证，编号IMCA-2024-02678。类型CV3，156克切片，含多个富钙铝包体。',
    discoveredDate: '1969-02-08',
    reservationInfo: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '周研究员' };
    })(),
    saleStatusHistory: generateInitialHistory('MET-2024-013', 'reserved', (() => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      date.setHours(23, 59, 59, 999);
      return { expiresAt: date.toISOString(), reservedBy: '周研究员' };
    })()),
  },
  {
    id: 'MET-2024-014',
    name: '戈班铁陨石',
    category: '铁陨石',
    location: '纳米比亚 戈班',
    weight: 560,
    sliced: true,
    certificateNumber: 'GMA-2024-02890',
    displayCase: 'A-07',
    saleStatus: 'reserved',
    description: 'IVA组铁陨石，发现于1836年。经典的八面体陨铁结构，维德曼交角花纹清晰美观。本切片经过精细抛光和蚀刻处理，花纹呈现出独特的几何美感，是铁陨石收藏的经典品种。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gibeon%20iron%20meteorite%20slice%20with%20Widmanstatten%20pattern%20etched%20surface%20geometric%20pattern%20dark%20background&image_size=square_hd',
    certificateInfo: '全球陨石协会(GMA)认证，编号GMA-2024-02890。类型IVA，560克切片，八面体陨铁结构。',
    discoveredDate: '1836-05-18',
    saleStatusHistory: generateInitialHistory('MET-2024-014', 'reserved'),
  },
];
