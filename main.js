// Initialize calendar and clipboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initCalendar();
  initClipboard();
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
    
    if (baziResult && baziResult.baziDetails) {
      populateBaziTable(baziResult.baziDetails);
    }
    
    // Calculate Dayun using eightChar from Bazi result
    if (baziResult && baziResult.eightChar && baziResult.baziDetails && baziResult.baziDetails.day) {
      const dayGan = baziResult.baziDetails.day.gan; // 日干
      const dayunResult = calculateDayun(baziResult.eightChar, gender, baziResult.birthYear, dayGan);
      
      // Combine results for populateDayunTable
      const combinedResult = {
        ...baziResult,
        ...dayunResult
      };
      
      populateDayunTable(combinedResult);
    }
  } catch (error) {
    console.error('Error updating Bazi table:', error);
  }
}

function populateBaziTable(baziDetails) {
  const pillars = ['year', 'month', 'day', 'hour'];
  const pillarNames = { year: 'year', month: 'month', day: 'day', hour: 'hour' };
  
  pillars.forEach(pillar => {
    const details = baziDetails[pillar];
    if (!details) {
      // Clear hour column if no hour data
      if (pillar === 'hour') {
        document.getElementById(`${pillar}-main-star`).textContent = '';
        document.getElementById(`${pillar}-stem`).textContent = '';
        document.getElementById(`${pillar}-branch`).textContent = '';
        document.getElementById(`${pillar}-hidden`).textContent = '';
        document.getElementById(`${pillar}-auxiliary`).textContent = '';
      }
      return;
    }
    
    // Main Star (主星) - using shishen
    const mainStarEl = document.getElementById(`${pillar}-main-star`);
    if (mainStarEl) {
      mainStarEl.textContent = details.shishen || '';
    }
    
    // Heavenly Stem (天干) - one character with element wrapped in colored circle
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
    }
    
    // Earthly Branch (地支) - one character with element wrapped in colored circle
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
    }
    
    // Hidden Stems (藏干)
    const hiddenEl = document.getElementById(`${pillar}-hidden`);
    if (hiddenEl) {
      // hidden is typically a string like "己癸辛" or an array
      let hiddenText = '';
      if (typeof details.hidden === 'string') {
        hiddenText = details.hidden;
      } else if (Array.isArray(details.hidden)) {
        hiddenText = details.hidden.join('');
      } else if (details.hidden && details.hidden.toString) {
        hiddenText = details.hidden.toString();
      }
      hiddenEl.textContent = hiddenText;
    }
    
    // Auxiliary Stars (副星) - 十神 following the 藏干 (array of 十神)
    const auxiliaryEl = document.getElementById(`${pillar}-auxiliary`);
    if (auxiliaryEl) {
      if (Array.isArray(details.fuxing) && details.fuxing.length > 0) {
        // Display 副星 as lines (one per hidden stem's 十神)
        auxiliaryEl.innerHTML = details.fuxing.join('<br>');
      } else {
        auxiliaryEl.textContent = '';
      }
    }
  });
}

function populateDayunTable(result) {
  // Populate 起运 and 交运 in the header
  const qiyunEl = document.getElementById('dayun-start-luck');
  const jiaoyunEl = document.getElementById('dayun-transition-date');
  
  if (qiyunEl && result.qiyunInfo) {
    qiyunEl.textContent = result.qiyunInfo;
  }
  
  if (jiaoyunEl && result.jiaoyunDate) {
    jiaoyunEl.textContent = result.jiaoyunDate;
  }
  
  const dayunList = result.dayunList || [];
  const maxColumns = 7; // 7 columns in the table
  
  // Row 2 (shishen-top row, which is the 2nd row - index 1 in tbody): 十神 following the 天干
  for (let i = 0; i < maxColumns; i++) {
    const shishenTopEl = document.getElementById(`dayun-${i}-shishen-top`);
    if (shishenTopEl) {
      if (i < dayunList.length) {
        const dayun = dayunList[i];
        shishenTopEl.textContent = dayun && dayun.shishenGan ? dayun.shishenGan : '';
      } else {
        shishenTopEl.textContent = '';
      }
    }
  }
  
  // Row 3 (ganzhi row, which is the 3rd row - index 2 in tbody): List DaYun GanZhi starting from the first one
  for (let i = 0; i < maxColumns; i++) {
    const ganzhiEl = document.getElementById(`dayun-${i}-ganzhi`);
    if (ganzhiEl) {
      if (i < dayunList.length) {
        // Show GanZhi for each DaYun
        const dayun = dayunList[i];
        ganzhiEl.textContent = dayun ? dayun.ganZhi : '';
      } else {
        ganzhiEl.textContent = '';
      }
    }
  }
  
  // Row 4 (shishen-bottom row, which is the 4th row - index 3 in tbody): 十神 following the 地支藏干
  for (let i = 0; i < maxColumns; i++) {
    const shishenBottomEl = document.getElementById(`dayun-${i}-shishen-bottom`);
    if (shishenBottomEl) {
      if (i < dayunList.length) {
        const dayun = dayunList[i];
        if (dayun && Array.isArray(dayun.shishenHidden) && dayun.shishenHidden.length > 0) {
          shishenBottomEl.innerHTML = dayun.shishenHidden.join('<br>');
        } else {
          shishenBottomEl.textContent = '';
        }
      } else {
        shishenBottomEl.textContent = '';
      }
    }
  }
  
  // Row 5 (age row, which is the 5th row - index 4 in tbody): Age ranges like "2~11"
  for (let i = 0; i < maxColumns; i++) {
    const ageEl = document.getElementById(`dayun-${i}-age`);
    if (ageEl) {
      if (i < dayunList.length) {
        // Show age range for each DaYun
        const dayun = dayunList[i];
        if (dayun) {
          const startAge = dayun.startAge || 0;
          const endAge = dayun.endAge || 0;
          ageEl.textContent = `${startAge}~${endAge}`;
        } else {
          ageEl.textContent = '';
        }
      } else {
        ageEl.textContent = '';
      }
    }
  }
  
  // Row 6 (year row, which is the 6th row - index 5 in tbody): Starting years like "1999"
  for (let i = 0; i < maxColumns; i++) {
    const yearEl = document.getElementById(`dayun-${i}-year`);
    if (yearEl) {
      if (i < dayunList.length) {
        // Show starting year for each DaYun
        const dayun = dayunList[i];
        yearEl.textContent = dayun ? dayun.startYear : '';
      } else {
        yearEl.textContent = '';
      }
    }
  }
}
