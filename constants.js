/**
 * constants.js
 */

// 1. 五行与关系 (Five Elements & Relationships)
const FIVE_ELEMENTS = {
  WOOD: '木',
  FIRE: '火',
  EARTH: '土',
  METAL: '金',
  WATER: '水'
};

const ELEMENT_RELATIONSHIPS = {
  generating: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
  overcoming: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
};

// 2. 十神映射 (Ten Gods)
const SHI_SHEN_MAP = {
  'SAME_ELEMENT': { same: '比肩', different: '劫财' },
  'I_GENERATE':   { same: '食神', different: '伤官' },
  'I_OVERCOME':   { same: '偏财', different: '正财' },
  'OVERCOMES_ME': { same: '七杀', different: '正官' },
  'GENERATES_ME': { same: '偏印', different: '正印' }
};

// 3. 干支配属 (Stem & Branch Elemental Attributes)
const STEM_INFO = {
  '甲': { element: '木', polarity: 'yang' },
  '乙': { element: '木', polarity: 'yin' },
  '丙': { element: '火', polarity: 'yang' },
  '丁': { element: '火', polarity: 'yin' },
  '戊': { element: '土', polarity: 'yang' },
  '己': { element: '土', polarity: 'yin' },
  '庚': { element: '金', polarity: 'yang' },
  '辛': { element: '金', polarity: 'yin' },
  '壬': { element: '水', polarity: 'yang' },
  '癸': { element: '水', polarity: 'yin' }
};

// 4. 地支藏干 (Hidden Stems in Branches)
// The first stem in the array is usually the "Principal" (本气)
const HIDDEN_GANS = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// Make constants globally available
window.STEM_INFO = STEM_INFO;
window.HIDDEN_GANS = HIDDEN_GANS;
window.SHI_SHEN_MAP = SHI_SHEN_MAP;
window.ELEMENT_RELATIONSHIPS = ELEMENT_RELATIONSHIPS;