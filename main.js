// Initialize calendar and clipboard when page loads
document.addEventListener('DOMContentLoaded', function () {
  initCalendar();
  initClipboard();
  initResetButton();
  // Add event listener for date changes to update Bazi table
  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');
  const dateSelect = document.getElementById('dateSelect');
  const hourSelect = document.getElementById('hourSelect');
  const genderRadios = document.querySelectorAll('input[name="gender"]');

  // Listen to all date-related changes
  [yearSelect, monthSelect, dateSelect, hourSelect].forEach(el => {
    if (el) {
      el.addEventListener('change', updateBaziTable);
    }
  });

  // Listen to gender changes
  genderRadios.forEach(radio => {
    radio.addEventListener('change', updateBaziTable);
  });

  // Initial update
  updateBaziTable();
});

// Darken hex color by a percentage (0-1). Returns hex string or original if invalid.
function darkenColor(hex, amount = 0.2) {
  if (!hex || typeof hex !== 'string') return hex;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return hex;
  let h = m[1];
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
  const out = (r << 16) | (g << 8) | b;
  return '#' + out.toString(16).padStart(6, '0');
}

function initResetButton() {
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      // Get all elements
      const genderMale = document.getElementById('genderMale');
      const calendarSolar = document.getElementById('calendarSolar');
      const yearSelect = document.getElementById('yearSelect');
      const monthSelect = document.getElementById('monthSelect');
      const dateSelect = document.getElementById('dateSelect');
      const hourSelect = document.getElementById('hourSelect');

      // Set values silently first (without triggering events)
      if (genderMale) genderMale.checked = true;
      if (calendarSolar) calendarSolar.checked = true;
      if (yearSelect) yearSelect.value = '2000';
      if (monthSelect) monthSelect.value = '6';
      if (hourSelect) hourSelect.value = '9';

      // Update days dropdown manually to avoid flash
      // This mimics updateDaysDropdown but sets the date immediately
      if (yearSelect && monthSelect && dateSelect) {
        const year = 2000;
        const monthValue = 6;

        // Clear existing options
        dateSelect.innerHTML = '';

        // Calculate last date for June 2000 (30 days)
        const month = monthValue - 1;
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Populate days
        for (let day = 1; day <= lastDate; day++) {
          const option = document.createElement('option');
          option.value = day;
          option.textContent = String(day).padStart(2, '0') + '日';
          dateSelect.appendChild(option);
        }

        // Set date to 30 immediately (before any rendering)
        dateSelect.value = '30';
      }

      // Now trigger change events, but ensure date stays at 30
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Only trigger calendar change if it's not already solar
        if (calendarSolar && !calendarSolar.checked) {
          calendarSolar.dispatchEvent(new Event('change'));
        }

        // Trigger year and month changes first
        if (yearSelect) yearSelect.dispatchEvent(new Event('change'));
        if (monthSelect) monthSelect.dispatchEvent(new Event('change'));

        // Wait for days dropdown to update, then set date to 30
        setTimeout(() => {
          // Ensure date dropdown has day 30
          if (dateSelect) {
            // Update days dropdown if needed
            if (typeof updateDaysDropdown === 'function') {
              updateDaysDropdown();
            }

            // Set date to 30
            const day30Option = Array.from(dateSelect.options).find(opt => opt.value === '30');
            if (day30Option) {
              dateSelect.value = '30';
            } else {
              // If day 30 doesn't exist, use the last day
              const lastOption = dateSelect.options[dateSelect.options.length - 1];
              if (lastOption) {
                dateSelect.value = lastOption.value;
              }
            }
          }

          // Now trigger date and hour changes
          if (dateSelect) dateSelect.dispatchEvent(new Event('change'));
          if (hourSelect) hourSelect.dispatchEvent(new Event('change'));
          if (genderMale) genderMale.dispatchEvent(new Event('change'));
        }, 50);
      });
    });
  }
}


function updateBaziTable() {
  try {
    const year = parseInt(document.getElementById('yearSelect').value);
    const month = parseInt(document.getElementById('monthSelect').value);
    const day = parseInt(document.getElementById('dateSelect').value);
    const hourValue = document.getElementById('hourSelect').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const calendarType = document.querySelector('input[name="calendar"]:checked').value;

    // Handle hour
    let hour = null;
    if (hourValue !== '-1' && hourValue !== '') {
      hour = parseInt(hourValue);
    }

    // Calculate Bazi
    const baziResult = calculateBazi(year, month, day, hour, gender, calendarType);

    // Prepare variables for DaYun calculation
    let currentDaYunBranch = null;
    let dayunHighlight = null;
    let baziHighlights = null;
    let combinedResult = null;

    if (baziResult && baziResult.eightChar && baziResult.baziDetails && baziResult.baziDetails.day) {
      const dayGan = baziResult.baziDetails.day.gan; // 日干
      const dayunResult = calculateDayun(baziResult.eightChar, gender, baziResult.birthYear, dayGan);

      // Identify Current DaYun Branch
      const currentYear = new Date().getFullYear();
      if (dayunResult.dayunList) {
        const activeDayun = dayunResult.dayunList.find(d => currentYear >= d.startYear && currentYear <= d.endYear);
        if (activeDayun && activeDayun.ganZhi) {
          currentDaYunBranch = activeDayun.ganZhi.charAt(1);
        }
      }

      combinedResult = {
        ...baziResult,
        ...dayunResult
      };
    }

    // Calculate Highlights (knowing Bazi + DaYun)
    if (baziResult && baziResult.baziDetails) {
      const allBranches = {
        year: baziResult.baziDetails.year ? baziResult.baziDetails.year.zhi : null,
        month: baziResult.baziDetails.month ? baziResult.baziDetails.month.zhi : null,
        day: baziResult.baziDetails.day ? baziResult.baziDetails.day.zhi : null,
        hour: baziResult.baziDetails.hour ? baziResult.baziDetails.hour.zhi : null
      };

      const highlightResults = calculateBranchHighlights(allBranches, currentDaYunBranch);
      baziHighlights = highlightResults.baziHighlights;
      dayunHighlight = highlightResults.dayunHighlight;

      // Populate Bazi Table with computed highlights
      populateBaziTable(baziResult.baziDetails, baziHighlights);
    }

    // Populate DaYun Table
    if (combinedResult) {
      populateDayunTable(combinedResult, dayunHighlight);
    }

  } catch (error) {
    console.error('Error updating Bazi table:', error);
  }
}

function populateBaziTable(baziDetails, externalHighlights = {}) {
  const pillars = ['year', 'month', 'day', 'hour'];

  pillars.forEach(pillar => {
    const details = baziDetails[pillar];
    if (!details) {
      if (pillar === 'hour') {
        const ids = ['main-star', 'stem', 'branch', 'hidden', 'auxiliary'];
        ids.forEach(suffix => {
          const el = document.getElementById(`${pillar}-${suffix}`);
          if (el) el.textContent = '-';
        });
      }
      return;
    }

    // Main Star
    const mainStarEl = document.getElementById(`${pillar}-main-star`);
    if (mainStarEl) mainStarEl.textContent = details.shishen || '';

    // Heavenly Stem
    const stemEl = document.getElementById(`${pillar}-stem`);
    if (stemEl) {
      const gan = details.gan || '';
      if (gan && window.getStemColor) {
        const stemInfo = window.getStemColor(gan);
        if (stemInfo.element && stemInfo.color) {
          stemEl.innerHTML = `<span class="bazi-char">${gan}</span><span class="element-circle" style="background-color: ${stemInfo.color}"><span class="element-text">${stemInfo.element}</span></span>`;
        } else {
          stemEl.innerHTML = `<span class="bazi-char">${gan}</span>`;
        }
      } else {
        stemEl.innerHTML = `<span class="bazi-char">${gan}</span>`;
      }

      // Highlight Day Master cell
      if (pillar === 'day' && gan && window.getStemColor) {
        const stemInfo = window.getStemColor(gan);
        const element = stemInfo.element;
        let bgColor = "#FEF3C7";
        switch (element) {
          case '水': bgColor = "#DBEAFE"; break;
          case '火': bgColor = "#FEE2E2"; break;
          case '木': bgColor = "#DCFCE7"; break;
          case '土': bgColor = "#EFEBE9"; break;
          case '金': bgColor = "#FEF3C7"; break;
        }
        stemEl.style.backgroundColor = bgColor;
        stemEl.style.fontWeight = "bold";
      }
    }

    // Earthly Branch
    const branchEl = document.getElementById(`${pillar}-branch`);
    if (branchEl) {
      const zhi = details.zhi || '';
      if (zhi && window.getBranchColor) {
        const branchInfo = window.getBranchColor(zhi);
        if (branchInfo.element && branchInfo.color) {
          branchEl.innerHTML = `<span class="bazi-char">${zhi}</span><span class="element-circle" style="background-color: ${branchInfo.color}"><span class="element-text">${branchInfo.element}</span></span>`;
        } else {
          branchEl.innerHTML = `<span class="bazi-char">${zhi}</span>`;
        }
      } else {
        branchEl.innerHTML = `<span class="bazi-char">${zhi}</span>`;
      }

      // Apply passed highlight
      const highlightColor = externalHighlights && externalHighlights[pillar];
      if (highlightColor) {
        branchEl.style.backgroundColor = highlightColor;
        branchEl.style.fontWeight = "bold";
      } else {
        branchEl.style.backgroundColor = "";
        branchEl.style.fontWeight = "";
      }
    }

    // Hidden Stems
    const hiddenEl = document.getElementById(`${pillar}-hidden`);
    if (hiddenEl) {
      let hiddenText = '';
      if (typeof details.hidden === 'string') hiddenText = details.hidden;
      else if (Array.isArray(details.hidden)) hiddenText = details.hidden.join('');
      else if (details.hidden) hiddenText = details.hidden.toString();
      hiddenEl.textContent = hiddenText;
    }

    // Auxiliary Stars
    const auxiliaryEl = document.getElementById(`${pillar}-auxiliary`);
    if (auxiliaryEl) {
      if (Array.isArray(details.fuxing) && details.fuxing.length > 0) {
        auxiliaryEl.innerHTML = details.fuxing.join('<br>');
      } else {
        auxiliaryEl.textContent = '';
      }
    }
  });
}

function populateDayunTable(result, dayunHighlightColor) {
  const qiyunEl = document.getElementById('dayun-start-luck');
  const jiaoyunEl = document.getElementById('dayun-transition-date');

  if (qiyunEl && result.qiyunInfo) qiyunEl.textContent = result.qiyunInfo;
  if (jiaoyunEl && result.jiaoyunDate) jiaoyunEl.textContent = result.jiaoyunDate;

  const dayunList = result.dayunList || [];
  const maxColumns = 7;

  // Rows configuration to avoid repetition
  const rows = [
    { suffix: 'shishen-top', prop: 'shishenGan' },
    { suffix: 'ganzhi', special: true }, // Special handling for GanZhi coloring
    { suffix: 'shishen-bottom', prop: 'shishenHidden', array: true },
    { suffix: 'age', special: true }, // Special handling for Age
    { suffix: 'year', prop: 'startYear' }
  ];

  for (let i = 0; i < maxColumns; i++) {
    const dayun = i < dayunList.length ? dayunList[i] : null;

    // 1. Shishen Top
    const shishenTopEl = document.getElementById(`dayun-${i}-shishen-top`);
    if (shishenTopEl) shishenTopEl.textContent = dayun && dayun.shishenGan ? dayun.shishenGan : '';

    // 2. GanZhi
    const ganzhiEl = document.getElementById(`dayun-${i}-ganzhi`);
    if (ganzhiEl) {
      if (dayun) {
        const gz = dayun.ganZhi || '';
        if (gz.length >= 2 && window.getStemColor && window.getBranchColor) {
          const gan = gz.charAt(0);
          const zhi = gz.charAt(1);
          const ganC = (window.getStemColor(gan) || {}).color || '';
          const zhiC = (window.getBranchColor(zhi) || {}).color || '';
          ganzhiEl.innerHTML = `<span style="color:${ganC};font-weight:700">${gan}</span><span style="color:${zhiC};font-weight:700">${zhi}</span>`;
        } else {
          ganzhiEl.textContent = gz;
        }
      } else {
        ganzhiEl.textContent = '';
      }
    }

    // 3. Shishen Bottom
    const shishenBottomEl = document.getElementById(`dayun-${i}-shishen-bottom`);
    if (shishenBottomEl) {
      if (dayun && Array.isArray(dayun.shishenHidden)) {
        shishenBottomEl.innerHTML = dayun.shishenHidden.join('<br>');
      } else {
        shishenBottomEl.textContent = '';
      }
    }

    // 4. Age
    const ageEl = document.getElementById(`dayun-${i}-age`);
    if (ageEl) {
      if (dayun) ageEl.textContent = `${dayun.startAge || 0}~${dayun.endAge || 0}`;
      else ageEl.textContent = '';
    }

    // 5. Year
    const yearEl = document.getElementById(`dayun-${i}-year`);
    if (yearEl) {
      if (dayun) yearEl.textContent = dayun.startYear;
      else yearEl.textContent = '';
    }
  }

  // Highlight current DaYun column
  try {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < maxColumns; i++) {
      const dayun = i < dayunList.length ? dayunList[i] : null;
      const isMainMatch = !!(dayun && currentYear >= dayun.startYear && currentYear <= dayun.endYear);

      const ids = [
        `dayun-${i}-shishen-top`,
        `dayun-${i}-ganzhi`,
        `dayun-${i}-shishen-bottom`,
        `dayun-${i}-age`,
        `dayun-${i}-year`
      ];

      ids.forEach((id, idx) => {
        const item = document.getElementById(id);
        if (item) {
          // Reset styles first
          item.style.backgroundColor = "";
          item.style.fontWeight = "";
          item.style.borderTop = "";
          item.style.borderBottom = "";
          item.style.borderLeft = "";
          item.style.borderRight = "";

          if (isMainMatch) {
            item.style.fontWeight = "bold";

            if (dayunHighlightColor) {
              // Combo Mode: Just background color
              item.style.backgroundColor = dayunHighlightColor;
            } else {
              // Default Mode: Background + Outline
              item.style.backgroundColor = "#f8f9fa";

              const borderStyle = "2px solid #3b82f6"; // Primary Blue

              // Left and Right borders for all
              item.style.borderLeft = borderStyle;
              item.style.borderRight = borderStyle;

              // Top border for first cell
              if (idx === 0) {
                item.style.borderTop = borderStyle;
              }

              // Bottom border for last cell
              if (idx === ids.length - 1) {
                item.style.borderBottom = borderStyle;
              }
            }
          }
        }
      });
    }
  } catch (e) {
    console.warn('Highlight current DaYun failed:', e);
  }
}

/**
 * Calculate highlights for Earthly Branches.
 * 
 * @param {Object} branchesMap - { year, month, day, hour }
 * @param {string|null} activeDayunBranch - The branch of the current active DaYun
 * @returns {Object} { baziHighlights: { pillar: color }, dayunHighlight: color|null }
 */
function calculateBranchHighlights(branchesMap, activeDayunBranch) {
  const pillars = ['year', 'month', 'day', 'hour'];
  const branchesList = Object.values(branchesMap).filter(b => b);
  // Add active dayun branch to set of checking if present
  const checkSet = new Set(branchesList);
  if (activeDayunBranch) checkSet.add(activeDayunBranch);

  const baziHighlights = { year: null, month: null, day: null, hour: null };
  let dayunHighlight = null; // Will store color if dayun participates in combo

  const getPillarsForBranch = (b) => pillars.filter(p => branchesMap[p] === b);

  const getElementBgColor = (element) => {
    switch (element) {
      case '水': return "#DBEAFE";
      case '火': return "#FEE2E2";
      case '木': return "#DCFCE7";
      case '土': return "#EFEBE9";
      case '金': return "#FEF3C7";
      default: return null;
    }
  };

  // Prepare Combinations List (Normalize input since constants might be array or object)
  let combinations = [];
  if (Array.isArray(window.DIRECTIONAL_COMBINATIONS)) {
    combinations = [...combinations, ...window.DIRECTIONAL_COMBINATIONS];
  } else if (window.DIRECTIONAL_COMBINATIONS) {
    combinations = [...combinations, ...Object.values(window.DIRECTIONAL_COMBINATIONS)];
  }

  if (Array.isArray(window.TRIPLE_COMBINATIONS)) {
    combinations = [...combinations, ...window.TRIPLE_COMBINATIONS];
  } else if (window.TRIPLE_COMBINATIONS) {
    combinations = [...combinations, ...Object.values(window.TRIPLE_COMBINATIONS)];
  }

  // 1. Check Combinations
  combinations.forEach(combo => {
    const requiredBranches = combo.branches;
    // Check if checkSet has all required branches
    const allPresent = requiredBranches.every(b => checkSet.has(b));

    if (allPresent) {
      // Check if Dayun is participating (if Dayun is one of the required branches)
      const isDayunParticipating = activeDayunBranch && requiredBranches.includes(activeDayunBranch);

      const color = getElementBgColor(combo.resultingElement);
      if (color) {
        // Highlight Bazi branches
        requiredBranches.forEach(branch => {
          // Highlight matching pillars
          getPillarsForBranch(branch).forEach(pillar => {
            // Logic: If daYun is interacting, we color all involved pillars. 
            // Even if the Bazi already had the combo internally, we just re-color it (same color).
            baziHighlights[pillar] = color;
          });
        });

        // Highlight Dayun if participating
        if (isDayunParticipating) {
          dayunHighlight = color;
        }
      }
    }
  });

  // 2. Check Punishments
  const punishments = window.THREE_PUNISHMENTS || {};

  // Bullying (丑戌未)
  if (punishments.BULLYING) {
    const required = punishments.BULLYING.branches;
    if (required.every(b => checkSet.has(b))) {
      const isDayunParticipating = activeDayunBranch && required.includes(activeDayunBranch);
      const color = "#EFEBE9"; // Earth

      required.forEach(branch => {
        getPillarsForBranch(branch).forEach(pillar => {
          baziHighlights[pillar] = color;
        });
      });

      if (isDayunParticipating) dayunHighlight = color;
    }
  }

  // Ingratitude (寅巳申)
  if (punishments.INGRATITUDE) {
    const required = punishments.INGRATITUDE.branches;
    if (required.every(b => checkSet.has(b))) {
      const isDayunParticipating = activeDayunBranch && required.includes(activeDayunBranch);

      const branchColors = {
        '寅': "#DCFCE7", // Wood
        '巳': "#FEE2E2", // Fire
        '申': "#FEF3C7"  // Gold
      };

      required.forEach(branch => {
        getPillarsForBranch(branch).forEach(pillar => {
          baziHighlights[pillar] = branchColors[branch];
        });
      });

      if (isDayunParticipating) {
        dayunHighlight = branchColors[activeDayunBranch];
      }
    }
  }

  return { baziHighlights, dayunHighlight };
}

window.calculateBranchHighlights = calculateBranchHighlights;

