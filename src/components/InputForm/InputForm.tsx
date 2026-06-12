import React, { useState, useEffect } from 'react';
import type { BaziInput } from '../../types/bazi';
import { SHICHEN_NAMES } from '../../constants/earthlyBranch';
import { Solar, Lunar } from 'lunar-typescript';
import './InputForm.css';

interface InputFormProps {
  onSubmit: (input: BaziInput) => void;
  loading?: boolean;
}

export function InputForm({ onSubmit, loading }: InputFormProps) {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isEarlyZi, setIsEarlyZi] = useState(false);

  const shiChen = SHICHEN_NAMES[hour] ?? '子时';

  // 农历转公历预览
  const [solarPreview, setSolarPreview] = useState<string>('');

  useEffect(() => {
    if (calendarType === 'lunar') {
      try {
        // 农历转公历：先创建农历对象，再获取对应的公历
        const lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
        const solar = lunar.getSolar();
        setSolarPreview(`公历：${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`);
      } catch (error) {
        console.error('农历转换错误:', error);
        setSolarPreview('');
      }
    } else {
      setSolarPreview('');
    }
  }, [calendarType, year, month, day, hour, minute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalYear = year;
    let finalMonth = month;
    let finalDay = day;

    // 如果是农历，转换为公历
    if (calendarType === 'lunar') {
      try {
        // 农历转公历
        const lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
        const solar = lunar.getSolar();
        finalYear = solar.getYear();
        finalMonth = solar.getMonth();
        finalDay = solar.getDay();
      } catch (error) {
        console.error('农历转换失败:', error);
        alert('农历日期转换失败，请检查输入的日期是否有效');
        return;
      }
    }

    onSubmit({
      gender,
      birthYear: finalYear,
      birthMonth: finalMonth,
      birthDay: finalDay,
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

      {/* 历法选择 */}
      <div className="form-group">
        <label className="form-label">历法类型</label>
        <div className="calendar-select">
          <button
            type="button"
            className={`calendar-btn ${calendarType === 'solar' ? 'active' : ''}`}
            onClick={() => setCalendarType('solar')}
          >
            ☀️ 公历（阳历）
          </button>
          <button
            type="button"
            className={`calendar-btn ${calendarType === 'lunar' ? 'active' : ''}`}
            onClick={() => setCalendarType('lunar')}
          >
            🌙 农历（阴历）
          </button>
        </div>
      </div>

      {/* 出生年月日 */}
      <div className="form-group">
        <label className="form-label">
          {calendarType === 'solar' ? '公历出生日期' : '农历出生日期'}
        </label>
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
        {solarPreview && calendarType === 'lunar' && (
          <div className="lunar-preview">{solarPreview}</div>
        )}
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
