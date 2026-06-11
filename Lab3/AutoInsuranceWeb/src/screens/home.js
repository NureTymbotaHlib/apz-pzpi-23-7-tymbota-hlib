import { getState, setServerStatus, setRoute, updateData, toast } from '../appState.js';
import { t } from '../i18n/translations.js';
import { metric, progress, badge } from '../components/cards.js';
import { formatMoney } from '../utils/formatters.js';
import { refreshHealth } from '../components/layout.js';
import { apiClient } from '../api/apiClient.js';

export function renderHome() {
  const state = getState();
  const { data, prefs } = state;
  const lang = prefs.language;
  const activePolicies = data.policies.filter(policy => policy.status === 'Active').length;
  const openClaims = data.claims.filter(claim => ['Created', 'InReview'].includes(claim.status)).length;
  const criticalEvents = data.telemetry.filter(event => event.severity === 'critical').length;
  const totalPremium = data.policies.reduce((sum, policy) => sum + Number(policy.finalPremium || 0), 0);

  return `
    <div class="dashboard-grid">
      ${metric(t('activePolicies', lang), activePolicies, formatMoney(totalPremium, prefs.region), '▣')}
      ${metric(t('openClaims', lang), openClaims, 'Created / InReview', '◇')}
      ${metric(t('criticalEvents', lang), criticalEvents, 'impact + speed threshold', '◌')}
      ${metric(t('users', lang), data.users.length, `${data.users.filter(user => user.active).length} active`, '◉')}
    </div>

    <div class="two-column">
      <section class="panel hero-panel">
        <div class="hero-copy">
          <span class="eyebrow">Web client</span>
          <h2>${roleHeadline(prefs.role, lang)}</h2>
          <p>${roleDescription(prefs.role, lang)}</p>
          <div class="actions-row">
            ${quickActions(prefs.role, lang)}
          </div>
        </div>
        <div class="hero-card">
          <div class="mini-car">▰</div>
          <div class="muted">Policy POL-000001</div>
          <strong>${badge('Active', 'Active')} ${formatMoney(5200, prefs.region)}</strong>
          ${progress('Safe drive score', 86, 100)}
          ${progress('Claim processing', claimProgress(data.claims[0]), 100)}
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <h3>API / Render</h3>
          <button class="secondary" id="check-server">${t('refresh', lang)}</button>
        </div>
        <div class="server-box ${state.server.status}">
          <div class="server-line"><span class="status-dot"></span><strong>${apiClient.baseUrl}</strong></div>
          <p>${state.server.status === 'online' ? t('serverOnline', lang) : t('serverOffline', lang)}</p>
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="section-head">
        <h3>${lang === 'uk' ? 'Останні події' : 'Recent events'}</h3>
      </div>
      <div class="timeline">
        ${data.claims.slice(0, 3).map(claim => `<div class="timeline-item"><span></span><strong>Claim #${claim.id}</strong><p>${claim.description}</p>${badge(claim.status)}</div>`).join('')}
        ${data.telemetry.slice(0, 3).map(event => `<div class="timeline-item"><span></span><strong>Telemetry #${event.id}</strong><p>${event.speed} km/h, ${event.impact ? 'impact' : 'normal'}</p>${badge(event.severity)}</div>`).join('')}
      </div>
    </section>
  `;
}

export function bindHome() {
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => setRoute(button.dataset.go)));
  document.getElementById('check-server')?.addEventListener('click', async () => {
    setServerStatus({ status: 'unknown', message: 'checking' });
    const status = await refreshHealth();
    setServerStatus(status);
  });
  document.getElementById('quick-telemetry')?.addEventListener('click', async () => {
    const payload = {
      vehicle_id: 1,
      timestamp: new Date().toISOString(),
      speed: 64,
      engine_rpm: 2800,
      acceleration: 2.2,
      braking_flag: true,
      impact_flag: true,
      latitude: 49.99,
      longitude: 36.23
    };
    const result = await apiClient.createTelemetry(payload);
    updateData(data => {
      const nextId = Math.max(0, ...data.telemetry.map(item => item.id)) + 1;
      data.telemetry.unshift({
        id: nextId,
        vehicleId: 1,
        timestamp: payload.timestamp,
        speed: payload.speed,
        engineRpm: payload.engine_rpm,
        acceleration: payload.acceleration,
        braking: payload.braking_flag,
        impact: payload.impact_flag,
        severity: payload.impact_flag && payload.speed >= data.settings.impactSpeedThreshold ? 'critical' : 'normal',
        lat: payload.latitude,
        lng: payload.longitude,
        apiStatus: result.status
      });
    });
    toast('Телеметричну подію додано', 'success');
  });
}

function claimProgress(claim) {
  if (!claim) return 0;
  return { Created: 25, InReview: 55, Approved: 75, Rejected: 100, Paid: 100 }[claim.status] || 10;
}

function quickActions(role, lang) {
  const map = {
    Driver: [
      ['claims', t('createClaim', lang)],
      ['policies', t('policies', lang)],
      ['telemetry', t('telemetry', lang)]
    ],
    Agent: [
      ['policies', t('policies', lang)],
      ['claims', t('claims', lang)],
      ['home', lang === 'uk' ? 'Статистика продажів' : 'Sales statistics']
    ],
    Manager: [
      ['claims', t('claims', lang)],
      ['telemetry', t('telemetry', lang)],
      ['policies', t('policies', lang)]
    ],
    Admin: [
      ['admin', t('admin', lang)],
      ['claims', t('claims', lang)],
      ['telemetry', t('telemetry', lang)]
    ]
  };
  return map[role].map(([route, label]) => `<button data-go="${route}">${label}</button>`).join('') + `<button class="secondary" id="quick-telemetry">${t('createTelemetry', lang)}</button>`;
}

function roleHeadline(role, lang) {
  const uk = {
    Driver: 'Особистий кабінет водія',
    Agent: 'Робоче місце страхового агента',
    Manager: 'Панель врегулювання страхових випадків',
    Admin: 'Адміністративний портал системи'
  };
  const en = {
    Driver: 'Driver personal portal',
    Agent: 'Insurance agent workspace',
    Manager: 'Claim settlement workspace',
    Admin: 'System administration portal'
  };
  return (lang === 'uk' ? uk : en)[role];
}

function roleDescription(role, lang) {
  const uk = {
    Driver: 'Водій переглядає поліси, телеметрію і подає заявки про ДТП.',
    Agent: 'Агент працює з клієнтами, полісами та продажами.',
    Manager: 'Менеджер аналізує заявки, телеметрію та приймає рішення щодо виплат.',
    Admin: 'Адміністратор керує користувачами, даними, резервними копіями та налаштуваннями.'
  };
  const en = {
    Driver: 'Driver reviews policies, telemetry and submits claims.',
    Agent: 'Agent manages clients, policies and sales workflow.',
    Manager: 'Manager analyzes claims, telemetry and makes payout decisions.',
    Admin: 'Administrator manages users, data, backups and settings.'
  };
  return (lang === 'uk' ? uk : en)[role];
}
