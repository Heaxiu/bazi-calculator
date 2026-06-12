import type { Ganzhi, HeavenlyStem, EarthlyBranch, FourPillars, BaziInput } from '../types/bazi';
import { STEMS, STEM_WUXING, STEM_YINYANG, NAYIN } from '../constants/heavenlyStem';
import { BRANCHES, BRANCH_WUXING, BRANCH_YINYANG, BRANCH_HIDDEN, getChangSheng, hourToBranchIndex } from '../constants/earthlyBranch';
import { Solar } from 'lunar-typescript';

// 构建干支对象
function makeGanzhi(stemIdx: number, branchIdx: number): Ganzhi {
  const si = ((stemIdx % 10) + 10) % 10;
  const bi = ((branchIdx % 12) + 12) % 12;
  const ganzhiIndex = si * 6 + Math.floor(bi * 5 / 6); // 近似，下面精确计算
  // 六十甲子精确序号
  let gz60 = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === si && i % 12 === bi) { gz60 = i; break; }
  }
  const stem = STEMS[si];
  const branch = BRANCHES[bi];
  return {
    stem,
    branch,
    stemWuxing: STEM_WUXING[stem],
    branchWuxing: BRANCH_WUXING[branch],
    stemYinyang: STEM_YINYANG[stem],
    branchYinyang: BRANCH_YINYANG[branch],
    hiddenStems: BRANCH_HIDDEN[branch],
    ganzhiIndex: gz60,
  };
}

// 公历转儒略日（简化版）
function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// 年柱：以立春为界
function calcYearPillar(year: number, month: number, day: number): Ganzhi {
  let y = year;
  // 用 lunar-typescript 判断是否在立春前
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    // lunar-typescript 的年干支以立春为界
    const yearGanzhi = lunar.getYearInGanZhi();
    const stemIdx = STEMS.indexOf(yearGanzhi[0] as HeavenlyStem);
    const branchIdx = BRANCHES.indexOf(yearGanzhi[1] as EarthlyBranch);
    return makeGanzhi(stemIdx, branchIdx);
  } catch {
    // fallback
    const stemIdx = ((y - 4) % 10 + 10) % 10;
    const branchIdx = ((y - 4) % 12 + 12) % 12;
    return makeGanzhi(stemIdx, branchIdx);
  }
}

// 月柱：以节气为界
function calcMonthPillar(year: number, month: number, day: number, yearStemIdx: number): Ganzhi {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const monthGanzhi = lunar.getMonthInGanZhi();
    const stemIdx = STEMS.indexOf(monthGanzhi[0] as HeavenlyStem);
    const branchIdx = BRANCHES.indexOf(monthGanzhi[1] as EarthlyBranch);
    return makeGanzhi(stemIdx, branchIdx);
  } catch {
    // fallback：五虎遁年起月
    const monthStemBase = [2, 4, 6, 8, 0];
    const base = monthStemBase[yearStemIdx % 5];
    // 近似月支（从寅月=2开始）
    const approxMonthBranch = (month + 1) % 12; // 粗略
    const stemIdx = (base + approxMonthBranch) % 10;
    const branchIdx = (approxMonthBranch + 2) % 12;
    return makeGanzhi(stemIdx, branchIdx);
  }
}

// 日柱：优先用 lunar-typescript，晚子时换日
function calcDayPillar(year: number, month: number, day: number, hour: number, isEarlyZi: boolean): Ganzhi {
  try {
    // 晚子时（23:00后，且不是早子时选项）算次日干支
    let y = year, m = month, d = day;
    if (hour === 23 && !isEarlyZi) {
      // 计算次日
      const nextDay = new Date(y, m - 1, d + 1);
      y = nextDay.getFullYear();
      m = nextDay.getMonth() + 1;
      d = nextDay.getDate();
    }
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const dayGanzhi = lunar.getDayInGanZhi();
    const stemIdx = STEMS.indexOf(dayGanzhi[0] as HeavenlyStem);
    const branchIdx = BRANCHES.indexOf(dayGanzhi[1] as EarthlyBranch);
    return makeGanzhi(stemIdx, branchIdx);
  } catch {
    // fallback：儒略日法
    let jd = toJulianDay(year, month, day);
    if (hour === 23 && !isEarlyZi) jd += 1;
    const BASE_JD = 2415080;
    const diff = jd - BASE_JD;
    const stemIdx = ((diff % 10) + 10) % 10;
    const branchIdx = ((diff % 12) + 12) % 12;
    return makeGanzhi(stemIdx, branchIdx);
  }
}

// 时柱：五鼠遁日起时
function calcHourPillar(hour: number, dayStemIdx: number): Ganzhi {
  const branchIdx = hourToBranchIndex(hour);
  // 五鼠遁日起时：甲己日起甲子时(0)，乙庚起丙子(2)，丙辛起戊子(4)，丁壬起庚子(6)，戊癸起壬子(8)
  const hourStemBase = [0, 2, 4, 6, 8];
  const base = hourStemBase[dayStemIdx % 5];
  const stemIdx = (base + branchIdx) % 10;
  return makeGanzhi(stemIdx, branchIdx);
}

// 胎元：月干+1，月支+3
function calcTaiyuan(monthPillar: Ganzhi): Ganzhi {
  const mStemIdx = STEMS.indexOf(monthPillar.stem);
  const mBranchIdx = BRANCHES.indexOf(monthPillar.branch);
  return makeGanzhi((mStemIdx + 1) % 10, (mBranchIdx + 3) % 12);
}

// 命宫：以太阳（月）逆数，从寅月起
function calcMinggong(monthPillar: Ganzhi, hourPillar: Ganzhi, yearStemIdx: number): Ganzhi {
  // 命宫月支 = 寅(idx2) + (14 - 月支序号 - 时支序号) % 12
  const mBranchIdx = BRANCHES.indexOf(monthPillar.branch);
  const hBranchIdx = BRANCHES.indexOf(hourPillar.branch);
  const mgBranchIdx = ((14 - mBranchIdx - hBranchIdx) % 12 + 12) % 12;
  // 命宫天干：五虎遁年起月
  const monthStemBase = [2, 4, 6, 8, 0];
  const base = monthStemBase[yearStemIdx % 5];
  // 命宫月份相对于寅月的偏移
  const offset = (mgBranchIdx - 2 + 12) % 12;
  const mgStemIdx = (base + offset) % 10;
  return makeGanzhi(mgStemIdx, mgBranchIdx);
}

// 身宫：日支+时支→五虎遁
function calcShengong(dayPillar: Ganzhi, hourPillar: Ganzhi): Ganzhi {
  // 身宫 = 日支+时支，以月建法推
  const dBranchIdx = BRANCHES.indexOf(dayPillar.branch);
  const hBranchIdx = BRANCHES.indexOf(hourPillar.branch);
  const sgBranchIdx = (dBranchIdx + hBranchIdx) % 12;
  const dayStemIdx = STEMS.indexOf(dayPillar.stem);
  const monthStemBase = [2, 4, 6, 8, 0];
  const base = monthStemBase[dayStemIdx % 5];
  const offset = (sgBranchIdx - 2 + 12) % 12;
  const sgStemIdx = (base + offset) % 10;
  return makeGanzhi(sgStemIdx, sgBranchIdx);
}

// 获取纳音
export function getNayin(gz: Ganzhi): string {
  return NAYIN[gz.ganzhiIndex] ?? '';
}

// 主函数：计算四柱
export function calcFourPillars(input: BaziInput): {
  fourPillars: FourPillars;
  taiyuan: Ganzhi;
  minggong: Ganzhi;
  shengong: Ganzhi;
} {
  const { birthYear, birthMonth, birthDay, birthHour, isEarlyZiHour = false } = input;

  const yearPillar  = calcYearPillar(birthYear, birthMonth, birthDay);
  const yearStemIdx = STEMS.indexOf(yearPillar.stem);
  const monthPillar = calcMonthPillar(birthYear, birthMonth, birthDay, yearStemIdx);
  const dayPillar   = calcDayPillar(birthYear, birthMonth, birthDay, birthHour, isEarlyZiHour);
  const dayStemIdx  = STEMS.indexOf(dayPillar.stem);
  const hourPillar  = calcHourPillar(birthHour, dayStemIdx);

  const taiyuan  = calcTaiyuan(monthPillar);
  const minggong = calcMinggong(monthPillar, hourPillar, yearStemIdx);
  const shengong = calcShengong(dayPillar, hourPillar);

  return {
    fourPillars: { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar },
    taiyuan,
    minggong,
    shengong,
  };
}

// 获取日柱的长生状态
export function getPillarChangsheng(pillar: Ganzhi, dayStem: HeavenlyStem) {
  return getChangSheng(dayStem, pillar.branch);
}
