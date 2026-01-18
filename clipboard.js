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
  
  const calendarRadio = document.querySelector('input[name="calendar"]:checked');
  const calendarType = calendarRadio ? calendarRadio.value : 'solar';
  
  // Get bazi calculation result (contains header and dayun list)
  const baziResult = calculateBazi(year, month, day, hour, gender, calendarType);
  
  // Filter DaYun for clipboard: only show periods that overlap with 2024-2040
  let result = baziResult.header;
  
  for (let i = 0; i < baziResult.dayunList.length; i++) {
    const daYun = baziResult.dayunList[i];
    const sYear = daYun.startYear;
    const eYear = daYun.endYear;
    const ganZhi = daYun.ganZhi;
    
    // Filter: only show DaYun that overlaps with 2024-2040
    if (eYear >= 2024 && sYear <= 2040) {
      result += `${sYear}-${eYear} ${ganZhi}大运\n`;
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
