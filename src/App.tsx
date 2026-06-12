import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { InputForm } from './components/InputForm/InputForm';
import { BaziChart } from './components/BaziChart/BaziChart';
import { WuxingChart } from './components/WuxingChart/WuxingChart';
import { DayunList } from './components/DayunList/DayunList';
import { Analysis } from './components/Analysis/Analysis';
import { useBazi } from './hooks/useBazi';
import type { BaziInput } from './types/bazi';
import './styles/theme.css';
import './styles/global.css';
import './styles/animations.css';
import './App.css';

export default function App() {
  const { result, error, calculate } = useBazi();
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'wuxing' | 'dayun' | 'ai'>('chart');

  const handleSubmit = async (input: BaziInput) => {
    setCalculating(true);
    try {
      calculate(input);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="app-container">
          {/* 输入表单 */}
          <section className="form-section">
            <InputForm onSubmit={handleSubmit} loading={calculating} />
          </section>

          {/* 错误提示 */}
          {error && (
            <div className="global-error">
              <strong>⚠ 计算错误：</strong>{error}
            </div>
          )}

          {/* 结果区域 */}
          {result && (
            <section className="result-section fade-in-up">
              {/* 命盘标题 */}
              <div className="result-header">
                <div className="result-title-row">
                  <span className="result-title">命盘推算结果</span>
                  <div className="bazi-summary">
                    <span className="bazi-word" style={{ color: '#4ade80' }}>
                      {result.fourPillars.year.stem}{result.fourPillars.year.branch}
                    </span>
                    <span className="bazi-word" style={{ color: '#4ade80' }}>
                      {result.fourPillars.month.stem}{result.fourPillars.month.branch}
                    </span>
                    <span className="bazi-word" style={{ color: '#4ade80', fontWeight: 900 }}>
                      {result.fourPillars.day.stem}{result.fourPillars.day.branch}
                    </span>
                    <span className="bazi-word" style={{ color: '#4ade80' }}>
                      {result.fourPillars.hour.stem}{result.fourPillars.hour.branch}
                    </span>
                  </div>
                </div>
              </div>

              {/* 标签页导航 */}
              <div className="tabs">
                {[
                  { key: 'chart', label: '四柱命盘' },
                  { key: 'wuxing', label: '五行分析' },
                  { key: 'dayun', label: '大运流年' },
                  { key: 'ai', label: '✦ AI批命' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 标签页内容 */}
              <div className="tab-content">
                {activeTab === 'chart' && (
                  <div className="ink-appear">
                    <BaziChart result={result} />
                  </div>
                )}
                {activeTab === 'wuxing' && (
                  <div className="ink-appear">
                    <WuxingChart result={result} />
                  </div>
                )}
                {activeTab === 'dayun' && (
                  <div className="ink-appear">
                    <div className="section-title" style={{ marginBottom: 16 }}>大运流年</div>
                    <DayunList result={result} />
                  </div>
                )}
                {activeTab === 'ai' && (
                  <div className="ink-appear">
                    <div className="section-title" style={{ marginBottom: 16 }}>AI 命理批注</div>
                    <Analysis result={result} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 未计算时的提示 */}
          {!result && !error && (
            <div className="welcome-hint">
              <div className="welcome-icon">☯</div>
              <p>请在上方填写出生信息，点击「推算命盘」开始测算</p>
              <p className="welcome-sub">支持公历1900年至2100年，精确到时辰</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
