import type { BaziResult } from '../types/bazi';

export const SYSTEM_PROMPT = `你是一位精通中国传统命理学的资深命理师，核心擅长子平派格局理论与新派命理技法，能基于固定命盘信息精准分析五行生克、十神组合等关系得出喜用忌神，并围绕事业、财运、婚恋、子女、六亲等维度展开深度解析。

【分析框架】
1. 首先判断日主强弱（旺衰），确定格局（正格/特别格局）
2. 分析五行生克制化，确定用神、喜神、忌神、仇神、闲神
3. 基于十神组合关系推断六亲、事业、财运、婚恋、子女、健康
4. 结合大运流年判断关键人生节点
5. 关键事件须给出发生时间范围、喜忌属性、事件对命主的影响程度

【严格输出格式】

## ⚠️ 前置声明
本分析为中国传统文化娱乐参考，不构成任何专业决策依据。命运掌握在自己手中，具体发展需结合个人努力与客观环境。

## 一、命盘技法解读

**日主：** [干支] [五行阴阳]
**月令：** [月支] 日主得[旺/相/休/囚/死]
**格局：** [格局名称] — [简析]
**身强/弱/中和** 判断及原因
**用神：** [具体天干/五行]　**喜神：** [具体]　**忌神：** [具体]
**五行分析：** 各五行旺衰情况及相互关系

## 二、命盘六大事项解读

### 📊 事业运势
职业倾向、工作层次、创业/打工适配性、合伙建议

### 💰 财运分析
财富级别、主要来源（正财/偏财）、聚财与耗财特征

### 💕 婚恋感情
感情性格、适配对象特征、早婚/晚婚倾向、潜在婚姻风险

### 👶 子女缘分
子女性别倾向、生育时间节点、子女数量与缘分深浅

### 👨‍👩‍👧 六亲关系
与父母/兄弟姐妹的关系亲疏、帮扶力度及潜在矛盾

### 🏥 健康养生
先天薄弱器官、易患疾病类型、需重点关注的体质问题

## 三、大运流年走势（前后各5年）

针对当前大运及前后流年，逐年分析：
| 年份 | 干支 | 喜忌 | 主要事项 | 影响程度 |
|------|------|------|---------|---------|
（表格格式，影响程度用⭐数量1-5表示）

重点分析：
- 事业：岗位调动、换工作、创业尝试、合伙风险期
- 财运：收入增长期、破财风险期
- 婚恋：恋爱萌芽期、结婚可能年份
- 健康：疾病易发期、外伤/手术风险

## 四、核心建议与风险规避

**发展方向：** 适合的城市属性、行业选择
**人际建议：** 适配的合伙人五行类型、需规避的类型
**颜色/方位：** 有利于命主的颜色和方位
**近期风险提示：** 需重点防范的年份和事项
**化解思路：** 具体的趋吉避凶建议

---
*分析结束后，如有具体疑问可随时补充提问。*

【注意事项】
- 语言风格：文雅通俗，避免过度晦涩
- 预测须给出时间范围，禁止模糊表述如"可能会""也许"
- 对负面信息用建设性方式表达，避免恐吓
- 若用户提问涉及破坏他人命运等违禁内容，直接拒绝`;

export function buildUserMessage(result: BaziResult): string {
  const { fourPillars: fp, input, wuxingScore, dayunList, lunarInfo, bodyStrength, xiyongshen, shishenMap, shensheMap, qiyunAge, qiyunYear, taiyuanMingGong, nayin, changsheng } = result;
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.birthYear;

  const genderStr = input.gender === 'male' ? '男命' : '女命';
  const strengthStr = bodyStrength === 'strong' ? '身强' : bodyStrength === 'weak' ? '身弱' : '中和';

  // 当前大运
  const currentDayun = dayunList.find(d => d.isCurrent);
  const currentLiunian = dayunList
    .flatMap(d => d.liunian)
    .find(l => l.isCurrent);

  // 前后5年流年
  const nearYears = dayunList
    .flatMap(d => d.liunian)
    .filter(l => Math.abs(l.year - currentYear) <= 5)
    .sort((a, b) => a.year - b.year);

  return `【命主信息】
性别：${genderStr}
出生公历：${input.birthYear}年${input.birthMonth}月${input.birthDay}日${input.birthHour}时${input.birthMinute}分
出生农历：${lunarInfo.lunarYearStr}${lunarInfo.lunarMonthStr}${lunarInfo.lunarDayStr}${lunarInfo.shiChen}
当前年龄：约${age}岁（${currentYear}年）

【四柱八字】
年柱：${fp.year.stem}${fp.year.branch}　纳音：${nayin.year}　十神：${shishenMap.yearStem}
月柱：${fp.month.stem}${fp.month.branch}　纳音：${nayin.month}　十神：${shishenMap.monthStem}
日柱：${fp.day.stem}${fp.day.branch}　纳音：${nayin.day}　（日主）
时柱：${fp.hour.stem}${fp.hour.branch}　纳音：${nayin.hour}　十神：${shishenMap.hourStem}

【附属信息】
胎元：${taiyuanMingGong.taiyuan.stem}${taiyuanMingGong.taiyuan.branch}
命宫：${taiyuanMingGong.minggong.stem}${taiyuanMingGong.minggong.branch}
身宫：${taiyuanMingGong.shengong.stem}${taiyuanMingGong.shengong.branch}

【长生十二宫（日主视角）】
年：${changsheng.year}　月：${changsheng.month}　日：${changsheng.day}　时：${changsheng.hour}

【五行得分】
木：${wuxingScore.木.toFixed(1)}　火：${wuxingScore.火.toFixed(1)}　土：${wuxingScore.土.toFixed(1)}　金：${wuxingScore.金.toFixed(1)}　水：${wuxingScore.水.toFixed(1)}
日主${strengthStr}

【喜用忌神参考】
用神：${xiyongshen.yong.join('、')}
喜神：${xiyongshen.xi.join('、')}
忌神：${xiyongshen.ji.join('、')}

【各柱神煞】
年柱神煞：${shensheMap.year.map(s => s.name).join('、') || '无'}
月柱神煞：${shensheMap.month.map(s => s.name).join('、') || '无'}
日柱神煞：${shensheMap.day.map(s => s.name).join('、') || '无'}
时柱神煞：${shensheMap.hour.map(s => s.name).join('、') || '无'}

【起运信息】
${qiyunAge.toFixed(1)}岁起运（${qiyunYear}年）

【大运排列】
${dayunList.slice(0, 8).map(d =>
  `${d.startAge}-${d.endAge}岁（${d.startYear}-${d.startYear + 9}年）：${d.ganzhi.stem}${d.ganzhi.branch}（${d.shishenStem}）${d.isCurrent ? '【当前大运】' : ''}`
).join('\n')}

【当前大运】${currentDayun ? `${currentDayun.ganzhi.stem}${currentDayun.ganzhi.branch}（${currentDayun.startYear}-${currentDayun.startYear + 9}年）` : '待定'}
【当前流年】${currentYear}年 ${currentLiunian ? `${currentLiunian.ganzhi.stem}${currentLiunian.ganzhi.branch}` : ''}

【前后5年流年】
${nearYears.map(l =>
  `${l.year}年 ${l.ganzhi.stem}${l.ganzhi.branch}（${l.shishen}）${l.isCurrent ? '← 当前' : ''}`
).join('\n')}

请按系统要求格式进行深度分析，各部分内容需详实充分。`;
}
