import type { HeavenlyStem, EarthlyBranch, ShensheItem } from '../types/bazi';
import { STEMS } from './heavenlyStem';
import { BRANCHES } from './earthlyBranch';

// 神煞数据（以年支为基准，常见神煞）
// 将星：申子辰→子，寅午戌→午，巳酉丑→酉，亥卯未→卯
export function getJiangXing(yearBranch: EarthlyBranch): EarthlyBranch {
  const jiangMap: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    申: '子', 子: '子', 辰: '子',
    寅: '午', 午: '午', 戌: '午',
    巳: '酉', 酉: '酉', 丑: '酉',
    亥: '卯', 卯: '卯', 未: '卯',
  };
  return jiangMap[yearBranch] ?? '子';
}

// 天乙贵人（以日干为基准）
export const TIANYI: Record<HeavenlyStem, EarthlyBranch[]> = {
  甲: ['丑','未'], 戊: ['丑','未'], 庚: ['丑','未'],
  乙: ['子','申'], 己: ['子','申'],
  丙: ['亥','酉'], 丁: ['亥','酉'],
  壬: ['卯','巳'],
  癸: ['卯','巳'],
  辛: ['午','寅'],
};

// 文昌贵人（以日干为基准）
export const WENCHANG: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '巳', 乙: '午', 丙: '申', 丁: '酉',
  戊: '申', 己: '酉', 庚: '亥', 辛: '子',
  壬: '寅', 癸: '卯',
};

// 驿马（以年支/日支三合局基准）
export function getYiMa(branch: EarthlyBranch): EarthlyBranch {
  const yimaMap: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    申: '寅', 子: '寅', 辰: '寅',
    寅: '申', 午: '申', 戌: '申',
    巳: '亥', 酉: '亥', 丑: '亥',
    亥: '巳', 卯: '巳', 未: '巳',
  };
  return yimaMap[branch] ?? '寅';
}

// 羊刃（以日干为基准）
export const YANGREN: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '卯', 乙: '寅', 丙: '午', 丁: '巳',
  戊: '午', 己: '巳', 庚: '酉', 辛: '申',
  壬: '子', 癸: '亥',
};

// 空亡（以日柱六十甲子序号计算）
export function getKongWang(ganzhiIndex: number): EarthlyBranch[] {
  const group = Math.floor(ganzhiIndex / 10);
  const kongMap: Record<number, EarthlyBranch[]> = {
    0: ['戌','亥'], 1: ['申','酉'], 2: ['午','未'],
    3: ['辰','巳'], 4: ['寅','卯'], 5: ['子','丑'],
  };
  return kongMap[group] ?? [];
}

// 桃花（以年支/日支三合局基准）
export function getTaoHua(branch: EarthlyBranch): EarthlyBranch {
  const taoMap: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    申: '酉', 子: '酉', 辰: '酉',
    寅: '卯', 午: '卯', 戌: '卯',
    巳: '午', 酉: '午', 丑: '午',
    亥: '子', 卯: '子', 未: '子',
  };
  return taoMap[branch] ?? '酉';
}

// 华盖（以年支/日支三合局基准）
export function getHuaGai(branch: EarthlyBranch): EarthlyBranch {
  const huaMap: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    申: '辰', 子: '辰', 辰: '辰',
    寅: '戌', 午: '戌', 戌: '戌',
    巳: '丑', 酉: '丑', 丑: '丑',
    亥: '未', 卯: '未', 未: '未',
  };
  return huaMap[branch] ?? '辰';
}

// 计算某柱的神煞
export function calcShenshe(
  pillarBranch: EarthlyBranch,
  pillarStem: HeavenlyStem,
  dayPillarStem: HeavenlyStem,
  dayPillarGanzhiIndex: number,
  yearBranch: EarthlyBranch,
  pillarType: 'year'|'month'|'day'|'hour'
): ShensheItem[] {
  const result: ShensheItem[] = [];

  // 天乙贵人
  const tianyiList = TIANYI[dayPillarStem] ?? [];
  if (tianyiList.includes(pillarBranch)) {
    result.push({ name: '天乙贵人', isAuspicious: true });
  }

  // 文昌贵人
  if (WENCHANG[dayPillarStem] === pillarBranch) {
    result.push({ name: '文昌贵人', isAuspicious: true });
  }

  // 将星
  if (getJiangXing(yearBranch) === pillarBranch) {
    result.push({ name: '将星', isAuspicious: true });
  }

  // 驿马
  if (getYiMa(yearBranch) === pillarBranch) {
    result.push({ name: '驿马', isAuspicious: true });
  }

  // 桃花
  if (getTaoHua(yearBranch) === pillarBranch) {
    result.push({ name: '桃花', isAuspicious: true });
  }

  // 华盖
  if (getHuaGai(yearBranch) === pillarBranch) {
    result.push({ name: '华盖', isAuspicious: false });
  }

  // 羊刃（仅用于日柱和时柱时参考日干）
  if (YANGREN[dayPillarStem] === pillarBranch && (pillarType === 'hour' || pillarType === 'day')) {
    result.push({ name: '羊刃', isAuspicious: false });
  }

  // 空亡（以日柱六十甲子为基准）
  const kongWang = getKongWang(dayPillarGanzhiIndex);
  if (kongWang.includes(pillarBranch)) {
    result.push({ name: '空亡', isAuspicious: false });
  }

  // 孤鸾煞（以日干支组合）
  const guluanDays = ['庚辰','戊戌','戊子','壬子','甲午','甲申'];
  const dayGanzhi = STEMS[dayPillarGanzhiIndex % 10] + BRANCHES[dayPillarGanzhiIndex % 12];
  if (pillarType === 'day' && guluanDays.includes(dayGanzhi)) {
    result.push({ name: '孤鸾煞', isAuspicious: false });
  }

  // 天德贵人（月柱）
  if (pillarType === 'month') {
    const tiandeMap: Partial<Record<EarthlyBranch, HeavenlyStem>> = {
      子: '壬' as HeavenlyStem, 丑: '庚' as HeavenlyStem, 寅: '丁' as HeavenlyStem,
      辰: '壬' as HeavenlyStem, 巳: '辛' as HeavenlyStem, 午: '甲' as HeavenlyStem, 未: '癸' as HeavenlyStem,
      酉: '丙' as HeavenlyStem, 戌: '乙' as HeavenlyStem, 亥: '己' as HeavenlyStem,
    };
    // 天德月德实际以月支为基准，这里简化用月干
    if (tiandeMap[pillarBranch] === pillarStem) {
      result.push({ name: '天德贵人', isAuspicious: true });
    }
  }

  return result;
}
