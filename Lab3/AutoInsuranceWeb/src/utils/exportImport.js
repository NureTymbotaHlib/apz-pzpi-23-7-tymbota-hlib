import { getState, updateData, replaceAllData, toast } from '../appState.js';
import { downloadText } from './formatters.js';

export function exportAllData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 'lab3-web-1.0',
    data: getState().data
  };
  downloadText(`autoinsurance-export-${Date.now()}.json`, JSON.stringify(payload, null, 2));
}

export function createBackup() {
  const snapshot = {
    id: Date.now(),
    name: `backup-${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    data: getState().data
  };
  updateData(data => {
    data.backups.unshift(snapshot);
  });
  toast('Резервну копію створено', 'success');
}

export function restoreBackup(id) {
  const backup = getState().data.backups.find(item => item.id === Number(id));
  if (!backup) return;
  const restored = structuredClone(backup.data);
  restored.backups = getState().data.backups;
  replaceAllData(restored);
  toast('Дані відновлено з резервної копії', 'success');
}

export function importAllData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed.data || !parsed.version) throw new Error('Invalid file structure');
      replaceAllData(parsed.data);
      toast('Дані успішно імпортовано', 'success');
    } catch (error) {
      toast(`Помилка імпорту: ${error.message}`, 'danger');
    }
  };
  reader.readAsText(file);
}
