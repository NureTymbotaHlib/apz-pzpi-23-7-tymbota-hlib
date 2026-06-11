import { getState, setPrefs, setRole, setRoute, activeUser } from '../appState.js';
import { t } from '../i18n/translations.js';
import { apiClient } from '../api/apiClient.js';

const navItems = [
  { route: 'home', label: 'home', icon: '⌂', roles: ['Driver', 'Agent', 'Manager', 'Admin'] },
  { route: 'policies', label: 'policies', icon: '▣', roles: ['Driver', 'Agent', 'Manager', 'Admin'] },
  { route: 'claims', label: 'claims', icon: '◇', roles: ['Driver', 'Agent', 'Manager', 'Admin'] },
  { route: 'telemetry', label: 'telemetry', icon: '◌', roles: ['Driver', 'Manager', 'Admin'] },
  { route: 'admin', label: 'admin', icon: '⚙', roles: ['Admin'] },
  { route: 'profile', label: 'profile', icon: '◉', roles: ['Driver', 'Agent', 'Manager', 'Admin'] }
];

export function shell(content) {
  const state = getState();
  const lang = state.prefs.language;
  const user = activeUser();
  const availableNav = navItems.filter(item => item.roles.includes(state.prefs.role));
  const serverClass = state.server.status === 'online' ? 'online' : state.server.status === 'offline' ? 'offline' : 'unknown';

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">AI</div>
          <div>
            <div class="brand-title">${t('appTitle', lang)}</div>
            <div class="brand-subtitle">${t('appSubtitle', lang)}</div>
          </div>
        </div>
        <nav class="nav-list">
          ${availableNav.map(item => `
            <button class="nav-item ${state.prefs.route === item.route ? 'active' : ''}" data-route="${item.route}">
              <span>${item.icon}</span><span>${t(item.label, lang)}</span>
            </button>
          `).join('')}
        </nav>
        <div class="side-card">
          <div class="muted">${t('profile', lang)}</div>
          <strong>${user?.name || '-'}</strong>
          <div class="pill role-pill">${roleLabel(state.prefs.role, lang)}</div>
        </div>
        <div class="side-card server-card ${serverClass}">
          <span class="status-dot"></span>
          <span>${state.server.status === 'online' ? t('serverOnline', lang) : state.server.status === 'offline' ? t('serverOffline', lang) : 'API status'}</span>
        </div>
      </aside>
      <main class="main-panel">
        <header class="topbar">
          <div>
            <h1>${pageTitle(state.prefs.route, lang)}</h1>
            <p>${pageLead(state.prefs.route, lang, state.prefs.role)}</p>
          </div>
          <div class="toolbar">
            <select id="role-select" aria-label="role">
              ${['Driver','Agent','Manager','Admin'].map(role => `<option value="${role}" ${state.prefs.role === role ? 'selected' : ''}>${roleLabel(role, lang)}</option>`).join('')}
            </select>
            <select id="language-select" aria-label="language">
              <option value="uk" ${lang === 'uk' ? 'selected' : ''}>UA</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>EN</option>
            </select>
            <select id="region-select" aria-label="region">
              ${['uk-UA','en-US','de-DE','ar-EG'].map(region => `<option value="${region}" ${state.prefs.region === region ? 'selected' : ''}>${region}</option>`).join('')}
            </select>
            <button class="icon-button" id="dir-toggle" title="${t('direction', lang)}">${state.prefs.direction.toUpperCase()}</button>
          </div>
        </header>
        <section class="content-area">${content}</section>
      </main>
      ${state.toast ? `<div class="toast ${state.toast.type}">${state.toast.message}</div>` : ''}
    </div>
  `;
}

function pageTitle(route, lang) {
  return t(route, lang) || t('home', lang);
}

function pageLead(route, lang, role) {
  const text = {
    uk: {
      home: `Робоча панель для ролі ${roleLabel(role, lang)}.`,
      policies: 'Перегляд полісів, клієнтів та повʼязаних автомобілів.',
      claims: 'Робота із заявками залежить від обраної ролі.',
      telemetry: 'Події OBD/GPS, фіксація ударів і критичності.',
      admin: 'Користувачі, дані, резервні копії, імпорт та експорт.',
      profile: 'Персональні налаштування, локалізація та рольова демонстрація.'
    },
    en: {
      home: `Workspace for ${roleLabel(role, lang)} role.`,
      policies: 'Policies, clients and linked vehicles.',
      claims: 'Claim workflow depends on the selected role.',
      telemetry: 'OBD/GPS events, impact and severity tracking.',
      admin: 'Users, data, backups, import and export.',
      profile: 'Personal settings, localization and role demo.'
    }
  };
  return text[lang]?.[route] || text[lang].home;
}

export function roleLabel(role, lang = 'uk') {
  const map = {
    Driver: t('roleDriver', lang),
    Agent: t('roleAgent', lang),
    Manager: t('roleManager', lang),
    Admin: t('roleAdmin', lang)
  };
  return map[role] || role;
}

export function bindLayoutEvents() {
  document.querySelectorAll('[data-route]').forEach(button => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });
  document.getElementById('role-select')?.addEventListener('change', event => setRole(event.target.value));
  document.getElementById('language-select')?.addEventListener('change', event => setPrefs({ language: event.target.value }));
  document.getElementById('region-select')?.addEventListener('change', event => setPrefs({ region: event.target.value }));
  document.getElementById('dir-toggle')?.addEventListener('click', () => {
    const next = getState().prefs.direction === 'ltr' ? 'rtl' : 'ltr';
    setPrefs({ direction: next });
  });
}

export async function refreshHealth() {
  const result = await apiClient.health();

  if (result.ok) {
    return {
      status: 'online',
      message: result.data?.status || 'server available'
    };
  }

  return {
    status: 'offline',
    message: result.data?.message || 'server unavailable'
  };
}
