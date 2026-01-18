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
