import React, { useState } from 'react';
import type { BaziResult } from '../../types/bazi';
import type { AIConfig } from '../../types/api';
import { useAI } from '../../hooks/useAI';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './Analysis.css';

// 配置 marked
marked.setOptions({ breaks: true });

interface AnalysisProps {
  result: BaziResult;
}

const DEFAULT_CONFIG: AIConfig = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
};

const MODEL_OPTIONS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'deepseek-chat',
  'deepseek-reasoner',
];

export function Analysis({ result }: AnalysisProps) {
  const [config, setConfig] = useLocalStorage<AIConfig>('bazi-ai-config', DEFAULT_CONFIG);
  const [configOpen, setConfigOpen] = useState(false);
  const { result: aiResult, loading, error, analyze, stop, clear } = useAI();

  const handleAnalyze = async () => {
    await analyze(result, config);
  };

  const htmlContent = aiResult
    ? DOMPurify.sanitize(marked.parse(aiResult) as string)
    : '';

  const model = config.model || 'gpt-4o';

  return (
    <div className="analysis">
      {/* API 配置区 */}
      <div className="config-section">
        <button
          className="config-toggle"
          onClick={() => setConfigOpen(!configOpen)}
          type="button"
        >
          <span>⚙ API 配置</span>
          <span className="config-model-hint">{model}</span>
          <span className={`config-arrow ${configOpen ? 'open' : ''}`}>▾</span>
        </button>

        {configOpen && (
          <div className="config-panel">
            <div className="config-field">
              <label className="config-label">API Endpoint</label>
              <input
                className="config-input"
                type="url"
                value={config.endpoint}
                onChange={e => setConfig({ ...config, endpoint: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="config-field">
              <label className="config-label">API Key</label>
              <input
                className="config-input"
                type="password"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                autoComplete="off"
              />
              <span className="config-hint">Key 仅存储于本地浏览器，不上传服务器</span>
            </div>
            <div className="config-field">
              <label className="config-label">模型</label>
              <select
                className="config-input"
                value={MODEL_OPTIONS.includes(config.model) ? config.model : 'custom'}
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setConfig({ ...config, model: e.target.value });
                  }
                }}
              >
                {MODEL_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="custom">自定义...</option>
              </select>
              {!MODEL_OPTIONS.includes(config.model) && (
                <input
                  className="config-input"
                  type="text"
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                  placeholder="输入模型名称"
                  style={{ marginTop: 4 }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 触发按钮 */}
      <div className="analyze-actions">
        {!loading ? (
          <button
            className="analyze-btn btn btn-primary"
            onClick={handleAnalyze}
            type="button"
            disabled={!config.apiKey}
          >
            <span className="analyze-btn-icon">☯</span>
            请先生 批命
          </button>
        ) : (
          <button className="stop-btn btn btn-outline" onClick={stop} type="button">
            <span className="loading-spin" />
            停止生成
          </button>
        )}
        {aiResult && !loading && (
          <button className="clear-btn btn btn-outline" onClick={clear} type="button">
            清空结果
          </button>
        )}
      </div>

      {!config.apiKey && (
        <p className="no-key-tip">请先在上方配置 API Key 后方可使用 AI 批命功能</p>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="loading-indicator">
          <div className="ink-loading">
            <span /><span /><span />
          </div>
          <span>先生正在推演命盘...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="error-box">
          <strong>⚠ 请求失败：</strong>{error}
        </div>
      )}

      {/* AI 结果 */}
      {htmlContent && (
        <div
          className="ai-result scroll-unroll"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
}
