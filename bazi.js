// Helper function to calculate 十神 (Ten Gods) between two stems
// Make it globally available for dayun.js
window.calculateShiShen = function(dayGan, targetGan) {
  if (!dayGan || !targetGan || !window.STEM_INFO || !window.SHI_SHEN_MAP) {
    return '';
  }
  
  const dayInfo = window.STEM_INFO[dayGan];
  const targetInfo = window.STEM_INFO[targetGan];
  
  if (!dayInfo || !targetInfo) {
    return '';
  }
  
  const dayElement = dayInfo.element;
  const targetElement = targetInfo.element;
  const dayPolarity = dayInfo.polarity;
  const targetPolarity = targetInfo.polarity;
  const samePolarity = dayPolarity === targetPolarity;
  
  // Same element
  if (dayElement === targetElement) {
    return samePolarity ? window.SHI_SHEN_MAP.SAME_ELEMENT.same : window.SHI_SHEN_MAP.SAME_ELEMENT.different;
  }
  
  // Check if target generates day master
  const generatesMe = window.ELEMENT_RELATIONSHIPS.generating[targetElement] === dayElement;
  if (generatesMe) {
    return samePolarity ? window.SHI_SHEN_MAP.GENERATES_ME.same : window.SHI_SHEN_MAP.GENERATES_ME.different;
  }
  
  // Check if day master generates target
  const iGenerate = window.ELEMENT_RELATIONSHIPS.generating[dayElement] === targetElement;
  if (iGenerate) {
    return samePolarity ? window.SHI_SHEN_MAP.I_GENERATE.same : window.SHI_SHEN_MAP.I_GENERATE.different;
  }
  
  // Check if target overcomes day master
  const overcomesMe = window.ELEMENT_RELATIONSHIPS.overcoming[targetElement] === dayElement;
  if (overcomesMe) {
    return samePolarity ? window.SHI_SHEN_MAP.OVERCOMES_ME.same : window.SHI_SHEN_MAP.OVERCOMES_ME.different;
  }
  
  // Check if day master overcomes target
  const iOvercome = window.ELEMENT_RELATIONSHIPS.overcoming[dayElement] === targetElement;
  if (iOvercome) {
    return samePolarity ? window.SHI_SHEN_MAP.I_OVERCOME.same : window.SHI_SHEN_MAP.I_OVERCOME.different;
  }
  
  return '';
};

// Helper function to get hidden stems from branch using constants
function getHiddenGanFromConstants(zhi) {
  if (!zhi || !window.HIDDEN_GANS) {
    return [];
  }
  return window.HIDDEN_GANS[zhi] || [];
}

function calculateBazi(year, month, day, hour, gender, calendarType = 'solar') {
  try {
    // 1. 根据日历类型初始化对象
    let solar;
    let lunar;
    // 检查 hour 是否有效 (0-23)
    const hasHour = (hour !== null && hour !== undefined && hour !== "");
    
    let solarForDay, solarForHour;
    let hourGz = '';
    
    if (calendarType === 'lunar') {
      // 阴历输入：直接使用农历日期
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const dayInt = parseInt(day);
      
      // 检查是否是闰月（如果月份大于12，则月份-12是闰月月份）
      let isLeapMonth = false;
      let actualMonth = monthInt;
      if (monthInt > 12) {
        isLeapMonth = true;
        actualMonth = monthInt - 12;
      }
      
      // 从农历创建Lunar对象
      // lunar-javascript API: Lunar.fromYmd(year, month, day, isLeapMonth)
      try {
        if (hasHour) {
          const hourInt = parseInt(hour);
          // 处理晚子时 (23:00-23:59): 需要特殊处理
          if (hourInt === 23) {
            // 晚子时：使用下一天的农历日期
            lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt, isLeapMonth);
            const nextLunar = lunar.next(1);
            solarForDay = nextLunar.getSolar();
            solarForHour = nextLunar.getSolar();
          } else {
            // 早子时 (0) 和其他时辰：使用当前农历日期
            lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt, isLeapMonth);
            solarForDay = lunar.getSolar();
            // For hour calculation, we need to use the solar date with the hour
            solarForHour = Solar.fromYmdHms(solarForDay.getYear(), solarForDay.getMonth(), solarForDay.getDay(), hourInt, 0, 0);
          }
          solar = solarForDay;
        } else {
          lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt, isLeapMonth);
          solarForDay = lunar.getSolar();
          solarForHour = solarForDay;
          solar = solarForDay;
        }
      } catch (e) {
        // Fallback: try without leap month parameter if API doesn't support it
        try {
          if (hasHour) {
            const hourInt = parseInt(hour);
            if (hourInt === 23) {
              lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt);
              if (isLeapMonth && lunar.setLeapMonth) {
                lunar.setLeapMonth(true);
              }
              const nextLunar = lunar.next(1);
              solarForDay = nextLunar.getSolar();
              solarForHour = nextLunar.getSolar();
            } else {
              lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt);
              if (isLeapMonth && lunar.setLeapMonth) {
                lunar.setLeapMonth(true);
              }
              solarForDay = lunar.getSolar();
              solarForHour = Solar.fromYmdHms(solarForDay.getYear(), solarForDay.getMonth(), solarForDay.getDay(), hourInt, 0, 0);
            }
            solar = solarForDay;
          } else {
            lunar = Lunar.fromYmd(yearInt, actualMonth, dayInt);
            if (isLeapMonth && lunar.setLeapMonth) {
              lunar.setLeapMonth(true);
            }
            solarForDay = lunar.getSolar();
            solarForHour = solarForDay;
            solar = solarForDay;
          }
        } catch (e2) {
          throw new Error(`Invalid lunar date: ${yearInt}-${actualMonth}${isLeapMonth ? '(闰)' : ''}-${dayInt}`);
        }
      }
    } else {
      // 阳历输入：原有逻辑
      if (hasHour) {
        const hourInt = parseInt(hour);
        // 处理晚子时 (23:00-23:59): 需要特殊处理
        if (hourInt === 23) {
          // 晚子时：使用下一天的日期来计算农历日，小时干支用下一天的早子时
          const nextDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          nextDay.setDate(nextDay.getDate() + 1);
          solarForDay = Solar.fromYmdHms(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate(), 0, 0, 0);
          // 小时干支用下一天的早子时 (hour 0 of next day)
          solarForHour = Solar.fromYmdHms(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate(), 0, 0, 0);
        } else {
          // 早子时 (0) 和其他时辰：使用当前日期
          solarForDay = Solar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hourInt, 0, 0);
          solarForHour = solarForDay;
        }
        solar = solarForDay;
      } else {
        solar = Solar.fromYmd(parseInt(year), parseInt(month), parseInt(day));
        solarForDay = solar;
        solarForHour = solar;
      }
    }

    // 2. 获取农历和八字基础对象
    if (!lunar) {
      lunar = solarForDay.getLunar();
    }
    const eightChar = lunar.getEightChar();
    
    // 获取小时干支（对于晚子时，使用下一天的早子时的小时干支）
    const hourLunar = solarForHour.getLunar();
    const hourEightChar = hourLunar.getEightChar();
    hourGz = hourEightChar.getTime();
    
    let result = '';
    
    // 3. 获取当前选定时间的干支
    const yearGz = eightChar.getYear();
    const monthGz = eightChar.getMonth();
    const dayGz = eightChar.getDay();
    
    result += `${year} ${yearGz}年 ${monthGz}月 ${dayGz}日`;
    
    if (hasHour) {
      result += ` ${hourGz}时\n`;
    } else {
      result += '\n';
    }

    // Helper function to get hidden gan (藏干) - using constants
    function getHiddenGan(lunarObj, pillar) {
      try {
        let zhiChar = '';
        if (pillar === 'year') {
          const yearGz = eightChar.getYear();
          zhiChar = yearGz && yearGz.length >= 2 ? yearGz.charAt(1) : '';
        } else if (pillar === 'month') {
          const monthGz = eightChar.getMonth();
          zhiChar = monthGz && monthGz.length >= 2 ? monthGz.charAt(1) : '';
        } else if (pillar === 'day') {
          const dayGz = eightChar.getDay();
          zhiChar = dayGz && dayGz.length >= 2 ? dayGz.charAt(1) : '';
        } else if (pillar === 'hour') {
          zhiChar = hourGz && hourGz.length >= 2 ? hourGz.charAt(1) : '';
        }
        
        if (zhiChar && window.HIDDEN_GANS && window.HIDDEN_GANS[zhiChar]) {
          return window.HIDDEN_GANS[zhiChar].join('');
        }
      } catch (e) {
        console.warn(`Error getting hidden gan for ${pillar}:`, e);
      }
      return '';
    }

    // Get day master (日干) for 十神 calculations
    const dayGan = dayGz && dayGz.length >= 1 ? dayGz.charAt(0) : '';
    
    // Extract detailed Bazi information for table display
    const baziDetails = {
      year: (() => {
        const gan = yearGz && yearGz.length >= 1 ? yearGz.charAt(0) : '';
        const zhi = yearGz && yearGz.length >= 2 ? yearGz.charAt(1) : '';
        const hidden = getHiddenGan(lunar, 'year');
        const hiddenArray = hidden ? hidden.split('') : [];
        // 主星: 十神 following the 天干 (relative to day master)
        const shishen = calculateShiShen(dayGan, gan);
        // 副星: 十神 following the 藏干 (relative to day master)
        const fuxing = hiddenArray.map(h => calculateShiShen(dayGan, h)).filter(h => h);
        
        return {
          ganzhi: yearGz,
          gan: gan,
          zhi: zhi,
          hidden: hidden,
          shishen: shishen,
          fuxing: fuxing
        };
      })(),
      month: (() => {
        const gan = monthGz && monthGz.length >= 1 ? monthGz.charAt(0) : '';
        const zhi = monthGz && monthGz.length >= 2 ? monthGz.charAt(1) : '';
        const hidden = getHiddenGan(lunar, 'month');
        const hiddenArray = hidden ? hidden.split('') : [];
        const shishen = calculateShiShen(dayGan, gan);
        const fuxing = hiddenArray.map(h => calculateShiShen(dayGan, h)).filter(h => h);
        
        return {
          ganzhi: monthGz,
          gan: gan,
          zhi: zhi,
          hidden: hidden,
          shishen: shishen,
          fuxing: fuxing
        };
      })(),
      day: (() => {
        const gan = dayGz && dayGz.length >= 1 ? dayGz.charAt(0) : '';
        const zhi = dayGz && dayGz.length >= 2 ? dayGz.charAt(1) : '';
        const hidden = getHiddenGan(lunar, 'day');
        const hiddenArray = hidden ? hidden.split('') : [];
        
        return {
          ganzhi: dayGz,
          gan: gan,
          zhi: zhi,
          hidden: hidden,
          shishen: '日元', // Day Master
          fuxing: hiddenArray.map(h => calculateShiShen(dayGan, h)).filter(h => h)
        };
      })(),
      hour: hasHour ? (() => {
        const gan = hourGz && hourGz.length >= 1 ? hourGz.charAt(0) : '';
        const zhi = hourGz && hourGz.length >= 2 ? hourGz.charAt(1) : '';
        const hidden = getHiddenGan(lunar, 'hour');
        const hiddenArray = hidden ? hidden.split('') : [];
        const shishen = calculateShiShen(dayGan, gan);
        const fuxing = hiddenArray.map(h => calculateShiShen(dayGan, h)).filter(h => h);
        
        return {
          ganzhi: hourGz,
          gan: gan,
          zhi: zhi,
          hidden: hidden,
          shishen: shishen,
          fuxing: fuxing
        };
      })() : null
    };

    // Return object with header and detailed bazi info
    const birthYear = parseInt(year);
    return {
      header: result,
      baziDetails: baziDetails,
      eightChar: eightChar,
      lunar: lunar,
      birthYear: birthYear
    };

  } catch (error) {
    console.error('Bazi calculation error:', error);
    return `计算出错: ${error.message}`;
  }
}
