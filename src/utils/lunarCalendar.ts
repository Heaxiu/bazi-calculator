import { Solar } from 'lunar-typescript';
import type { LunarInfo } from '../types/bazi';
import { SHICHEN_NAMES } from '../constants/earthlyBranch';

export function solarToLunar(
  year: number, month: number, day: number, hour: number
): LunarInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const lunarMonth = lunar.getMonth();
  const isLeap = lunarMonth < 0;
  const absMonth = Math.abs(lunarMonth);

  const numToChinese = (n: number): string => {
    const nums = ['零','一','二','三','四','五','六','七','八','九','十',
                  '十一','十二'];
    return nums[n] ?? String(n);
  };

  const dayToChinese = (d: number): string => {
    const days = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
    return days[d] ?? String(d);
  };

  return {
    lunarYear: lunar.getYear(),
    lunarMonth: absMonth,
    lunarDay: lunar.getDay(),
    isLeapMonth: isLeap,
    lunarYearStr: `农历${lunar.getYear()}年`,
    lunarMonthStr: `${isLeap ? '闰' : ''}${numToChinese(absMonth)}月`,
    lunarDayStr: dayToChinese(lunar.getDay()),
    shiChen: SHICHEN_NAMES[hour] ?? '子时',
  };
}

// 获取出生日附近的节气（供大运计算使用）
export function getJieqiAround(
  year: number, month: number, day: number
): { prevJieqiDays: number; nextJieqiDays: number; prevJieqiName: string; nextJieqiName: string } {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const prevJq = lunar.getPrevJieQi(true);
  const nextJq = lunar.getNextJieQi(true);

  const birthDate = new Date(year, month - 1, day);

  const prevSolar = prevJq.getSolar();
  const nextSolar = nextJq.getSolar();

  const prevDate = new Date(prevSolar.getYear(), prevSolar.getMonth() - 1, prevSolar.getDay());
  const nextDate = new Date(nextSolar.getYear(), nextSolar.getMonth() - 1, nextSolar.getDay());

  const msPerDay = 86400000;
  const prevDays = (birthDate.getTime() - prevDate.getTime()) / msPerDay;
  const nextDays = (nextDate.getTime() - birthDate.getTime()) / msPerDay;

  return {
    prevJieqiDays: prevDays,
    nextJieqiDays: nextDays,
    prevJieqiName: prevJq.getName(),
    nextJieqiName: nextJq.getName(),
  };
}

// 获取某年立春的Solar对象
export function getLiChun(year: number): Solar {
  // 通过遍历正月找立春
  for (let d = 1; d <= 31; d++) {
    try {
      const s = Solar.fromYmd(year, 2, d);
      const l = s.getLunar();
      const jq = l.getJieQi();
      if (jq === '立春') return s;
    } catch { /* skip */ }
  }
  // fallback: 2月4日附近
  return Solar.fromYmd(year, 2, 4);
}
