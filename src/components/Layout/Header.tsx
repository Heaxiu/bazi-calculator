import React from 'react';
import './Header.css';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-ornament top" />
      <div className="header-content">
        <div className="header-side-char left">命</div>
        <div className="header-main">
          <div className="header-subtitle">子平命理 · 八字推算</div>
          <h1 className="header-title">
            <span className="title-char">八</span>
            <span className="title-char">字</span>
            <span className="title-divider">·</span>
            <span className="title-char">测</span>
            <span className="title-char">算</span>
          </h1>
          <div className="header-tagline">排四柱 · 定喜忌 · 观大运 · 明天时</div>
        </div>
        <div className="header-side-char right">运</div>
      </div>
      <div className="header-ornament bottom" />
    </header>
  );
}
