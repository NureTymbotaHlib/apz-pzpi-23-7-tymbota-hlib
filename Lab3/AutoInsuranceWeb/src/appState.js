import { loadData, saveData, loadPrefs, savePrefs, resetData as resetSeedData } from './data/storage.js';

export const ROLE_USERS = {
  Driver: 1,
  Agent: 2,
  Manager: 3,
  Admin: 4
};

let listeners = [];
let state = {
  data: loadData(),
  prefs: loadPrefs(),
  server: { status: 'unknown', message: '' },
  toast: null
};

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(item => item !== listener);
  };
}

function emit() {
  saveData(state.data);
  savePrefs(state.prefs);
  listeners.forEach(listener => listener(state));
}

export function setPrefs(patch) {
  state = { ...state, prefs: { ...state.prefs, ...patch } };
  document.documentElement.lang = state.prefs.language;
  document.documentElement.dir = state.prefs.direction;
  emit();
}

export function setRoute(route) {
  setPrefs({ route });
}

export function setRole(role) {
  setPrefs({ role, userId: ROLE_USERS[role] || 1 });
}

export function updateData(mutator) {
  const next = structuredClone(state.data);
  mutator(next);
  state = { ...state, data: next };
  emit();
}

export function setServerStatus(server) {
  state = { ...state, server };
  emit();
}

export function toast(message, type = 'info') {
  state = { ...state, toast: { message, type, at: Date.now() } };
  emit();
  setTimeout(() => {
    if (state.toast?.message === message) {
      state = { ...state, toast: null };
      emit();
    }
  }, 3500);
}

export function resetAllData() {
  state = { ...state, data: resetSeedData() };
  emit();
}

export function replaceAllData(data) {
  state = { ...state, data };
  emit();
}

export function activeUser() {
  return state.data.users.find(user => user.id === state.prefs.userId) || state.data.users[0];
}

export function getClient(id) {
  return state.data.clients.find(item => item.id === Number(id));
}

export function getVehicle(id) {
  return state.data.vehicles.find(item => item.id === Number(id));
}

export function getPolicy(id) {
  return state.data.policies.find(item => item.id === Number(id));
}

export function visibleClaims() {
  const { role, userId } = state.prefs;
  if (role === 'Driver') {
    return state.data.claims.filter(claim => claim.clientId === 1 || claim.createdBy === userId);
  }
  if (role === 'Agent') {
    return state.data.claims.filter(claim => [1, 2, 3].includes(claim.clientId));
  }
  return state.data.claims;
}
