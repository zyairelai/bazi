// Bazi calculation using lunar-javascript library
function calculateBazi(year, month, day, hour, gender) {
  try {
    // Create solar date
    let solar;
    if (hour !== null && hour !== undefined) {
      solar = Lunar.Solar.fromYmdHms(year, month, day, hour, 0, 0);
    } else {
      solar = Lunar.Solar.fromYmd(year, month, day);
    }

    // Get lunar object
    const lunar = solar.getLunar();
    
    // Get GanZhi (干支)
    const yearGz = lunar.getYearInGanZhi();
    const monthGz = lunar.getMonthInGanZhi();
    const dayGz = lunar.getDayInGanZhi();
    
    let result = '';
    
    // If hour is specified, get hour GanZhi
    if (hour !== null && hour !== undefined) {
      const hourGz = lunar.getTimeInGanZhi();
      result = `${year}年 ${yearGz}年 ${monthGz}月 ${dayGz}日 ${hourGz}时\n\n`;
    } else {
      result = `${year}年 ${yearGz}年 ${monthGz}月 ${dayGz}日\n\n`;
    }
    
    // Calculate DaYun (大运)
    result += '【八字命盘 十年大运】\n\n';
    result += `${year} ${yearGz}年 ${monthGz}月 ${dayGz}日`;
    
    if (hour !== null && hour !== undefined) {
      const hourGz = lunar.getTimeInGanZhi();
      result += ` ${hourGz}时\n`;
    } else {
      result += '\n';
    }
    
    // Calculate DaYun based on gender
    const eightChar = lunar.getEightChar();
    const isMale = gender === 'male';
    const yun = eightChar.getYun(isMale);
    const dayunList = yun.getDaYun();
    
    // Filter DaYun periods that overlap 2024-2040
    for (let i = 0; i < dayunList.length; i++) {
      const daYun = dayunList[i];
      const sYear = daYun.getStartYear();
      const eYear = daYun.getEndYear();
      const ganZhi = daYun.getGanZhi();
      
      // Only show Da Yun if it overlaps 2024-2040
      if (eYear >= 2024 && sYear <= 2040) {
        result += `${sYear}-${eYear} ${ganZhi}大运\n`;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Bazi calculation error:', error);
    return `Error calculating Bazi: ${error.message}`;
  }
}

// Get current bazi result based on selected date and gender
function getCurrentBazi() {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
  const day = selectedDate.getDate();
  const hour = selectedDate.getHours();
  
  // Get gender from radio buttons
  const genderRadio = document.querySelector('input[name="gender"]:checked');
  const gender = genderRadio ? genderRadio.value : 'male';
  
  return calculateBazi(year, month, day, hour, gender);
}
