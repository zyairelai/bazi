/**
 * 核心八字大运计算逻辑
 * 移植自 Python 版 lunar_python 逻辑
 */

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

    // 4. 计算大运 (Da Yun)
    // gender 为 'male' 传 1, 否则传 0
    const isMale = (gender === 'male' || gender === 'm' || gender === '1');
    const yun = eightChar.getYun(isMale ? 1 : 0);
    const dayunList = yun.getDaYun();

    // 5. 过滤大运：仅显示与 2024-2040 有交集的年份，且必须有干支
    for (let i = 0; i < dayunList.length; i++) {
      const daYun = dayunList[i];
      const sYear = daYun.getStartYear();
      const eYear = daYun.getEndYear();
      const ganZhi = daYun.getGanZhi();

      // 逻辑：起止年份只要重叠了 2024-2040 期间就显示，且必须有干支值
      if (eYear >= 2024 && sYear <= 2040 && ganZhi && ganZhi.trim() !== '') {
        result += `${sYear}-${eYear} ${ganZhi}大运\n`;
      }
    }

    return result;

  } catch (error) {
    console.error('Bazi calculation error:', error);
    return `计算出错: ${error.message}`;
  }
}

/**
 * 供 main.js 调用的接口函数
 * 获取当前页面选择的状态并返回结果字符串
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
  
  return calculateBazi(year, month, day, hour, gender);
}