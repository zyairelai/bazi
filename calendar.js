// const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

// Chinese time periods (时辰) mapping
const SHICHEN = [
  { name: "不确定", hour: -1, range: "Unknown", isUnknown: true },
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
}

function populateDropdowns() {
  for (let year = 1940; year <= 2100; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  // Populate months
  MONTH_NAMES.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });
  
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

function updateDaysDropdown() {
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value) - 1; // JavaScript months are 0-indexed
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  // Clear existing options
  dateSelect.innerHTML = '';
  
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

function updateDate() {
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value) - 1;
  const hourValue = hourSelect.value;
  
  // Check if month or year changed - need to update days dropdown
  const monthChanged = month !== previousMonth;
  const yearChanged = year !== previousYear;
  
  let date = parseInt(dateSelect.value);
  
  if (monthChanged || yearChanged) {
    updateDaysDropdown();
    // Ensure selected date is valid for the new month
    const lastDate = new Date(year, month + 1, 0).getDate();
    date = Math.min(date || 1, lastDate);
    dateSelect.value = date;
  }
  
  // Handle unknown hour (-1 means skip hour)
  let hour = 0; // default hour
  if (hourValue !== '-1' && hourValue !== '') {
    hour = parseInt(hourValue);
  } else {
    // Keep current hour if unknown is selected
    hour = selectedDate.getHours();
  }
  
  selectedDate = new Date(year, month, date, hour, selectedDate.getMinutes());
  
  renderUI();
}

function renderUI() {
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
    // hourToShichen returns 0-12 for the original shichen (before unknown was added)
    // Since unknown is now at index 0, we need to add 1 to get the correct index
    const targetHour = parseInt(h);
    const shichenIndex = hourToShichen(targetHour);
    // SHICHEN[0] is unknown, actual shichen start at index 1
    // hourToShichen(0) = 0 (早子时) -> should map to SHICHEN[1]
    // hourToShichen(1) = 1 (丑时) -> should map to SHICHEN[2]
    // So we add 1 to the index
    if (shichenIndex + 1 < SHICHEN.length) {
      hourSelect.value = SHICHEN[shichenIndex + 1].hour;
    }
  }
}
