function calculateBazi(year, month, day, hour, gender) {
  try {
    // 1. 初始化阳历对象 (Solar)
    let solar;
    // 检查 hour 是否有效 (0-23)
    const hasHour = (hour !== null && hour !== undefined && hour !== "");
    
    if (hasHour) {
      solar = Solar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), parseInt(hour), 0, 0);
    } else {
      solar = Solar.fromYmd(parseInt(year), parseInt(month), parseInt(day));
    }

    // 2. 获取农历和八字基础对象
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    
    let result = '';
    
    // 3. 获取当前选定时间的干支
    const yearGz = eightChar.getYear();
    const monthGz = eightChar.getMonth();
    const dayGz = eightChar.getDay();
    
    result += `${year} ${yearGz}年 ${monthGz}月 ${dayGz}日`;
    
    if (hasHour) {
      result += ` ${eightChar.getTime()}时\n`;
    } else {
      result += '\n';
    }

    // 4. 计算大运 (Da Yun) - from birth to age 80
    // gender 为 'male' 传 1, 否则传 0
    const isMale = (gender === 'male' || gender === 'm' || gender === '1');
    const yun = eightChar.getYun(isMale ? 1 : 0);
    const dayunList = yun.getDaYun();
    
    // Calculate age 80 year (birth year + 80)
    const birthYear = parseInt(year);
    const age80Year = birthYear + 80;

    // 5. 过滤大运：显示从出生到80岁期间的DaYun，且必须有干支
    const filteredDayun = [];
    for (let i = 0; i < dayunList.length; i++) {
      const daYun = dayunList[i];
      const sYear = daYun.getStartYear();
      const eYear = daYun.getEndYear();
      const ganZhi = daYun.getGanZhi();

      // 逻辑：起止年份只要重叠了出生到80岁期间就显示，且必须有干支值
      // If DaYun period overlaps with birth to age 80 (e.g., 79-88 overlaps with birth to 80)
      if (eYear >= birthYear && sYear <= age80Year && ganZhi && ganZhi.trim() !== '') {
        filteredDayun.push({
          startYear: sYear,
          endYear: eYear,
          ganZhi: ganZhi
        });
      }
    }

    // Return object with header and dayun list
    return {
      header: result,
      dayunList: filteredDayun
    };

  } catch (error) {
    console.error('Bazi calculation error:', error);
    return `计算出错: ${error.message}`;
  }
}
