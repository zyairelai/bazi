/**
 * Clipboard functionality for copying Bazi results
 */

/**
 * Get current Bazi result based on selected date and gender
 * This function collects the form values and calls the calculation
 * Returns formatted string with filtered DaYun for clipboard (2024-2040)
 */
function getCurrentBazi() {
  // 获取 HTML 元素的值
  const year = document.getElementById('yearSelect').value;
  const month = document.getElementById('monthSelect').value;
  const day = document.getElementById('dateSelect').value;
  let hour = document.getElementById('hourSelect').value;

  // If hour is -1 (不确定/Unknown), pass null/empty to skip hour in calculation
  if (hour === '-1' || hour === '') {
    hour = null;
  }

  const genderRadio = document.querySelector('input[name="gender"]:checked');
  const gender = genderRadio ? genderRadio.value : 'male';

  const timezoneSelect = document.getElementById('timezoneSelect');
  const timezoneValue = parseInt(timezoneSelect ? timezoneSelect.value : '8', 10);

  // Get bazi calculation result
  const baziResult = calculateBazi(year, month, day, hour, gender, calendarType, timezoneValue);

  // Get dayun calculation result
  let dayunResult = { dayunList: [] };
  if (baziResult && baziResult.eightChar) {
    dayunResult = calculateDayun(baziResult.eightChar, gender, baziResult.birthYear);
  }

  // Format output: header + dayun list
  let result = baziResult.header || '';

  // Add DaYun periods - only show current and next DaYun dynamically
  if (dayunResult && dayunResult.dayunList && dayunResult.dayunList.length > 0) {
    const currentYear = new Date().getFullYear();
    let activeIndex = dayunResult.dayunList.findIndex(d => currentYear >= d.startYear && currentYear <= d.endYear);

    // If current year is before the first DaYun starts, default to the first DaYun
    if (activeIndex === -1 && currentYear < dayunResult.dayunList[0].startYear) {
      activeIndex = 0;
    }

    if (activeIndex !== -1) {
      // Current DaYun
      const currentDaYun = dayunResult.dayunList[activeIndex];
      if (currentDaYun && currentDaYun.ganZhi) {
        result += `${currentDaYun.startYear}-${currentDaYun.endYear} ${currentDaYun.ganZhi}大运\n`;
      }

      // Next DaYun
      const nextDaYun = dayunResult.dayunList[activeIndex + 1];
      if (nextDaYun && nextDaYun.ganZhi) {
        result += `${nextDaYun.startYear}-${nextDaYun.endYear} ${nextDaYun.ganZhi}大运\n`;
      }
    }
  }

  return result;
}

/**
 * Initialize clipboard button functionality
 */
function initClipboard() {
  const copyBtn = document.getElementById('copyBtn');
  if (!copyBtn) {
    console.error('Copy button not found');
    return;
  }

  let timer = null;
  const originalIcon = copyBtn.textContent;

  copyBtn.onclick = function() {
    const baziResult = getCurrentBazi();

    // Clear any existing timer to prevent stuck state
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    // Execute copy
    navigator.clipboard.writeText(baziResult).then(() => {
      this.textContent = '✅';

      timer = setTimeout(() => {
        this.textContent = originalIcon;
        timer = null;
      }, 1000);
    }).catch(err => {
      console.error('复制失败:', err);
      // Reset button text even on error
      this.textContent = originalIcon;
      timer = null;
    });
  };
}
