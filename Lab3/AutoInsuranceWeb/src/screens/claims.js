import { getState, getClient, getPolicy, getVehicle, updateData, visibleClaims, toast } from '../appState.js';
import { t } from '../i18n/translations.js';
import { badge, emptyState } from '../components/cards.js';
import { formatDate, formatMoney, makeId } from '../utils/formatters.js';
import { apiClient } from '../api/apiClient.js';

export function renderClaims() {
  const state = getState();
  const { data, prefs } = state;
  const lang = prefs.language;
  const claims = visibleClaims();
  const canCreate = prefs.role === 'Driver';

  return `
    <div class="claims-layout">
      <section class="panel">
        <div class="section-head">
          <h3>${t('claims', lang)}</h3>
          ${canCreate ? `<button id="open-claim-form">${t('createClaim', lang)}</button>` : ''}
        </div>
        <div class="claim-list">
          ${claims.length ? claims.map(claimCard).join('') : emptyState('Немає заявок', 'Для поточної ролі немає доступних заявок.')}
        </div>
      </section>
      <section class="panel ${canCreate ? '' : 'hidden'}" id="claim-form-panel">
        <h3>${t('createClaim', lang)}</h3>
        <form id="claim-form" class="form-grid">
          <label>Policy ID<input name="policyId" type="number" value="1" /></label>
          <label>${t('date', lang)}<input name="eventTime" type="datetime-local" value="2025-06-12T11:30" /></label>
          <label>${t('amount', lang)}<input name="estimatedDamage" type="number" value="15000" /></label>
          <label class="full">${t('description', lang)}<textarea name="description" rows="3">ДТП зафіксовано через веб-застосунок. Потрібна перевірка поліса та телеметрії.</textarea></label>
          <button class="full" type="submit">${t('save', lang)}</button>
        </form>
      </section>
    </div>
  `;
}

export function bindClaims() {
  document.getElementById('open-claim-form')?.addEventListener('click', () => document.getElementById('claim-form-panel')?.classList.toggle('hidden'));
  document.getElementById('claim-form')?.addEventListener('submit', createClaim);
  document.querySelectorAll('[data-claim-action]').forEach(button => {
    button.addEventListener('click', () => handleClaimAction(Number(button.dataset.claimId), button.dataset.claimAction));
  });
}

function claimCard(claim) {
  const { prefs } = getState();
  const policy = getPolicy(claim.policyId);
  const client = getClient(claim.clientId);
  const vehicle = policy ? getVehicle(policy.vehicleId) : null;
  return `
    <article class="entity-card claim-card">
      <div class="entity-head">
        <div>
          <span class="eyebrow">Claim #${claim.id}</span>
          <h3>${client?.fullName || 'Client'}</h3>
        </div>
        ${badge(claim.status)}
      </div>
      <p>${claim.description}</p>
      <div class="info-grid compact">
        <div><span>Policy</span><strong>${policy?.number || claim.policyId}</strong></div>
        <div><span>Vehicle</span><strong>${vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}</strong></div>
        <div><span>Date</span><strong>${formatDate(claim.eventTime, prefs.region)}</strong></div>
        <div><span>Damage</span><strong>${formatMoney(claim.estimatedDamage, prefs.region)}</strong></div>
      </div>
      ${renderActions(claim)}
      <details class="history"><summary>History</summary>${(claim.history || []).map(item => `<p>${item}</p>`).join('')}</details>
    </article>
  `;
}

function renderActions(claim) {
  const { prefs } = getState();
  if (prefs.role === 'Driver') {
    return `<div class="actions-row"><button class="secondary" data-claim-action="track" data-claim-id="${claim.id}">Відстежити</button></div>`;
  }
  if (prefs.role === 'Agent') {
    return `<div class="actions-row"><button class="secondary" data-claim-action="sendManager" data-claim-id="${claim.id}">Передати менеджеру</button></div>`;
  }
  if (prefs.role === 'Manager') {
    return `
      <div class="actions-row">
        <button data-claim-action="register" data-claim-id="${claim.id}">Взяти в роботу</button>
        <button data-claim-action="approve" data-claim-id="${claim.id}">Схвалити</button>
        <button class="danger" data-claim-action="reject" data-claim-id="${claim.id}">Відхилити</button>
        <button class="secondary" data-claim-action="paid" data-claim-id="${claim.id}">Виплачено</button>
      </div>
    `;
  }
  if (prefs.role === 'Admin') {
    return `
      <div class="actions-row">
        <button data-claim-action="reset" data-claim-id="${claim.id}">Created</button>
        <button data-claim-action="register" data-claim-id="${claim.id}">InReview</button>
        <button data-claim-action="approve" data-claim-id="${claim.id}">Approved</button>
        <button class="danger" data-claim-action="delete" data-claim-id="${claim.id}">Delete</button>
      </div>
    `;
  }
  return '';
}

async function createClaim(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const policyId = Number(form.get('policyId') || 1);
  const policy = getPolicy(policyId) || getState().data.policies[0];
  const claim = {
    id: makeId(getState().data.claims),
    policyId,
    clientId: policy.clientId,
    handlerUserId: null,
    createdBy: 1,
    eventTime: new Date(form.get('eventTime')).toISOString(),
    status: 'Created',
    description: String(form.get('description') || ''),
    location: 'Web client location',
    estimatedDamage: Number(form.get('estimatedDamage') || 0),
    approvedPayout: 0,
    history: ['Created by Driver from Web client']
  };
  updateData(data => data.claims.unshift(claim));
  await apiClient.createClaim({
    policy_id: claim.policyId,
    reported_by_client_id: claim.clientId,
    event_time: claim.eventTime,
    location_lat: 49.99,
    location_lng: 36.23,
    description: claim.description,
    estimated_damage: claim.estimatedDamage
  });
  toast(t('claimCreated', getState().prefs.language), 'success');
  event.currentTarget.reset();
}

async function handleClaimAction(id, action) {
  const now = new Date().toISOString();
  const { prefs } = getState();
  if (action === 'track') return toast('Статус заявки оновлено на екрані', 'info');
  if (action === 'sendManager') return toast('Заявку передано менеджеру', 'success');

  updateData(data => {
    const claim = data.claims.find(item => item.id === id);
    if (!claim) return;
    if (action === 'delete') {
      data.claims = data.claims.filter(item => item.id !== id);
      return;
    }
    if (action === 'reset') {
      claim.status = 'Created';
      claim.handlerUserId = null;
      claim.approvedPayout = 0;
      claim.history.push(`Reset by ${prefs.role} at ${now}`);
    }
    if (action === 'register') {
      claim.status = 'InReview';
      claim.handlerUserId = 3;
      claim.history.push(`Registered by ${prefs.role} at ${now}`);
    }
    if (action === 'approve') {
      claim.status = 'Approved';
      claim.approvedPayout = Math.round(Number(claim.estimatedDamage || 0) * 0.82);
      claim.history.push(`Approved by ${prefs.role} at ${now}`);
    }
    if (action === 'reject') {
      claim.status = 'Rejected';
      claim.approvedPayout = 0;
      claim.history.push(`Rejected by ${prefs.role} at ${now}`);
    }
    if (action === 'paid') {
      claim.status = 'Paid';
      claim.history.push(`Marked as paid by ${prefs.role} at ${now}`);
    }
  });
  if (action === 'register') await apiClient.registerClaim(id, 3);
  if (action === 'approve') await apiClient.decideClaim(id, { manager_user_id: 3, decision: 'Approved', approved_payout: 1000 });
  toast('Стан заявки оновлено', 'success');
}
