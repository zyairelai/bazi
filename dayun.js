function calculateDayun(eightChar, gender, birthYear, dayGan) {
  try {
    // gender 为 'male' 传 1, 否则传 0
    const isMale = (gender === 'male' || gender === 'm' || gender === '1');
    const yun = eightChar.getYun(isMale ? 1 : 0);
    const dayunList = yun.getDaYun();
    
    // Calculate age 80 year (birth year + 80)
    const age80Year = birthYear + 80;

    // Get 起运 information (time after birth when DaYun starts)
    let qiyunInfo = '';
    let jiaoyunDate = '';
    try {
      // Get 起运: years, months, days after birth
      const startYears = yun.getStartYear ? yun.getStartYear() : 0;
      const startMonths = yun.getStartMonth ? yun.getStartMonth() : 0;
      const startDays = yun.getStartDay ? yun.getStartDay() : 0;
      
      // Format: 出生后1年9月25日
      qiyunInfo = `出生后${startYears}年${startMonths}月${startDays}日`;
      
      // Get 交运 date (actual date when DaYun starts)
      const startSolar = yun.getStartSolar ? yun.getStartSolar() : null;
      if (startSolar) {
        const jiaoYear = startSolar.getYear ? startSolar.getYear() : '';
        const jiaoMonth = startSolar.getMonth ? String(startSolar.getMonth()).padStart(2, '0') : '';
        const jiaoDay = startSolar.getDay ? String(startSolar.getDay()).padStart(2, '0') : '';
        jiaoyunDate = `${jiaoYear}年${jiaoMonth}月${jiaoDay}日`;
      } else {
        // Fallback: use first DaYun start year if getStartSolar not available
        const firstDayun = dayunList.length > 0 ? dayunList[0] : null;
        if (firstDayun) {
          const jiaoYear = firstDayun.getStartYear();
          jiaoyunDate = `${jiaoYear}年`;
        }
      }
    } catch (e) {
      console.warn('Error getting qiyun info:', e);
    }

    // 过滤大运：显示从出生到80岁期间的DaYun，且必须有干支
    const filteredDayun = [];
    for (let i = 0; i < dayunList.length; i++) {
      const daYun = dayunList[i];
      const sYear = daYun.getStartYear();
      const eYear = daYun.getEndYear();
      const ganZhi = daYun.getGanZhi();

      // 逻辑：起止年份只要重叠了出生到80岁期间就显示，且必须有干支值
      // If DaYun period overlaps with birth to age 80 (e.g., 79-88 overlaps with birth to 80)
      if (eYear >= birthYear && sYear <= age80Year && ganZhi && ganZhi.trim() !== '') {
        // Calculate age range
        const startAge = sYear - birthYear;
        const endAge = Math.min(eYear - birthYear, 80);
        
        // Extract 天干 and 地支 from GanZhi
        const gan = ganZhi && ganZhi.length >= 1 ? ganZhi.charAt(0) : '';
        const zhi = ganZhi && ganZhi.length >= 2 ? ganZhi.charAt(1) : '';
        
        // Calculate 十神 for 天干 (2nd row)
        let shishenGan = '';
        if (dayGan && gan && window.calculateShiShen) {
          shishenGan = window.calculateShiShen(dayGan, gan);
        }
        
        // Get 地支藏干 and calculate 十神 for each (4th row)
        const hiddenGans = zhi && window.HIDDEN_GANS ? (window.HIDDEN_GANS[zhi] || []) : [];
        const shishenHidden = hiddenGans.map(h => dayGan && window.calculateShiShen ? window.calculateShiShen(dayGan, h) : '').filter(h => h);
        
        filteredDayun.push({
          startYear: sYear,
          endYear: eYear,
          ganZhi: ganZhi,
          gan: gan,
          zhi: zhi,
          shishenGan: shishenGan, // 十神 for 天干 (2nd row)
          shishenHidden: shishenHidden, // 十神 for 地支藏干 (4th row)
          startAge: startAge,
          endAge: endAge
        });
      }
    }

    // Return Dayun information
    return {
      dayunList: filteredDayun,
      qiyunInfo: qiyunInfo,
      jiaoyunDate: jiaoyunDate,
      birthYear: birthYear
    };

  } catch (error) {
    console.error('Dayun calculation error:', error);
    return {
      dayunList: [],
      qiyunInfo: '',
      jiaoyunDate: '',
      birthYear: birthYear
    };
  }
}
