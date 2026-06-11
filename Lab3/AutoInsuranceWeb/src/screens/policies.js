import { getState, getClient, getVehicle, setPrefs } from '../appState.js';
import { t } from '../i18n/translations.js';
import { badge } from '../components/cards.js';
import { formatMoney, formatShortDate, sortByLocale } from '../utils/formatters.js';

export function renderPolicies() {
  const state = getState();
  const { data, prefs } = state;
  const lang = prefs.language;
  const query = (prefs.policySearch || '').toLowerCase();
  let policies = data.policies.filter(policy => {
    const client = getClient(policy.clientId);
    const vehicle = getVehicle(policy.vehicleId);
    return [policy.number, policy.type, policy.status, client?.fullName, vehicle?.make, vehicle?.model]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const sort = prefs.policySort || 'number';
  policies = sortByLocale(policies, policy => {
    if (sort === 'client') return getClient(policy.clientId)?.fullName || '';
    if (sort === 'status') return policy.status;
    return policy.number;
  }, prefs.region);

  return `
    <section class="panel">
      <div class="section-head">
        <h3>${t('policies', lang)}</h3>
        <div class="inline-controls">
          <input id="policy-search" placeholder="${t('search', lang)}" value="${prefs.policySearch || ''}" />
          <select id="policy-sort">
            <option value="number" ${sort === 'number' ? 'selected' : ''}>№</option>
            <option value="client" ${sort === 'client' ? 'selected' : ''}>${t('client', lang)}</option>
            <option value="status" ${sort === 'status' ? 'selected' : ''}>${t('status', lang)}</option>
          </select>
        </div>
      </div>
      <div class="card-grid">
        ${policies.map(policyCard).join('')}
      </div>
    </section>
  `;
}

export function bindPolicies() {
  document.getElementById('policy-search')?.addEventListener('input', event => setPrefs({ policySearch: event.target.value }));
  document.getElementById('policy-sort')?.addEventListener('change', event => setPrefs({ policySort: event.target.value }));
}

function policyCard(policy) {
  const { prefs } = getState();
  const client = getClient(policy.clientId);
  const vehicle = getVehicle(policy.vehicleId);
  return `
    <article class="entity-card policy-card">
      <div class="entity-head">
        <div>
          <span class="eyebrow">${policy.type}</span>
          <h3>${policy.number}</h3>
        </div>
        ${badge(policy.status)}
      </div>
      <div class="info-grid">
        <div><span>Клієнт</span><strong>${client?.fullName || '-'}</strong></div>
        <div><span>Авто</span><strong>${vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}</strong></div>
        <div><span>Період</span><strong>${formatShortDate(policy.start, prefs.region)} - ${formatShortDate(policy.end, prefs.region)}</strong></div>
        <div><span>Премія</span><strong>${formatMoney(policy.finalPremium, prefs.region)}</strong></div>
      </div>
    </article>
  `;
}
