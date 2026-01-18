// const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

// Chinese time periods (时辰) mapping
const SHICHEN = [
  { name: "不确定", hour: -1, range: "Not Sure", isUnknown: true },
  { name: "早子时", hour: 0, range: "00:00-00:59" },
  { name: "丑时", hour: 1, range: "01:00-02:59" },
  { name: "寅时", hour: 3, range: "03:00-04:59" },
  { name: "卯时", hour: 5, range: "05:00-06:59" },
  { name: "辰时", hour: 7, range: "07:00-08:59" },
  { name: "巳时", hour: 9, range: "09:00-10:59" },
  { name: "午时", hour: 11, range: "11:00-12:59" },
  { name: "未时", hour: 13, range: "13:00-14:59" },
  { name: "申时", hour: 15, range: "15:00-16:59" },
  { name: "酉时", hour: 17, range: "17:00-18:59" },
  { name: "戌时", hour: 19, range: "19:00-20:59" },
  { name: "亥时", hour: 21, range: "21:00-22:59" },
  { name: "晚子时", hour: 23, range: "23:00-23:59" }
];

function getGmt8Date() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 8));
}

// Convert hour to shichen index
function hourToShichen(hour) {
  if (hour === 0) return 0; // 早子时
  if (hour >= 1 && hour <= 2) return 1; // 丑时
  if (hour >= 3 && hour <= 4) return 2; // 寅时
  if (hour >= 5 && hour <= 6) return 3; // 卯时
  if (hour >= 7 && hour <= 8) return 4; // 辰时
  if (hour >= 9 && hour <= 10) return 5; // 巳时
  if (hour >= 11 && hour <= 12) return 6; // 午时
  if (hour >= 13 && hour <= 14) return 7; // 未时
  if (hour >= 15 && hour <= 16) return 8; // 申时
  if (hour >= 17 && hour <= 18) return 9; // 酉时
  if (hour >= 19 && hour <= 20) return 10; // 戌时
  if (hour >= 21 && hour <= 22) return 11; // 亥时
  if (hour === 23) return 12; // 晚子时
  return 0; // default
}

// Make selectedDate globally accessible
var selectedDate = getGmt8Date();

const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const dateSelect = document.getElementById('dateSelect');
const hourSelect = document.getElementById('hourSelect');

function initCalendar() {
  populateDropdowns();
  
  // Initialize previous values before renderUI
  previousMonth = selectedDate.getMonth();
  previousYear = selectedDate.getFullYear();
  
  // Populate days dropdown initially
  updateDaysDropdown();
  
  renderUI();
  
  // Add event listeners
  yearSelect.addEventListener('change', updateDate);
  monthSelect.addEventListener('change', updateDate);
  dateSelect.addEventListener('change', updateDate);
  hourSelect.addEventListener('change', updateDate);
  
  // Add event listeners for calendar type radio buttons
  const calendarRadios = document.querySelectorAll('input[name="calendar"]');
  calendarRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const calendarType = getCalendarType();
      const year = parseInt(yearSelect.value);
      
      // Update months dropdown first
      updateMonthsDropdown();
      
      // When switching to lunar, try to convert current solar date to lunar
      if (calendarType === 'lunar') {
        try {
          const solar = Solar.fromYmd(year, parseInt(monthSelect.value), parseInt(dateSelect.value));
          const lunar = solar.getLunar();
          const lunarYear = lunar.getYear();
          const lunarMonth = lunar.getMonth();
          const lunarDay = lunar.getDay();
          const isLeap = lunar.isLeap();
          
          // Update dropdowns with lunar values
          yearSelect.value = lunarYear;
          // Set month - if leap month, add 12
          monthSelect.value = isLeap ? 12 + lunarMonth : lunarMonth;
          updateDaysDropdown();
          dateSelect.value = lunarDay;
          
          // Store lunar values
          currentLunarYear = lunarYear;
          currentLunarMonth = isLeap ? 12 + lunarMonth : lunarMonth;
          currentLunarDay = lunarDay;
        } catch (e) {
          // If conversion fails, just update dropdowns
          updateDaysDropdown();
        }
      } else {
        // When switching to solar, convert lunar to solar if we have lunar values
        if (currentLunarYear !== null && currentLunarMonth !== null && currentLunarDay !== null) {
          try {
            let isLeapMonth = false;
            let actualMonth = currentLunarMonth;
            if (currentLunarMonth > 12) {
              isLeapMonth = true;
              actualMonth = currentLunarMonth - 12;
            }
            const lunar = Lunar.fromYmd(currentLunarYear, actualMonth, currentLunarDay, isLeapMonth);
            const solar = lunar.getSolar();
            yearSelect.value = solar.getYear();
            monthSelect.value = solar.getMonth();
            updateDaysDropdown();
            dateSelect.value = solar.getDay();
          } catch (e) {
            // If conversion fails, just update dropdowns
            updateDaysDropdown();
          }
        } else {
          updateDaysDropdown();
        }
      }
      
      // Trigger update
      updateDate();
    });
  });
}

function getCalendarType() {
  const calendarRadio = document.querySelector('input[name="calendar"]:checked');
  return calendarRadio ? calendarRadio.value : 'solar';
}

function populateDropdowns() {
  // Clear existing options
  yearSelect.innerHTML = '';
  monthSelect.innerHTML = '';
  dateSelect.innerHTML = '';
  hourSelect.innerHTML = '';
  
  for (let year = 1940; year <= 2030; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  // Populate months based on calendar type
  updateMonthsDropdown();
  
  // Populate Chinese time periods (时辰)
  SHICHEN.forEach((shichen, index) => {
    const option = document.createElement('option');
    option.value = shichen.hour;
    if (shichen.isUnknown) {
      option.textContent = `${shichen.name} ${shichen.range}`;
    } else {
      option.textContent = `${shichen.name} ${shichen.range}`;
    }
    hourSelect.appendChild(option);
    // Set "不确定" as default (first option)
    if (index === 0) {
      option.selected = true;
    }
  });
}

function updateMonthsDropdown() {
  const calendarType = getCalendarType();
  monthSelect.innerHTML = '';
  
  if (calendarType === 'lunar') {
    // For lunar calendar, populate months including leap months
    const year = parseInt(yearSelect.value) || (selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
    
    try {
      // Get lunar months for the selected year
      // Start with regular months 1-12
      for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '月';
        monthSelect.appendChild(option);
      }
      
      // Check for leap month in this year
      // Try to detect by checking if we can create a leap month for each month
      let leapMonth = 0;
      for (let m = 1; m <= 12; m++) {
        try {
          const testLeap = Lunar.fromYmd(year, m, 1, true);
          if (testLeap) {
            leapMonth = m;
            break;
          }
        } catch (e) {
          // Continue checking
        }
      }
      
      if (leapMonth > 0) {
        // Insert leap month after the regular month
        const leapOption = document.createElement('option');
        leapOption.value = 12 + leapMonth; // Store as month + 12 to indicate leap
        leapOption.textContent = '闰' + leapMonth + '月';
        // Insert after the regular month
        const insertAfter = monthSelect.children[leapMonth - 1];
        if (insertAfter && insertAfter.nextSibling) {
          monthSelect.insertBefore(leapOption, insertAfter.nextSibling);
        } else {
          monthSelect.appendChild(leapOption);
        }
      }
    } catch (e) {
      // Fallback: just show regular months if API call fails
      for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '月';
        monthSelect.appendChild(option);
      }
    }
  } else {
    // Solar calendar: regular months
    MONTH_NAMES.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = index + 1;
      option.textContent = month;
      monthSelect.appendChild(option);
    });
  }
}

function updateDaysDropdown() {
  const year = parseInt(yearSelect.value);
  const monthValue = parseInt(monthSelect.value);
  const calendarType = getCalendarType();
  
  // Clear existing options
  dateSelect.innerHTML = '';
  
  let lastDate;
  
  if (calendarType === 'lunar') {
    // Lunar calendar: get days from Lunar object
    try {
      // Check if it's a leap month (month > 12)
      let isLeapMonth = false;
      let actualMonth = monthValue;
      if (monthValue > 12) {
        isLeapMonth = true;
        actualMonth = monthValue - 12;
      }
      
      // Get lunar month info - find maximum valid day by testing
      // Start with 30 and work backwards to find the last valid day
      lastDate = 30;
      for (let testDay = 30; testDay >= 1; testDay--) {
        try {
          const testLunar = Lunar.fromYmd(year, actualMonth, testDay, isLeapMonth);
          if (testLunar) {
            lastDate = testDay;
            break;
          }
        } catch (e) {
          // Continue to next day
        }
      }
    } catch (e) {
      // Fallback: try without leap month parameter
      try {
        let isLeapMonth = false;
        let actualMonth = monthValue;
        if (monthValue > 12) {
          isLeapMonth = true;
          actualMonth = monthValue - 12;
        }
        // Fallback: find maximum valid day by testing
        lastDate = 30;
        for (let testDay = 30; testDay >= 1; testDay--) {
          try {
            const testLunar = Lunar.fromYmd(year, actualMonth, testDay);
            if (isLeapMonth && testLunar.setLeapMonth) {
              testLunar.setLeapMonth(true);
            }
            if (testLunar) {
              lastDate = testDay;
              break;
            }
          } catch (e) {
            // Continue to next day
          }
        }
      } catch (e2) {
        // Final fallback: assume 30 days for lunar month
        lastDate = 30;
      }
    }
  } else {
    // Solar calendar: use JavaScript Date
    const month = monthValue - 1; // JavaScript months are 0-indexed
    lastDate = new Date(year, month + 1, 0).getDate();
  }
  
  // Populate days (01-31 with leading zeros)
  for (let day = 1; day <= lastDate; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = String(day).padStart(2, '0') + '日';
    dateSelect.appendChild(option);
  }
}

let previousMonth = null;
let previousYear = null;
// Store lunar date values separately to avoid confusion
let currentLunarYear = null;
let currentLunarMonth = null;
let currentLunarDay = null;

function updateDate() {
  const year = parseInt(yearSelect.value);
  const monthValue = parseInt(monthSelect.value);
  const hourValue = hourSelect.value;
  const calendarType = getCalendarType();
  
  // Check if month or year changed - need to update days dropdown
  const monthChanged = monthValue !== (previousMonth !== null ? previousMonth + 1 : null);
  const yearChanged = year !== previousYear;
  
  let date = parseInt(dateSelect.value);
  
  if (monthChanged || yearChanged) {
    if (calendarType === 'lunar') {
      updateMonthsDropdown(); // Update months in case leap month changed
      // Re-select the month
      monthSelect.value = monthValue;
    }
    updateDaysDropdown();
    // Ensure selected date is valid for the new month
    const maxDays = dateSelect.options.length;
    date = Math.min(date || 1, maxDays);
    dateSelect.value = date;
  }
  
  // Handle unknown hour (-1 means skip hour)
  let hour = 0; // default hour
  if (hourValue !== '-1' && hourValue !== '') {
    hour = parseInt(hourValue);
  } else {
    // Keep current hour if unknown is selected
    hour = selectedDate ? selectedDate.getHours() : 0;
  }
  
  // Update selectedDate based on calendar type
  if (calendarType === 'lunar') {
    // Store lunar values
    currentLunarYear = year;
    currentLunarMonth = monthValue;
    currentLunarDay = date;
    
    // For lunar, we store the lunar values but convert to solar for selectedDate (for internal use only)
    try {
      let isLeapMonth = false;
      let actualMonth = monthValue;
      if (monthValue > 12) {
        isLeapMonth = true;
        actualMonth = monthValue - 12;
      }
      const lunar = Lunar.fromYmd(year, actualMonth, date, isLeapMonth);
      const solar = lunar.getSolar();
      // Get solar date components
      const solarYear = solar.getYear();
      const solarMonth = solar.getMonth();
      const solarDay = solar.getDay();
      selectedDate = new Date(solarYear, solarMonth - 1, solarDay, hour, 0);
    } catch (e) {
      // Fallback
      try {
        let isLeapMonth = false;
        let actualMonth = monthValue;
        if (monthValue > 12) {
          isLeapMonth = true;
          actualMonth = monthValue - 12;
        }
        const lunar = Lunar.fromYmd(year, actualMonth, date);
        if (isLeapMonth && lunar.setLeapMonth) {
          lunar.setLeapMonth(true);
        }
        const solar = lunar.getSolar();
        const solarYear = solar.getYear();
        const solarMonth = solar.getMonth();
        const solarDay = solar.getDay();
        selectedDate = new Date(solarYear, solarMonth - 1, solarDay, hour, 0);
      } catch (e2) {
        // Final fallback: use current date
        selectedDate = new Date(year, 0, date, hour, 0);
      }
    }
  } else {
    // Solar calendar: direct date
    const month = monthValue - 1; // JavaScript months are 0-indexed
    selectedDate = new Date(year, month, date, hour, selectedDate ? selectedDate.getMinutes() : 0);
    // Clear lunar values when using solar
    currentLunarYear = null;
    currentLunarMonth = null;
    currentLunarDay = null;
  }
  
  // Update previous values
  previousMonth = calendarType === 'lunar' ? monthValue - 1 : monthValue - 1;
  previousYear = year;
  
  renderUI();
  
  // Update Bazi table if function exists
  if (typeof updateBaziTable === 'function') {
    updateBaziTable();
  }
}

function renderUI() {
  const calendarType = getCalendarType();
  
  // For lunar calendar, don't update dropdowns from selectedDate (which is solar)
  // Instead, keep the lunar values that user selected
  if (calendarType === 'lunar') {
    // Only update hour select if needed
    const currentHourValue = hourSelect.value;
    if (currentHourValue !== '-1') {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const targetHour = parseInt(h);
      const shichenIndex = hourToShichen(targetHour);
      if (shichenIndex + 1 < SHICHEN.length) {
        hourSelect.value = SHICHEN[shichenIndex + 1].hour;
      }
    }
    // Don't update year/month/day dropdowns - they should reflect lunar values
    return;
  }
  
  // For solar calendar, update from selectedDate as before
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const h = String(selectedDate.getHours()).padStart(2, '0');
  const min = String(selectedDate.getMinutes()).padStart(2, '0');
  
  // Update dropdown values
  yearSelect.value = y;
  monthSelect.value = parseInt(m);
  // Only update days dropdown if month/year changed (to avoid redundant updates)
  if (previousMonth !== selectedDate.getMonth() || previousYear !== selectedDate.getFullYear()) {
    updateDaysDropdown();
    previousMonth = selectedDate.getMonth();
    previousYear = selectedDate.getFullYear();
  }
  dateSelect.value = parseInt(d);
  // Set the correct shichen based on hour, or keep unknown if it was selected
  const currentHourValue = hourSelect.value;
  if (currentHourValue === '-1') {
    // Keep unknown selected - don't change it
    hourSelect.value = -1;
  } else {
    // Find the shichen that matches the current hour
    const targetHour = parseInt(h);
    const shichenIndex = hourToShichen(targetHour);
    if (shichenIndex + 1 < SHICHEN.length) {
      hourSelect.value = SHICHEN[shichenIndex + 1].hour;
    }
  }
}
