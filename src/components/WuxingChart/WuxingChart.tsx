import React from 'react';
import type { BaziResult, Wuxing } from '../../types/bazi';
import { WUXING_COLOR, WUXING_BG } from '../../constants/wuxing';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip
} from 'recharts';
import './WuxingChart.css';

interface WuxingChartProps {
  result: BaziResult;
}

const WUXING_ORDER: Wuxing[] = ['木', '火', '土', '金', '水'];

export function WuxingChart({ result }: WuxingChartProps) {
  const { wuxingScore, xiyongshen, bodyStrength, fourPillars } = result;

  const radarData = WUXING_ORDER.map(wx => ({
    subject: wx,
    value: Math.round(wuxingScore[wx] * 10) / 10,
    fullMark: 35,
  }));

  const barData = WUXING_ORDER.map(wx => ({
    name: wx,
    value: Math.round(wuxingScore[wx] * 10) / 10,
  }));

  const strengthLabel = {
    strong: '身强',
    weak: '身弱',
    neutral: '中和',
  }[bodyStrength];

  const strengthColor = {
    strong: 'var(--color-huo)',
    weak: 'var(--color-shui)',
    neutral: 'var(--color-tu)',
  }[bodyStrength];

  const dayWx = result.fourPillars.day.stemWuxing;

  return (
    <div className="wuxing-chart">
      {/* 头部：身强弱 + 日主 */}
      <div className="wuxing-header">
        <div className="body-strength" style={{ color: strengthColor }}>
          <span className="strength-label">日主 · {fourPillars.day.stem}{fourPillars.day.branch}</span>
          <span className="strength-value">{strengthLabel}</span>
        </div>
        <div className="day-wuxing tag" style={{
          color: WUXING_COLOR[dayWx],
          background: WUXING_BG[dayWx],
          borderColor: WUXING_COLOR[dayWx],
        }}>
          {dayWx}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="charts-grid">
        {/* 雷达图 */}
        <div className="chart-panel">
          <div className="chart-panel-title">五行雷达</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(196,168,130,0.4)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--color-ink-lt)', fontSize: 14, fontFamily: 'KaiTi, 楷体, serif', fontWeight: 700 }}
              />
              <Radar
                dataKey="value"
                stroke="var(--color-primary)"
                fill="rgba(139,26,26,0.25)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 条形图 */}
        <div className="chart-panel">
          <div className="chart-panel-title">五行得分</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--color-ink-lt)', fontSize: 14, fontFamily: 'KaiTi, 楷体, serif', fontWeight: 700 }}
                width={28}
              />
              <Tooltip
                formatter={(v: unknown) => [(Number(v)).toFixed(1), '得分']}
                contentStyle={{
                  background: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={WUXING_COLOR[entry.name as Wuxing]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 喜用忌神 */}
      <div className="xiyong-section">
        <div className="xiyong-row">
          <span className="xiyong-title yong">用神</span>
          <div className="xiyong-tags">
            {xiyongshen.yong.map(wx => (
              <span key={wx} className="tag" style={{
                color: WUXING_COLOR[wx],
                background: WUXING_BG[wx],
                borderColor: WUXING_COLOR[wx],
              }}>{wx}</span>
            ))}
          </div>
        </div>
        <div className="xiyong-row">
          <span className="xiyong-title xi">喜神</span>
          <div className="xiyong-tags">
            {xiyongshen.xi.map((wx, i) => (
              <span key={`${wx}-${i}`} className="tag" style={{
                color: WUXING_COLOR[wx],
                background: WUXING_BG[wx],
                borderColor: WUXING_COLOR[wx],
              }}>{wx}</span>
            ))}
          </div>
        </div>
        <div className="xiyong-row">
          <span className="xiyong-title ji">忌神</span>
          <div className="xiyong-tags">
            {xiyongshen.ji.map((wx, i) => (
              <span key={`${wx}-${i}`} className="tag wx-ignore">{wx}</span>
            ))}
          </div>
        </div>
      </div>

      <p className="wuxing-note">
        * 喜用忌神为算法估算，仅供参考，详细分析请使用AI批命功能
      </p>
    </div>
  );
}
