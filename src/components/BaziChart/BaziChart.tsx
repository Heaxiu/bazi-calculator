import React from 'react';
import type { BaziResult, Ganzhi, Shishen } from '../../types/bazi';
import { WUXING_COLOR } from '../../constants/wuxing';
import { SHISHEN_COLOR } from '../../constants/wuxing';
import './BaziChart.css';

interface BaziChartProps {
  result: BaziResult;
}

interface PillarProps {
  label: string;
  gz: Ganzhi;
  shishenStem?: Shishen;
  shishenBranch?: Shishen;
  changsheng?: string;
  nayin?: string;
  isDay?: boolean;
  shenshe?: { name: string; isAuspicious: boolean }[];
}

function PillarCard({ label, gz, shishenStem, shishenBranch, changsheng, nayin, isDay, shenshe }: PillarProps) {
  const stemColor = WUXING_COLOR[gz.stemWuxing];
  const branchColor = WUXING_COLOR[gz.branchWuxing];

  return (
    <div className={`pillar-card ${isDay ? 'pillar-day' : ''}`}>
      <div className="pillar-label">{label}</div>

      {/* 十神 */}
      <div className="pillar-shishen">
        {shishenStem && !isDay ? (
          <span className="shishen-tag" style={{ color: SHISHEN_COLOR[shishenStem] }}>
            {shishenStem}
          </span>
        ) : isDay ? (
          <span className="shishen-tag day-marker">日主</span>
        ) : null}
      </div>

      {/* 天干 */}
      <div className="pillar-stem" style={{ color: stemColor }}>
        {gz.stem}
        <span className="pillar-wx">({gz.stemWuxing})</span>
      </div>

      {/* 地支 */}
      <div className="pillar-branch" style={{ color: branchColor }}>
        {gz.branch}
        <span className="pillar-wx">({gz.branchWuxing})</span>
      </div>

      {/* 藏干 */}
      <div className="pillar-hidden">
        {gz.hiddenStems.map((s, i) => (
          <span key={i} className="hidden-stem" style={{ color: WUXING_COLOR[gz.stemWuxing] }}>
            {s}
          </span>
        ))}
      </div>

      {/* 长生状态 */}
      {changsheng && (
        <div className="pillar-changsheng">{changsheng}</div>
      )}

      {/* 纳音 */}
      {nayin && (
        <div className="pillar-nayin">{nayin}</div>
      )}

      {/* 神煞 */}
      {shenshe && shenshe.length > 0 && (
        <div className="pillar-shenshe">
          {shenshe.map((s, i) => (
            <span
              key={i}
              className={`shenshe-tag ${s.isAuspicious ? 'auspicious' : 'inauspicious'}`}
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoGanzhi({ label, gz }: { label: string; gz: Ganzhi }) {
  return (
    <div className="info-gz">
      <span className="info-gz-label">{label}</span>
      <span className="info-gz-val" style={{ color: WUXING_COLOR[gz.stemWuxing] }}>
        {gz.stem}
      </span>
      <span className="info-gz-val" style={{ color: WUXING_COLOR[gz.branchWuxing] }}>
        {gz.branch}
      </span>
    </div>
  );
}

export function BaziChart({ result }: BaziChartProps) {
  const { fourPillars: fp, taiyuanMingGong, lunarInfo, shishenMap, shensheMap, changsheng, nayin, qiyunAge, qiyunYear, input } = result;

  return (
    <div className="bazi-chart">
      {/* 命主信息 */}
      <div className="chart-info-bar">
        <span>
          {input.gender === 'male' ? '☰ 男命' : '☷ 女命'}
        </span>
        <span>
          {input.birthYear}年{input.birthMonth}月{input.birthDay}日 {input.birthHour}时
        </span>
        <span className="lunar-info">
          农历 {lunarInfo.lunarMonthStr}{lunarInfo.lunarDayStr} {lunarInfo.shiChen}
        </span>
      </div>

      {/* 四柱表格（从右至左：年→月→日→时） */}
      <div className="pillars-grid">
        {/* 时柱 */}
        <PillarCard
          label="时柱"
          gz={fp.hour}
          shishenStem={shishenMap.hourStem}
          shishenBranch={shishenMap.hourBranch}
          changsheng={changsheng.hour}
          nayin={nayin.hour}
          shenshe={shensheMap.hour}
        />
        {/* 日柱 */}
        <PillarCard
          label="日柱"
          gz={fp.day}
          changsheng={changsheng.day}
          nayin={nayin.day}
          isDay
          shenshe={shensheMap.day}
        />
        {/* 月柱 */}
        <PillarCard
          label="月柱"
          gz={fp.month}
          shishenStem={shishenMap.monthStem}
          shishenBranch={shishenMap.monthBranch}
          changsheng={changsheng.month}
          nayin={nayin.month}
          shenshe={shensheMap.month}
        />
        {/* 年柱 */}
        <PillarCard
          label="年柱"
          gz={fp.year}
          shishenStem={shishenMap.yearStem}
          shishenBranch={shishenMap.yearBranch}
          changsheng={changsheng.year}
          nayin={nayin.year}
          shenshe={shensheMap.year}
        />
      </div>

      {/* 附属信息 */}
      <div className="extra-info">
        <InfoGanzhi label="胎元" gz={taiyuanMingGong.taiyuan} />
        <InfoGanzhi label="命宫" gz={taiyuanMingGong.minggong} />
        <InfoGanzhi label="身宫" gz={taiyuanMingGong.shengong} />
        <div className="info-gz">
          <span className="info-gz-label">起运</span>
          <span className="info-gz-val" style={{ color: 'var(--color-primary)' }}>
            {qiyunAge.toFixed(1)}岁·{qiyunYear}年
          </span>
        </div>
      </div>
    </div>
  );
}
