/**
 * color.js
 * Element and color mappings for 天干 (Heavenly Stems) and 地支 (Earthly Branches)
 */

// Element colors
const ELEMENT_COLORS = {
  '木': '#22c55e', // Green (Wood)
  '火': '#ef4444', // Red (Fire)
  '土': '#78716c', // Grey/Brown (Earth)
  '金': '#f59e0b', // Orange/Gold (Metal)
  '水': '#3b82f6'  // Blue (Water)
};

// 天干 (Heavenly Stems) - 10 stems with their elements and colors
const STEM_COLORS = {
  '甲': { element: '木', color: ELEMENT_COLORS['木'] },
  '乙': { element: '木', color: ELEMENT_COLORS['木'] },
  '丙': { element: '火', color: ELEMENT_COLORS['火'] },
  '丁': { element: '火', color: ELEMENT_COLORS['火'] },
  '戊': { element: '土', color: ELEMENT_COLORS['土'] },
  '己': { element: '土', color: ELEMENT_COLORS['土'] },
  '庚': { element: '金', color: ELEMENT_COLORS['金'] },
  '辛': { element: '金', color: ELEMENT_COLORS['金'] },
  '壬': { element: '水', color: ELEMENT_COLORS['水'] },
  '癸': { element: '水', color: ELEMENT_COLORS['水'] }
};

// 地支 (Earthly Branches) - 12 branches with their elements and colors
const BRANCH_COLORS = {
  '子': { element: '水', color: ELEMENT_COLORS['水'] },
  '丑': { element: '土', color: ELEMENT_COLORS['土'] },
  '寅': { element: '木', color: ELEMENT_COLORS['木'] },
  '卯': { element: '木', color: ELEMENT_COLORS['木'] },
  '辰': { element: '土', color: ELEMENT_COLORS['土'] },
  '巳': { element: '火', color: ELEMENT_COLORS['火'] },
  '午': { element: '火', color: ELEMENT_COLORS['火'] },
  '未': { element: '土', color: ELEMENT_COLORS['土'] },
  '申': { element: '金', color: ELEMENT_COLORS['金'] },
  '酉': { element: '金', color: ELEMENT_COLORS['金'] },
  '戌': { element: '土', color: ELEMENT_COLORS['土'] },
  '亥': { element: '水', color: ELEMENT_COLORS['水'] }
};

// Helper function to get element and color for a stem
function getStemColor(gan) {
  return STEM_COLORS[gan] || { element: '', color: '' };
}

// Helper function to get element and color for a branch
function getBranchColor(zhi) {
  return BRANCH_COLORS[zhi] || { element: '', color: '' };
}

// Make globally available
window.ELEMENT_COLORS = ELEMENT_COLORS;
window.STEM_COLORS = STEM_COLORS;
window.BRANCH_COLORS = BRANCH_COLORS;
window.getStemColor = getStemColor;
window.getBranchColor = getBranchColor;
