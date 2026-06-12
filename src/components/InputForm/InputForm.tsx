import React, { useState } from 'react';
import type { BaziInput } from '../../types/bazi';
import { SHICHEN_NAMES } from '../../constants/earthlyBranch';
import './InputForm.css';

interface InputFormProps {
  onSubmit: (input: BaziInput) => void;
  loading?: boolean;
}

export function InputForm({ onSubmit, loading }: InputFormProps) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isEarlyZi, setIsEarlyZi] = useState(false);

  const shiChen = SHICHEN_NAMES[hour] ?? '子时';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      gender,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      birthMinute: minute,
      isEarlyZiHour: isEarlyZi,
    });
  };

  const maxDay = new Date(year, month, 0).getDate();

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2 className="section-title">推算命盘</h2>
        <p className="form-tip">请输入出生信息，以节气为月柱换月标准</p>
      </div>

      {/* 性别选择 */}
      <div className="form-group">
        <label className="form-label">性别</label>
        <div className="gender-select">
          <button
            type="button"
            className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
            onClick={() => setGender('male')}
          >
            <span className="trigram">☰</span>
            <span>乾 · 男</span>
          </button>
          <button
            type="button"
            className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
            onClick={() => setGender('female')}
          >
            <span className="trigram">☷</span>
            <span>坤 · 女</span>
          </button>
        </div>
      </div>

      {/* 出生年月日 */}
      <div className="form-group">
        <label className="form-label">出生年月日</label>
        <div className="date-inputs">
          <div className="date-field">
            <input
              type="number"
              className="form-input"
              value={year}
              min={1900} max={2100}
              onChange={e => setYear(Number(e.target.value))}
              required
            />
            <span className="date-unit">年</span>
          </div>
          <div className="date-field">
            <input
              type="number"
              className="form-input"
              value={month}
              min={1} max={12}
              onChange={e => setMonth(Number(e.target.value))}
              required
            />
            <span className="date-unit">月</span>
          </div>
          <div className="date-field">
            <input
              type="number"
              className="form-input"
              value={day}
              min={1} max={maxDay}
              onChange={e => setDay(Number(e.target.value))}
              required
            />
            <span className="date-unit">日</span>
          </div>
        </div>
      </div>

      {/* 出生时辰 */}
      <div className="form-group">
        <label className="form-label">
          出生时辰
          <span className="shichen-badge">{shiChen}</span>
        </label>
        <div className="time-inputs">
          <div className="date-field">
            <input
              type="number"
              className="form-input"
              value={hour}
              min={0} max={23}
              onChange={e => setHour(Number(e.target.value))}
              required
            />
            <span className="date-unit">时</span>
          </div>
          <div className="date-field">
            <input
              type="number"
              className="form-input"
              value={minute}
              min={0} max={59}
              onChange={e => setMinute(Number(e.target.value))}
            />
            <span className="date-unit">分</span>
          </div>
        </div>
        {(hour === 0 || hour === 23) && (
          <div className="zi-hour-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isEarlyZi}
                onChange={e => setIsEarlyZi(e.target.checked)}
              />
              <span>早子时（0:00起）— 不换日柱</span>
            </label>
            <span className="toggle-tip">
              {isEarlyZi ? '✓ 0:00~0:59 算当日子时' : '默认23:00后算次日子时'}
            </span>
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        className="submit-btn btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading-spin" />
            推算中...
          </>
        ) : (
          <>✦ 推算命盘</>
        )}
      </button>
    </form>
  );
}
