#!/bin/python3

try:
    from lunar_python import Solar
except ImportError:
    print("library not found, run:")
    print("pip3 install --upgrade lunar-python --break-system-packages")
    exit(1)

from datetime import datetime

def calc_dayun(solar, gender):
    lunar = solar.getLunar()
    eight_char = lunar.getEightChar()

    is_male = gender.lower() == 'm' or gender.lower() == '1'
    yun = eight_char.getYun(is_male)

    # Generate Da Yun periods
    dayun_list = yun.getDaYun()

    # Filter dayun list to make sure we only consider valid ones with GanZhi
    valid_dayuns = [d for d in dayun_list if d.getGanZhi() and d.getGanZhi().strip()]

    if valid_dayuns:
        current_year = datetime.now().year
        active_idx = -1
        for idx, d in enumerate(valid_dayuns):
            if current_year >= d.getStartYear() and current_year <= d.getEndYear():
                active_idx = idx
                break

        # If not started yet, default to first DaYun
        if active_idx == -1 and current_year < valid_dayuns[0].getStartYear():
            active_idx = 0

        if active_idx != -1:
            # Print current DaYun
            curr = valid_dayuns[active_idx]
            print(f"{curr.getStartYear()}-{curr.getEndYear()} {curr.getGanZhi()}大运")

            # Print next DaYun if it exists
            if active_idx + 1 < len(valid_dayuns):
                nxt = valid_dayuns[active_idx + 1]
                print(f"{nxt.getStartYear()}-{nxt.getEndYear()} {nxt.getGanZhi()}大运")

# ========== Main Script ==========

if __name__ == "__main__":
    try:
        # Input section
        gender = input("Gender (m/f): ").strip().lower()
        birth_year = int(input("Birth Year: "))
        birth_month = int(input("Birth Month: "))
        birth_day = int(input("Birth Date: "))
        birth_time_input = input("Birth Time (0-23, or press Enter to skip): ").strip()

        from datetime import datetime, timedelta
        
        if birth_time_input:
            birth_hour = int(birth_time_input)
            # 处理晚子时 (23:00-23:59): 需要特殊处理
            if birth_hour == 23:
                # 晚子时：使用下一天的日期来计算农历日，小时干支用下一天的早子时
                birth_date = datetime(birth_year, birth_month, birth_day)
                next_day = birth_date + timedelta(days=1)
                solar = Solar.fromYmdHms(next_day.year, next_day.month, next_day.day, 0, 0, 0)
                # 小时干支用下一天的早子时 (hour 0 of next day)
                solar_for_hour = Solar.fromYmdHms(next_day.year, next_day.month, next_day.day, 0, 0, 0)
            else:
                # 早子时 (0) 和其他时辰：使用当前日期
                solar = Solar.fromYmdHms(birth_year, birth_month, birth_day, birth_hour, 0, 0)
                solar_for_hour = solar
        else:
            solar = Solar.fromYmd(birth_year, birth_month, birth_day)
            solar_for_hour = solar

        # Get Lunar object and GanZhi
        lunar = solar.getLunar()
        year_gz = lunar.getYearInGanZhi()
        month_gz = lunar.getMonthInGanZhi()
        day_gz = lunar.getDayInGanZhi()

        if not birth_time_input:
            print("\nHour not specified. Showing 12 possible combinations:")
            for i in range(0, 24, 2):
                temp_solar = Solar.fromYmdHms(birth_year, birth_month, birth_day, i, 0, 0)
                temp_lunar = temp_solar.getLunar()
                hour_gz = temp_lunar.getTimeInGanZhi()
                time_range = f"{i:02d}:00-{i+1:02d}:59"
                # print(f"{time_range} → {birth_year}年 {year_gz}年 {month_gz}月 {day_gz}日 {hour_gz}时")
                print(f"{birth_year}年 {year_gz}年 {month_gz}月 {day_gz}日 {hour_gz}时")

        print("\n【八字命盘 十年大运】\n")
        print(f"{birth_year} {year_gz}年 {month_gz}月 {day_gz}日", end="")

        if birth_time_input:
            # 获取小时干支（对于晚子时，使用下一天的早子时的小时干支）
            hour_lunar = solar_for_hour.getLunar()
            hour_gz = hour_lunar.getTimeInGanZhi()
            print(f" {hour_gz}时")
        else:
            print("")

        # Calculate and print Da Yun
        calc_dayun(solar, gender)

    except KeyboardInterrupt:
        print("\n [i] Cancelled")

    except ValueError:
        print("\n [i] Invalid input")
