import { statusClass } from '../utils/formatters.js';

export function metric(label, value, helper = '', icon = '●') {
  return `
    <article class="metric-card">
      <div class="metric-icon">${icon}</div>
      <div>
        <div class="metric-value">${value}</div>
        <div class="metric-label">${label}</div>
        ${helper ? `<div class="metric-helper">${helper}</div>` : ''}
      </div>
    </article>
  `;
}

export function badge(status, label = status) {
  return `<span class="badge ${statusClass(status)}">${label}</span>`;
}

export function emptyState(title, text) {
  return `
    <div class="empty-state">
      <div class="empty-icon">◇</div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

export function progress(label, value, max = 100) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return `
    <div class="progress-row">
      <div class="progress-head"><span>${label}</span><strong>${pct}%</strong></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
    </div>
  `;
}
