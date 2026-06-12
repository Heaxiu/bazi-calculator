// 天干
export type HeavenlyStem = '甲'|'乙'|'丙'|'丁'|'戊'|'己'|'庚'|'辛'|'壬'|'癸';

// 地支
export type EarthlyBranch = '子'|'丑'|'寅'|'卯'|'辰'|'巳'|'午'|'未'|'申'|'酉'|'戌'|'亥';

// 五行
export type Wuxing = '木'|'火'|'土'|'金'|'水';

// 十神
export type Shishen =
  '比肩'|'劫财'|'食神'|'伤官'|
  '偏财'|'正财'|'七杀'|'正官'|
  '偏印'|'正印';

// 阴阳
export type YinYang = '阴'|'阳';

// 长生十二状态
export type ChangSheng =
  '长生'|'沐浴'|'冠带'|'临官'|'帝旺'|
  '衰'|'病'|'死'|'墓'|'绝'|'胎'|'养';

export interface Ganzhi {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemWuxing: Wuxing;
  branchWuxing: Wuxing;
  stemYinyang: YinYang;
  branchYinyang: YinYang;
  hiddenStems: HeavenlyStem[];
  ganzhiIndex: number; // 0-59 六十甲子序号
}

export interface FourPillars {
  year: Ganzhi;
  month: Ganzhi;
  day: Ganzhi;
  hour: Ganzhi;
}

export interface TaiyuanMingGong {
  taiyuan: Ganzhi;
  minggong: Ganzhi;
  shengong: Ganzhi;
}

export interface WuxingScore {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export interface LiunianItem {
  year: number;
  ganzhi: Ganzhi;
  age: number;
  isCurrent: boolean;
  shishen?: Shishen;
}

export interface DayunItem {
  index: number;
  ganzhi: Ganzhi;
  startAge: number;
  startYear: number;
  endAge: number;
  liunian: LiunianItem[];
  isCurrent: boolean;
  shishenStem?: Shishen;
  shishenBranch?: Shishen;
}

export interface ShensheItem {
  name: string;
  isAuspicious: boolean;
}

export interface BaziResult {
  input: BaziInput;
  lunarInfo: LunarInfo;
  fourPillars: FourPillars;
  taiyuanMingGong: TaiyuanMingGong;
  wuxingScore: WuxingScore;
  xiyongshen: { xi: Wuxing[]; yong: Wuxing[]; ji: Wuxing[] };
  shishenMap: {
    yearStem: Shishen;
    yearBranch: Shishen;
    monthStem: Shishen;
    monthBranch: Shishen;
    hourStem: Shishen;
    hourBranch: Shishen;
  };
  shensheMap: {
    year: ShensheItem[];
    month: ShensheItem[];
    day: ShensheItem[];
    hour: ShensheItem[];
  };
  dayunList: DayunItem[];
  qiyunAge: number;
  qiyunYear: number;
  bodyStrength: 'strong' | 'weak' | 'neutral';
  nayin: { year: string; month: string; day: string; hour: string };
  changsheng: { year: ChangSheng; month: ChangSheng; day: ChangSheng; hour: ChangSheng };
}

export interface BaziInput {
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  isEarlyZiHour?: boolean; // 早子时（0:00-1:00）还是晚子时（23:00-23:59）
}

export interface LunarInfo {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  lunarYearStr: string;
  lunarMonthStr: string;
  lunarDayStr: string;
  shiChen: string; // 时辰名称
}
