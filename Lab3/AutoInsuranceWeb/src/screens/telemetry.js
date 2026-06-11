import { getState, updateData, toast } from '../appState.js';
import { t } from '../i18n/translations.js';
import { badge } from '../components/cards.js';
import { formatDate, makeId } from '../utils/formatters.js';
import { apiClient } from '../api/apiClient.js';

export function renderTelemetry() {
  const state = getState();
  const { data, prefs } = state;
  const lang = prefs.language;
  const events = [...data.telemetry].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return `
    <div class="two-column telemetry-layout">
      <section class="panel">
        <div class="section-head">
          <h3>${t('telemetry', lang)}</h3>
          <button id="create-telemetry">${t('createTelemetry', lang)}</button>
        </div>
        <div class="telemetry-chart">
          ${events.slice(0, 10).reverse().map(event => `<span title="${event.speed} km/h" style="height:${Math.max(12, event.speed)}px" class="${event.severity}"></span>`).join('')}
        </div>
        <p class="muted">Поріг критичності: ${data.settings.impactSpeedThreshold} km/h + impact flag.</p>
      </section>
      <section class="panel">
        <h3>OBD/GPS events</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Vehicle</th><th>Speed</th><th>Impact</th><th>${t('status', lang)}</th><th>${t('date', lang)}</th></tr></thead>
            <tbody>
              ${events.map(event => `
                <tr>
                  <td>#${event.id}</td>
                  <td>${event.vehicleId}</td>
                  <td>${event.speed} km/h</td>
                  <td>${event.impact ? 'yes' : 'no'}</td>
                  <td>${badge(event.severity)}</td>
                  <td>${formatDate(event.timestamp, prefs.region)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

export function bindTelemetry() {
  document.getElementById('create-telemetry')?.addEventListener('click', async () => {
    const state = getState();
    const speed = Math.round(20 + Math.random() * 90);
    const impact = Math.random() > 0.55;
    const event = {
      id: makeId(state.data.telemetry),
      vehicleId: 1,
      timestamp: new Date().toISOString(),
      speed,
      engineRpm: 1200 + speed * 22,
      acceleration: Number((Math.random() * 3).toFixed(1)),
      braking: Math.random() > 0.5,
      impact,
      severity: impact && speed >= state.data.settings.impactSpeedThreshold ? 'critical' : 'normal',
      lat: 49.99 + Math.random() / 100,
      lng: 36.23 + Math.random() / 100
    };
    updateData(data => data.telemetry.unshift(event));
    await apiClient.createTelemetry({
      vehicle_id: event.vehicleId,
      timestamp: event.timestamp,
      speed: event.speed,
      engine_rpm: event.engineRpm,
      acceleration: event.acceleration,
      braking_flag: event.braking,
      impact_flag: event.impact,
      latitude: event.lat,
      longitude: event.lng
    });
    toast('Телеметрію створено', 'success');
  });
}
