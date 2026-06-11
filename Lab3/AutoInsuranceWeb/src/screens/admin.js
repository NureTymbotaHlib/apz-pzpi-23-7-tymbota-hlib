import { getState, updateData, resetAllData, toast } from '../appState.js';
import { t } from '../i18n/translations.js';
import { badge } from '../components/cards.js';
import { formatDate, formatMoney } from '../utils/formatters.js';
import { createBackup, exportAllData, importAllData, restoreBackup } from '../utils/exportImport.js';

export function renderAdmin() {
  const state = getState();
  const { data, prefs } = state;
  const lang = prefs.language;
  if (prefs.role !== 'Admin') {
    return `<section class="panel access-panel"><h3>${t('admin', lang)}</h3><p>${t('noAccess', lang)}</p></section>`;
  }
  return `
    <div class="admin-grid">
      <section class="panel admin-users">
        <div class="section-head"><h3>${t('users', lang)}</h3><span class="pill">RBAC</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>${t('fullName', lang)}</th><th>Email</th><th>${t('role', lang)}</th><th>${t('status', lang)}</th><th></th></tr></thead>
            <tbody>${data.users.map(user => userRow(user)).join('')}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <div class="section-head"><h3>${t('dataManagement', lang)}</h3></div>
        <div class="settings-grid">
          <label>impactSpeedThreshold<input id="setting-impact" type="number" value="${data.settings.impactSpeedThreshold}" /></label>
          <label>cascoCoeff<input id="setting-casco" type="number" step="0.1" value="${data.settings.cascoCoeff}" /></label>
          <label>oscpvCoeff<input id="setting-oscpv" type="number" step="0.1" value="${data.settings.oscpvCoeff}" /></label>
          <label>dataRetentionMonths<input id="setting-retention" type="number" value="${data.settings.dataRetentionMonths}" /></label>
          <button id="save-settings">${t('save', lang)}</button>
          <button class="danger" id="reset-demo">${t('resetDemo', lang)}</button>
        </div>
        <div class="stats-strip">
          <div><strong>${data.clients.length}</strong><span>clients</span></div>
          <div><strong>${data.policies.length}</strong><span>policies</span></div>
          <div><strong>${data.claims.length}</strong><span>claims</span></div>
          <div><strong>${formatMoney(data.policies.reduce((s,p)=>s+p.finalPremium,0), prefs.region)}</strong><span>premium</span></div>
        </div>
      </section>
      <section class="panel">
        <div class="section-head"><h3>${t('backupManagement', lang)}</h3></div>
        <div class="actions-row">
          <button id="create-backup">${t('createBackup', lang)}</button>
          <button class="secondary" id="export-data">${t('exportData', lang)}</button>
          <label class="file-button">${t('importData', lang)}<input id="import-data" type="file" accept="application/json" hidden /></label>
        </div>
        <p class="muted">${t('importHint', lang)}</p>
        <div class="backup-list">
          ${data.backups.length ? data.backups.map(backup => `<div class="backup-row"><div><strong>${backup.name}</strong><span>${formatDate(backup.createdAt, prefs.region)}</span></div><button data-restore="${backup.id}" class="secondary">${t('restore', lang)}</button></div>`).join('') : '<p class="muted">No backups yet.</p>'}
        </div>
      </section>
      <section class="panel">
        <h3>Audit preview</h3>
        <div class="timeline compact-timeline">
          ${data.users.slice(0,4).map(user => `<div class="timeline-item"><span></span><strong>${user.name}</strong><p>${user.role} / ${user.active ? 'active' : 'blocked'}</p></div>`).join('')}
        </div>
      </section>
    </div>
  `;
}

export function bindAdmin() {
  document.querySelectorAll('[data-user-role]').forEach(select => select.addEventListener('change', event => {
    const id = Number(event.target.dataset.userRole);
    updateData(data => {
      const user = data.users.find(item => item.id === id);
      if (user) user.role = event.target.value;
    });
    toast('Роль користувача змінено', 'success');
  }));
  document.querySelectorAll('[data-toggle-user]').forEach(button => button.addEventListener('click', () => {
    const id = Number(button.dataset.toggleUser);
    updateData(data => {
      const user = data.users.find(item => item.id === id);
      if (user) user.active = !user.active;
    });
    toast('Статус користувача змінено', 'success');
  }));
  document.getElementById('save-settings')?.addEventListener('click', () => {
    updateData(data => {
      data.settings.impactSpeedThreshold = Number(document.getElementById('setting-impact').value);
      data.settings.cascoCoeff = Number(document.getElementById('setting-casco').value);
      data.settings.oscpvCoeff = Number(document.getElementById('setting-oscpv').value);
      data.settings.dataRetentionMonths = Number(document.getElementById('setting-retention').value);
    });
    toast('Налаштування збережено', 'success');
  });
  document.getElementById('reset-demo')?.addEventListener('click', () => {
    resetAllData();
    toast('Демо-дані відновлено', 'success');
  });
  document.getElementById('create-backup')?.addEventListener('click', createBackup);
  document.getElementById('export-data')?.addEventListener('click', exportAllData);
  document.getElementById('import-data')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) importAllData(file);
  });
  document.querySelectorAll('[data-restore]').forEach(button => button.addEventListener('click', () => restoreBackup(button.dataset.restore)));
}

function userRow(user) {
  return `
    <tr>
      <td>#${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><select data-user-role="${user.id}">${['Driver','Agent','Manager','Admin'].map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></td>
      <td>${badge(user.active ? 'Active' : 'Cancelled', user.active ? 'active' : 'blocked')}</td>
      <td><button class="secondary" data-toggle-user="${user.id}">${user.active ? 'Block' : 'Unblock'}</button></td>
    </tr>
  `;
}
