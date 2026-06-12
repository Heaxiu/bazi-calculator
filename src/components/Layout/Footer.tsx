import React from 'react';

export function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '24px 16px',
      borderTop: '1px solid var(--color-border-lt)',
      color: 'var(--color-ink-dim)',
      fontSize: '0.78rem',
      lineHeight: 2,
      background: 'var(--color-paper-dk)',
    }}>
      <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>
        ⚠️ 免责声明
      </p>
      <p>本应用基于中国传统八字命理理论，仅供文化娱乐参考，不构成任何决策依据。</p>
      <p>命运掌握在自己手中，具体发展需结合个人努力与客观实际。</p>
      <p style={{ marginTop: 8, color: 'var(--color-border)', fontSize: '0.72rem' }}>
        八字测算 · 子平命理 · 传统文化
      </p>
    </footer>
  );
}
