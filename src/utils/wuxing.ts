import type { FourPillars, WuxingScore, Wuxing, Ganzhi } from '../types/bazi';
import { STEM_WUXING } from '../constants/heavenlyStem';
import { BRANCH_HIDDEN } from '../constants/earthlyBranch';

// 五行得分权重体系（子平派）
const WEIGHTS = {
  yearStem: 3, yearBranch: 3,
  monthStem: 5, monthBranch: 10,  // 月令最重
  dayStem: 5,  dayBranch: 3,
  hourStem: 3, hourBranch: 3,
  hiddenMain: 0.6,  // 主气 60%
  hiddenMid: 0.3,   // 中气 30%
  hiddenResi: 0.1,  // 余气 10%
};

function addHiddenScore(score: WuxingScore, gz: Ganzhi, branchWeight: number) {
  const hidden = BRANCH_HIDDEN[gz.branch];
  if (!hidden || hidden.length === 0) return;
  const ratios = hidden.length === 1
    ? [1.0]
    : hidden.length === 2
      ? [WEIGHTS.hiddenMain + WEIGHTS.hiddenMid, WEIGHTS.hiddenResi]
      : [WEIGHTS.hiddenMain, WEIGHTS.hiddenMid, WEIGHTS.hiddenResi];

  hidden.forEach((stem, i) => {
    const wx = STEM_WUXING[stem];
    score[wx] += branchWeight * (ratios[i] ?? 0);
  });
}

export function calcWuxingScore(fourPillars: FourPillars): WuxingScore {
  const score: WuxingScore = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  const { year, month, day, hour } = fourPillars;

  // 天干得分
  score[STEM_WUXING[year.stem]]  += WEIGHTS.yearStem;
  score[STEM_WUXING[month.stem]] += WEIGHTS.monthStem;
  score[STEM_WUXING[day.stem]]   += WEIGHTS.dayStem;
  score[STEM_WUXING[hour.stem]]  += WEIGHTS.hourStem;

  // 地支藏干得分
  addHiddenScore(score, year,  WEIGHTS.yearBranch);
  addHiddenScore(score, month, WEIGHTS.monthBranch);
  addHiddenScore(score, day,   WEIGHTS.dayBranch);
  addHiddenScore(score, hour,  WEIGHTS.hourBranch);

  return score;
}

// 判断身强身弱
export function calcBodyStrength(
  fourPillars: FourPillars,
  score: WuxingScore
): 'strong' | 'weak' | 'neutral' {
  const dayWx = STEM_WUXING[fourPillars.day.stem];
  const dayScore = score[dayWx];
  const totalScore = Object.values(score).reduce((a, b) => a + b, 0);
  const avgScore = totalScore / 5;

  if (dayScore > avgScore * 1.3) return 'strong';
  if (dayScore < avgScore * 0.7) return 'weak';
  return 'neutral';
}

// 计算喜用忌神（简化版：身强取克泄，身弱取生扶）
export function calcXiyongshen(
  fourPillars: FourPillars,
  score: WuxingScore,
  strength: 'strong' | 'weak' | 'neutral'
): { xi: Wuxing[]; yong: Wuxing[]; ji: Wuxing[] } {
  const dayWx = STEM_WUXING[fourPillars.day.stem];

  const SHENG: Record<Wuxing, Wuxing> = {
    木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
  };
  const KE: Record<Wuxing, Wuxing> = {
    木: '土', 火: '金', 土: '水', 金: '木', 水: '火',
  };
  // 生我（印）
  const shengWo = (Object.keys(SHENG) as Wuxing[]).find(k => SHENG[k] === dayWx)!;
  // 我生（食伤）
  const woSheng = SHENG[dayWx];
  // 克我（官杀）
  const keWo = (Object.keys(KE) as Wuxing[]).find(k => KE[k] === dayWx)!;
  // 我克（财）
  const woKe = KE[dayWx];
  // 同我（比劫）
  const sameWx = dayWx;

  if (strength === 'strong') {
    // 身强：喜泄（食伤）和克（财星）；忌比劫、印
    return {
      yong: [woSheng, woKe],
      xi: [woSheng, woKe, keWo],
      ji: [sameWx, shengWo],
    };
  } else if (strength === 'weak') {
    // 身弱：喜生（印）和扶（比劫）；忌财、官杀
    return {
      yong: [shengWo, sameWx],
      xi: [shengWo, sameWx],
      ji: [woKe, keWo, woSheng],
    };
  } else {
    // 中和：以月令为准，简化处理
    return {
      yong: [dayWx],
      xi: [shengWo, sameWx],
      ji: [woKe],
    };
  }
}
