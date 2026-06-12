import type { HeavenlyStem, Wuxing, Shishen } from '../types/bazi';
import { STEM_WUXING, STEM_YINYANG } from './heavenlyStem';

// 五行相生：木生火，火生土，土生金，金生水，水生木
export const SHENG: Record<Wuxing, Wuxing> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

// 五行相克：木克土，火克金，土克水，金克木，水克火
export const KE: Record<Wuxing, Wuxing> = {
  木: '土', 火: '金', 土: '水', 金: '木', 水: '火',
};

// 五行色彩（UI用）
export const WUXING_COLOR: Record<Wuxing, string> = {
  木: '#2d8a4e',
  火: '#c0392b',
  土: '#a67c00',
  金: '#b8860b',
  水: '#1a3a5c',
};

export const WUXING_BG: Record<Wuxing, string> = {
  木: 'rgba(45,138,78,0.15)',
  火: 'rgba(192,57,43,0.15)',
  土: 'rgba(166,124,0,0.15)',
  金: 'rgba(184,134,11,0.15)',
  水: 'rgba(26,58,92,0.15)',
};

// 计算十神
export function calcShishen(dayStem: HeavenlyStem, targetStem: HeavenlyStem): Shishen {
  const dayWx = STEM_WUXING[dayStem];
  const tgtWx = STEM_WUXING[targetStem];
  const dayYY = STEM_YINYANG[dayStem];
  const tgtYY = STEM_YINYANG[targetStem];
  const sameYY = dayYY === tgtYY;

  if (dayWx === tgtWx)          return sameYY ? '比肩' : '劫财';
  if (SHENG[dayWx] === tgtWx)   return sameYY ? '食神' : '伤官';
  if (KE[dayWx]   === tgtWx)    return sameYY ? '偏财' : '正财';
  if (KE[tgtWx]   === dayWx)    return sameYY ? '七杀' : '正官';
  if (SHENG[tgtWx] === dayWx)   return sameYY ? '偏印' : '正印';

  // 不应该走到这里
  return '比肩';
}

// 十神对应颜色
export const SHISHEN_COLOR: Record<Shishen, string> = {
  '比肩': '#2d8a4e', '劫财': '#1a6b3c',
  '食神': '#c0392b', '伤官': '#922b21',
  '偏财': '#b8860b', '正财': '#8b6508',
  '七杀': '#1a3a5c', '正官': '#154360',
  '偏印': '#6c3483', '正印': '#512e5f',
};

// 十神五行属性分类（用于喜忌）
export const SHISHEN_CATEGORY: Record<Shishen, string> = {
  '比肩': '比劫', '劫财': '比劫',
  '食神': '食伤', '伤官': '食伤',
  '偏财': '财星', '正财': '财星',
  '七杀': '官杀', '正官': '官杀',
  '偏印': '印星', '正印': '印星',
};
