import type { BaziInput, DayunItem, LiunianItem, Ganzhi } from '../types/bazi';
import { STEMS, STEM_WUXING, STEM_YINYANG } from '../constants/heavenlyStem';
import { BRANCHES, BRANCH_WUXING, BRANCH_YINYANG, BRANCH_HIDDEN } from '../constants/earthlyBranch';
import { getJieqiAround } from './lunarCalendar';
import { calcShishen } from '../constants/wuxing';

function makeGanzhi60(index: number): Ganzhi {
  const gz60 = ((index % 60) + 60) % 60;
  const si = gz60 % 10;
  const bi = gz60 % 12;
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

function makeYearGanzhi(year: number): Ganzhi {
  // 以甲子年=4为基准
  const gz60 = ((year - 4) % 60 + 60) % 60;
  return makeGanzhi60(gz60);
}

export function calcDayun(
  input: BaziInput,
  monthPillarGanzhiIndex: number,
  yearStemYinyang: '阳' | '阴',
  dayStem: import('../types/bazi').HeavenlyStem
): {
  dayunList: DayunItem[];
  qiyunAge: number;
  qiyunYear: number;
} {
  const { gender, birthYear, birthMonth, birthDay } = input;

  // 判断顺逆：阳男阴女顺行，阴男阳女逆行
  const isForward = (gender === 'male' && yearStemYinyang === '阳') ||
                    (gender === 'female' && yearStemYinyang === '阴');

  // 获取出生日附近节气
  const jieqiInfo = getJieqiAround(birthYear, birthMonth, birthDay);

  // 顺行取下一个节气，逆行取上一个节气
  const diffDays = isForward ? jieqiInfo.nextJieqiDays : jieqiInfo.prevJieqiDays;

  // 3天=1年，精确到月：totalMonths = diffDays * 4
  const totalMonths = diffDays * 4;
  const qiyunYears = Math.floor(totalMonths / 12);
  const qiyunMonths = Math.round(totalMonths % 12);

  const qiyunAge = qiyunYears + qiyunMonths / 12;
  const qiyunYear = birthYear + qiyunYears + (qiyunMonths >= 6 ? 1 : 0);

  // 生成大运列表（10步）
  const dayunList: DayunItem[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 10; i++) {
    const step = isForward ? (i + 1) : -(i + 1);
    const dayunGz60 = ((monthPillarGanzhiIndex + step * 10) % 60 + 60) % 60;
    const dayunGanzhi = makeGanzhi60(dayunGz60);

    const startAge = qiyunYears + i * 10;
    const startYear = birthYear + startAge;
    const endAge = startAge + 9;

    // 生成该大运下的流年
    const liunian: LiunianItem[] = [];
    for (let j = 0; j < 10; j++) {
      const lyYear = startYear + j;
      const lyAge = startAge + j;
      const lyGanzhi = makeYearGanzhi(lyYear);
      const lyShishen = calcShishen(dayStem, lyGanzhi.stem);
      liunian.push({
        year: lyYear,
        ganzhi: lyGanzhi,
        age: lyAge,
        isCurrent: lyYear === currentYear,
        shishen: lyShishen,
      });
    }

    const isCurrent = startYear <= currentYear && currentYear <= startYear + 9;
    const shishenStem = calcShishen(dayStem, dayunGanzhi.stem);
    const shishenBranch = calcShishen(dayStem, dayunGanzhi.hiddenStems[0]);

    dayunList.push({
      index: i + 1,
      ganzhi: dayunGanzhi,
      startAge,
      startYear,
      endAge,
      liunian,
      isCurrent,
      shishenStem,
      shishenBranch,
    });
  }

  return { dayunList, qiyunAge, qiyunYear };
}
