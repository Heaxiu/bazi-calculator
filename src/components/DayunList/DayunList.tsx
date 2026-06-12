import React, { useState } from 'react';
import type { BaziResult, DayunItem } from '../../types/bazi';
import { WUXING_COLOR, SHISHEN_COLOR } from '../../constants/wuxing';
import './DayunList.css';

interface DayunListProps {
  result: BaziResult;
}

function LiunianRow({ liunian }: { liunian: DayunItem['liunian'] }) {
  return (
    <div className="liunian-grid">
      {liunian.map(l => (
        <div key={l.year} className={`liunian-item ${l.isCurrent ? 'current-year' : ''}`}>
          <span className="ly-year">{l.year}</span>
          <span className="ly-gz" style={{ color: WUXING_COLOR[l.ganzhi.stemWuxing] }}>
            {l.ganzhi.stem}{l.ganzhi.branch}
          </span>
          {l.shishen && (
            <span className="ly-shishen" style={{ color: SHISHEN_COLOR[l.shishen] }}>
              {l.shishen}
            </span>
          )}
          <span className="ly-age">{l.age}岁</span>
          {l.isCurrent && <span className="current-badge">今</span>}
        </div>
      ))}
    </div>
  );
}

function DayunCard({ item }: { item: DayunItem }) {
  const [expanded, setExpanded] = useState(item.isCurrent);

  return (
    <div className={`dayun-card ${item.isCurrent ? 'current-dayun' : ''}`}>
      <div className="dayun-header" onClick={() => setExpanded(!expanded)}>
        {item.isCurrent && <span className="current-dayun-badge">当前</span>}
        <div className="dayun-gz">
          <span className="gz-stem" style={{ color: WUXING_COLOR[item.ganzhi.stemWuxing] }}>
            {item.ganzhi.stem}
          </span>
          <span className="gz-branch" style={{ color: WUXING_COLOR[item.ganzhi.branchWuxing] }}>
            {item.ganzhi.branch}
          </span>
        </div>
        <div className="dayun-meta">
          {item.shishenStem && (
            <span className="dayun-shishen" style={{ color: SHISHEN_COLOR[item.shishenStem] }}>
              {item.shishenStem}
            </span>
          )}
          <span className="dayun-age">{item.startAge}—{item.endAge}岁</span>
          <span className="dayun-years">{item.startYear}—{item.startYear + 9}</span>
        </div>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▾</span>
      </div>

      {expanded && (
        <div className="dayun-liunian">
          <LiunianRow liunian={item.liunian} />
        </div>
      )}
    </div>
  );
}

export function DayunList({ result }: DayunListProps) {
  const { dayunList, qiyunAge, qiyunYear } = result;

  return (
    <div className="dayun-list">
      <div className="qiyun-info">
        <span>起运：</span>
        <span className="qiyun-age">{qiyunAge.toFixed(1)} 岁</span>
        <span className="qiyun-year">（{qiyunYear} 年）</span>
        <span className="qiyun-tip">· 点击大运可展开流年</span>
      </div>

      <div className="dayun-cards">
        {dayunList.map(item => (
          <DayunCard key={item.index} item={item} />
        ))}
      </div>
    </div>
  );
}
