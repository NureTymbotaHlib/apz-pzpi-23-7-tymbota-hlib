import { getState, activeUser, setRole, setPrefs } from '../appState.js';
import { t } from '../i18n/translations.js';
import { roleLabel } from '../components/layout.js';

export function renderProfile() {
  const state = getState();
  const { prefs } = state;
  const lang = prefs.language;
  const user = activeUser();
  return `
    <div class="two-column">
      <section class="panel profile-card">
        <div class="avatar-large">${user.name.split(' ').map(part => part[0]).slice(0,2).join('')}</div>
        <h2>${user.name}</h2>
        <p>${user.email}</p>
        <span class="pill role-pill">${roleLabel(prefs.role, lang)}</span>
      </section>
      <section class="panel">
        <h3>${t('settings', lang)}</h3>
        <div class="settings-grid">
          <label>${t('role', lang)}
            <select id="profile-role">
              ${['Driver','Agent','Manager','Admin'].map(role => `<option value="${role}" ${prefs.role === role ? 'selected' : ''}>${roleLabel(role, lang)}</option>`).join('')}
            </select>
          </label>
          <label>${t('language', lang)}
            <select id="profile-language">
              <option value="uk" ${prefs.language === 'uk' ? 'selected' : ''}>Українська</option>
              <option value="en" ${prefs.language === 'en' ? 'selected' : ''}>English</option>
            </select>
          </label>
          <label>${t('region', lang)}
            <select id="profile-region">
              ${['uk-UA','en-US','de-DE','ar-EG'].map(region => `<option value="${region}" ${prefs.region === region ? 'selected' : ''}>${region}</option>`).join('')}
            </select>
          </label>
          <label>${t('direction', lang)}
            <select id="profile-direction">
              <option value="ltr" ${prefs.direction === 'ltr' ? 'selected' : ''}>LTR</option>
              <option value="rtl" ${prefs.direction === 'rtl' ? 'selected' : ''}>RTL</option>
            </select>
          </label>
        </div>
        <div class="role-explain">
          <h4>Role behavior</h4>
          <ul>
            <li><strong>Driver</strong> — створює заявки, переглядає власні поліси та телеметрію.</li>
            <li><strong>Agent</strong> — працює з клієнтами, полісами та передає заявки менеджеру.</li>
            <li><strong>Manager</strong> — бере заявки в роботу, схвалює або відхиляє виплати.</li>
            <li><strong>Admin</strong> — керує користувачами, даними, імпортом, експортом і резервними копіями.</li>
          </ul>
        </div>
      </section>
    </div>
  `;
}

export function bindProfile() {
  document.getElementById('profile-role')?.addEventListener('change', event => setRole(event.target.value));
  document.getElementById('profile-language')?.addEventListener('change', event => setPrefs({ language: event.target.value }));
  document.getElementById('profile-region')?.addEventListener('change', event => setPrefs({ region: event.target.value }));
  document.getElementById('profile-direction')?.addEventListener('change', event => setPrefs({ direction: event.target.value }));
}
