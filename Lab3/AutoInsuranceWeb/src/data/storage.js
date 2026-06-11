import { seedData } from './demoData.js';

const DATA_KEY = 'autoinsurance.web.data.v3';
const PREFS_KEY = 'autoinsurance.web.prefs.v3';

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadData() {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    const data = clone(seedData);
    saveData(data);
    return data;
  }
  try {
    return { ...clone(seedData), ...JSON.parse(raw) };
  } catch (error) {
    console.warn('Invalid local data, resetting to seed', error);
    const data = clone(seedData);
    saveData(data);
    return data;
  }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function resetData() {
  const data = clone(seedData);
  saveData(data);
  return data;
}

export function loadPrefs() {
  const defaults = {
    role: 'Driver',
    userId: 1,
    language: 'uk',
    region: 'uk-UA',
    direction: 'ltr',
    route: 'home',
    search: '',
    sort: 'name'
  };
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
