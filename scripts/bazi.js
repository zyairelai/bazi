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

function calculateBazi(year, month, day, hour, gender, calendarType = 'solar', inputTimezone = 8) {
  try {
    // 1. Convert input date & time from inputTimezone to target UTC+8 (Bazi Standard Time)
    let calcYear = parseInt(year);
    let calcMonth = parseInt(month);
    let calcDay = parseInt(day);
    let calcHour = hour !== null && hour !== undefined && hour !== "" ? parseInt(hour) : null;

    if (inputTimezone !== 8 && calcHour !== null) {
      // Calculate offset hours difference (UTC+8 minus inputTimezone)
      const diffHours = 8 - inputTimezone;
      const dateObj = new Date(Date.UTC(calcYear, calcMonth - 1, calcDay, calcHour, 0, 0));
      dateObj.setUTCHours(dateObj.getUTCHours() + diffHours);

      calcYear = dateObj.getUTCFullYear();
      calcMonth = dateObj.getUTCMonth() + 1;
      calcDay = dateObj.getUTCDate();
      calcHour = dateObj.getUTCHours();
    }

    // 2. Initialize objects based on calendar type
    let solar;
    let lunar;
    const hasHour = (calcHour !== null && calcHour !== undefined);

    let solarForDay, solarForHour;
    let hourGz = '';

    if (calendarType === 'lunar') {
      let isLeapMonth = false;
      let actualMonth = calcMonth;
      if (calcMonth > 12) {
        isLeapMonth = true;
        actualMonth = calcMonth - 12;
      }

      try {
        if (hasHour) {
          if (calcHour === 23) {
            lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay, isLeapMonth);
            const nextLunar = lunar.next(1);
            solarForDay = nextLunar.getSolar();
            solarForHour = nextLunar.getSolar();
          } else {
            lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay, isLeapMonth);
            solarForDay = lunar.getSolar();
            solarForHour = Solar.fromYmdHms(solarForDay.getYear(), solarForDay.getMonth(), solarForDay.getDay(), calcHour, 0, 0);
          }
          solar = solarForDay;
        } else {
          lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay, isLeapMonth);
          solarForDay = lunar.getSolar();
          solarForHour = solarForDay;
          solar = solarForDay;
        }
      } catch (e) {
        try {
          if (hasHour) {
            if (calcHour === 23) {
              lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay);
              if (isLeapMonth && lunar.setLeapMonth) {
                lunar.setLeapMonth(true);
              }
              const nextLunar = lunar.next(1);
              solarForDay = nextLunar.getSolar();
              solarForHour = nextLunar.getSolar();
            } else {
              lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay);
              if (isLeapMonth && lunar.setLeapMonth) {
                lunar.setLeapMonth(true);
              }
              solarForDay = lunar.getSolar();
              solarForHour = Solar.fromYmdHms(solarForDay.getYear(), solarForDay.getMonth(), solarForDay.getDay(), calcHour, 0, 0);
            }
            solar = solarForDay;
          } else {
            lunar = Lunar.fromYmd(calcYear, actualMonth, calcDay);
            if (isLeapMonth && lunar.setLeapMonth) {
              lunar.setLeapMonth(true);
            }
            solarForDay = lunar.getSolar();
            solarForHour = solarForDay;
            solar = solarForDay;
          }
        } catch (e2) {
          throw new Error(`Invalid lunar date: ${calcYear}-${actualMonth}${isLeapMonth ? '(闰)' : ''}-${calcDay}`);
        }
      }
    } else {
      if (hasHour) {
        if (calcHour === 23) {
          const nextDay = new Date(calcYear, calcMonth - 1, calcDay);
          nextDay.setDate(nextDay.getDate() + 1);
          solarForDay = Solar.fromYmdHms(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate(), 0, 0, 0);
          solarForHour = Solar.fromYmdHms(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate(), 0, 0, 0);
        } else {
          solarForDay = Solar.fromYmdHms(calcYear, calcMonth, calcDay, calcHour, 0, 0);
          solarForHour = solarForDay;
        }
        solar = solarForDay;
      } else {
        solar = Solar.fromYmd(calcYear, calcMonth, calcDay);
        solarForDay = solar;
        solarForHour = solar;
      }
    }

    if (!lunar) {
      lunar = solarForDay.getLunar();
    }
    const eightChar = lunar.getEightChar();

    const hourLunar = solarForHour.getLunar();
    const hourEightChar = hourLunar.getEightChar();
    hourGz = hourEightChar.getTime();

    let result = '';

    const yearGz = eightChar.getYear();
    const monthGz = eightChar.getMonth();
    const dayGz = eightChar.getDay();

    const tzString = inputTimezone >= 0 ? `UTC+${inputTimezone}` : `UTC${inputTimezone}`;
    result += `${year} ${yearGz}年 ${monthGz}月 ${dayGz}日 (${tzString})`;

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

    const isman = gender === 'male';
    const niannayin = eightChar.getYearNaYin ? eightChar.getYearNaYin() : '';
    const baziArray = [
      yearGz.charAt(0) || '', yearGz.charAt(1) || '',
      monthGz.charAt(0) || '', monthGz.charAt(1) || '',
      dayGz.charAt(0) || '', dayGz.charAt(1) || '',
      hasHour ? hourGz.charAt(0) : '', hasHour ? hourGz.charAt(1) : ''
    ];

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
          fuxing: fuxing,
          shensha: typeof queryShenSha === 'function' ? queryShenSha(yearGz, baziArray, isman, 1, niannayin) : []
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
          fuxing: fuxing,
          shensha: typeof queryShenSha === 'function' ? queryShenSha(monthGz, baziArray, isman, 2, niannayin) : []
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
          fuxing: hiddenArray.map(h => calculateShiShen(dayGan, h)).filter(h => h),
          shensha: typeof queryShenSha === 'function' ? queryShenSha(dayGz, baziArray, isman, 3, niannayin) : []
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
          fuxing: fuxing,
          shensha: typeof queryShenSha === 'function' ? queryShenSha(hourGz, baziArray, isman, 4, niannayin) : []
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
