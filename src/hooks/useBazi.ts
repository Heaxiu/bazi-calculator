import { useState, useCallback } from 'react';
import { Solar } from 'lunar-typescript';
import type {
  BaziInput, BaziResult, Ganzhi, FourPillars,
  HeavenlyStem, EarthlyBranch, DayunItem, LiunianItem,
  WuxingScore, Shishen,
} from '../types/bazi';
import { STEMS, STEM_WUXING, STEM_YINYANG, NAYIN } from '../constants/heavenlyStem';
import { BRANCHES, BRANCH_WUXING, BRANCH_YINYANG, BRANCH_HIDDEN, getChangSheng } from '../constants/earthlyBranch';
import { calcWuxingScore, calcBodyStrength, calcXiyongshen } from '../utils/wuxing';
import { calcShishen } from '../constants/wuxing';
import { calcShenshe } from '../constants/shenshe';
import { solarToLunar } from '../utils/lunarCalendar';

// ── 辅助：从干支字符串构建 Ganzhi 对象 ──────────────────────────────────────
function buildGanzhi(gz2: string): Ganzhi {
  const stem = gz2[0] as HeavenlyStem;
  const branch = gz2[1] as EarthlyBranch;
  const si = STEMS.indexOf(stem);
  const bi = BRANCHES.indexOf(branch);
  // 六十甲子精确序号
  let gz60 = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === si && i % 12 === bi) { gz60 = i; break; }
  }
  return {
    stem,
    branch,
    stemWuxing: STEM_WUXING[stem],
    branchWuxing: BRANCH_WUXING[branch],
    stemYinyang: STEM_YINYANG[stem],
    branchYinyang: BRANCH_YINYANG[branch],
    hiddenStems: BRANCH_HIDDEN[branch] ?? [],
    ganzhiIndex: gz60,
  };
}

// ── 辅助：从年份构建流年 Ganzhi ──────────────────────────────────────────────
function yearToGanzhi(year: number): Ganzhi {
  const gz60 = ((year - 4) % 60 + 60) % 60;
  const si = gz60 % 10;
  const bi = gz60 % 12;
  return buildGanzhi(STEMS[si] + BRANCHES[bi]);
}

export function useBazi() {
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((input: BaziInput) => {
    try {
      setError(null);
      const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, isEarlyZiHour } = input;

      // ── 处理晚子时换日 ─────────────────────────────────────────────────────
      let calcYear = birthYear, calcMonth = birthMonth, calcDay = birthDay;
      if (birthHour === 23 && !isEarlyZiHour) {
        const next = new Date(birthYear, birthMonth - 1, birthDay + 1);
        calcYear = next.getFullYear();
        calcMonth = next.getMonth() + 1;
        calcDay = next.getDate();
      }

      // ── 创建 Solar + EightChar ─────────────────────────────────────────────
      const solar = Solar.fromYmdHms(calcYear, calcMonth, calcDay, birthHour, birthMinute, 0);
      const lunar = solar.getLunar();
      const ba = lunar.getEightChar();

      // ── 四柱干支 ──────────────────────────────────────────────────────────
      const yearGz  = buildGanzhi(ba.getYear());
      const monthGz = buildGanzhi(ba.getMonth());
      const dayGz   = buildGanzhi(ba.getDay());
      const hourGz  = buildGanzhi(ba.getTime());

      const fourPillars: FourPillars = { year: yearGz, month: monthGz, day: dayGz, hour: hourGz };

      // ── 胎元 / 命宫 / 身宫 ────────────────────────────────────────────────
      const taiyuan  = buildGanzhi(ba.getTaiYuan());
      const minggong = buildGanzhi(ba.getMingGong());
      const shengong = buildGanzhi(ba.getShenGong());

      // ── 农历信息 ──────────────────────────────────────────────────────────
      const lunarInfo = solarToLunar(birthYear, birthMonth, birthDay, birthHour);

      // ── 五行得分 ──────────────────────────────────────────────────────────
      const wuxingScore: WuxingScore = calcWuxingScore(fourPillars);
      const bodyStrength = calcBodyStrength(fourPillars, wuxingScore);
      const xiyongshen = calcXiyongshen(fourPillars, wuxingScore, bodyStrength);

      // ── 十神 ──────────────────────────────────────────────────────────────
      const dayStem = dayGz.stem;
      const shishenMap = {
        yearStem:    calcShishen(dayStem, yearGz.stem),
        yearBranch:  calcShishen(dayStem, yearGz.hiddenStems[0]) as Shishen,
        monthStem:   calcShishen(dayStem, monthGz.stem),
        monthBranch: calcShishen(dayStem, monthGz.hiddenStems[0]) as Shishen,
        hourStem:    calcShishen(dayStem, hourGz.stem),
        hourBranch:  calcShishen(dayStem, hourGz.hiddenStems[0]) as Shishen,
      };

      // ── 神煞 ──────────────────────────────────────────────────────────────
      const dayGzIdx  = dayGz.ganzhiIndex;
      const yearBranch = yearGz.branch;
      const shensheMap = {
        year:  calcShenshe(yearGz.branch,  yearGz.stem,  dayStem, dayGzIdx, yearBranch, 'year'),
        month: calcShenshe(monthGz.branch, monthGz.stem, dayStem, dayGzIdx, yearBranch, 'month'),
        day:   calcShenshe(dayGz.branch,   dayGz.stem,   dayStem, dayGzIdx, yearBranch, 'day'),
        hour:  calcShenshe(hourGz.branch,  hourGz.stem,  dayStem, dayGzIdx, yearBranch, 'hour'),
      };

      // ── 大运（直接用 EightChar API）───────────────────────────────────────
      const genderCode = gender === 'male' ? 1 : 0;
      const yun = ba.getYun(genderCode);
      const qiyunAge  = yun.getStartYear() + yun.getStartMonth() / 12 + yun.getStartDay() / 365;
      const qiyunYear = birthYear + Math.round(qiyunAge);

      const daYuns = yun.getDaYun(10);
      const currentYear = new Date().getFullYear();

      const dayunList: DayunItem[] = daYuns.map((dy, i) => {
        const gz2 = dy.getGanZhi();
        // 第0步是命宫前置，可能为空字符串；从第1步起取实际大运
        if (!gz2 || gz2.length < 2) {
          return null;
        }
        const dyGanzhi = buildGanzhi(gz2);
        const startYear = dy.getStartYear();
        const endYear   = dy.getEndYear();
        const startAge  = dy.getStartAge();
        const endAge    = dy.getEndAge();

        // 流年
        const liunianRaw = dy.getLiuNian(10);
        const liunian: LiunianItem[] = liunianRaw.map(ln => {
          const lyYear = ln.getYear();
          const lyGanzhi = yearToGanzhi(lyYear);
          return {
            year: lyYear,
            ganzhi: lyGanzhi,
            age: ln.getAge(),
            isCurrent: lyYear === currentYear,
            shishen: calcShishen(dayStem, lyGanzhi.stem) as Shishen,
          };
        });

        const isCurrent = startYear <= currentYear && currentYear <= endYear;
        return {
          index: i + 1,
          ganzhi: dyGanzhi,
          startAge,
          startYear,
          endAge,
          liunian,
          isCurrent,
          shishenStem:   calcShishen(dayStem, dyGanzhi.stem) as Shishen,
          shishenBranch: calcShishen(dayStem, dyGanzhi.hiddenStems[0]) as Shishen,
        } as DayunItem;
      }).filter((d): d is DayunItem => d !== null);

      // ── 纳音 ──────────────────────────────────────────────────────────────
      const nayin = {
        year:  ba.getYearNaYin()  || NAYIN[yearGz.ganzhiIndex]  || '',
        month: ba.getMonthNaYin() || NAYIN[monthGz.ganzhiIndex] || '',
        day:   ba.getDayNaYin()   || NAYIN[dayGz.ganzhiIndex]   || '',
        hour:  ba.getTimeNaYin()  || NAYIN[hourGz.ganzhiIndex]  || '',
      };

      // ── 长生 ──────────────────────────────────────────────────────────────
      const changsheng = {
        year:  getChangSheng(dayStem, yearGz.branch),
        month: getChangSheng(dayStem, monthGz.branch),
        day:   getChangSheng(dayStem, dayGz.branch),
        hour:  getChangSheng(dayStem, hourGz.branch),
      };

      const baziResult: BaziResult = {
        input,
        lunarInfo,
        fourPillars,
        taiyuanMingGong: { taiyuan, minggong, shengong },
        wuxingScore,
        xiyongshen,
        shishenMap,
        shensheMap,
        dayunList,
        qiyunAge,
        qiyunYear,
        bodyStrength,
        nayin,
        changsheng,
      };

      setResult(baziResult);
      return baziResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '计算出错，请检查输入信息';
      setError(msg);
      return null;
    }
  }, []);

  return { result, error, calculate };
}
