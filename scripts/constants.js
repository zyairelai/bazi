/**
 * constants.js
 * Comprehensive Bazi (Four Pillars) Constants
 */

// 1. Five Elements & Relationships
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

// 2. Ten Gods (Shi Shen)
const SHI_SHEN_MAP = {
  'SAME_ELEMENT': { same: '比肩', different: '劫财' },
  'I_GENERATE': { same: '食神', different: '伤官' },
  'I_OVERCOME': { same: '偏财', different: '正财' },
  'OVERCOMES_ME': { same: '七杀', different: '正官' },
  'GENERATES_ME': { same: '偏印', different: '正印' }
};

// 3. Stem Attributes (Tian Gan)
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

// 4. Branch Hidden Stems (Di Zhi Cang Gan)
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

// 5. Branch Combinations (He)
// 三合局 (Triple Combinations)
const TRIPLE_COMBINATIONS = [
  { name: '申子辰', branches: ['申', '子', '辰'], resultingElement: '水' },
  { name: '亥卯未', branches: ['亥', '卯', '未'], resultingElement: '木' },
  { name: '寅午戌', branches: ['寅', '午', '戌'], resultingElement: '火' },
  { name: '巳酉丑', branches: ['巳', '酉', '丑'], resultingElement: '金' }
];

// 三会局 (Directional Combinations)
const DIRECTIONAL_COMBINATIONS = [
  { name: '寅卯辰', branches: ['寅', '卯', '辰'], resultingElement: '木', season: '春' },
  { name: '巳午未', branches: ['巳', '午', '未'], resultingElement: '火', season: '夏' },
  { name: '申酉戌', branches: ['申', '酉', '戌'], resultingElement: '金', season: '秋' },
  { name: '亥子丑', branches: ['亥', '子', '丑'], resultingElement: '水', season: '冬' }
];

// 6. Branch Punishments (Xing)
const THREE_PUNISHMENTS = {
  INGRATITUDE: {
    name: '恃势之刑',
    branches: ['寅', '巳', '申'],
    description: '寅巳申三刑'
  },
  BULLYING: {
    name: '无恩之刑', // Often called Bullying or Ungrateful depending on tradition
    branches: ['丑', '戌', '未'],
    description: '丑戌未三刑'
  }
};

// Export to Global Scope for browser-side usage
window.FIVE_ELEMENTS = FIVE_ELEMENTS;
window.ELEMENT_RELATIONSHIPS = ELEMENT_RELATIONSHIPS;
window.SHI_SHEN_MAP = SHI_SHEN_MAP;
window.STEM_INFO = STEM_INFO;
window.HIDDEN_GANS = HIDDEN_GANS;
window.TRIPLE_COMBINATIONS = TRIPLE_COMBINATIONS;
window.DIRECTIONAL_COMBINATIONS = DIRECTIONAL_COMBINATIONS;
window.THREE_PUNISHMENTS = THREE_PUNISHMENTS;