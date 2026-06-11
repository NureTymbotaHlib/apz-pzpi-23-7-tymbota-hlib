import { subscribe, getState, setServerStatus } from './appState.js';
import { shell, bindLayoutEvents, refreshHealth } from './components/layout.js';
import { renderHome, bindHome } from './screens/home.js';
import { renderPolicies, bindPolicies } from './screens/policies.js';
import { renderClaims, bindClaims } from './screens/claims.js';
import { renderTelemetry, bindTelemetry } from './screens/telemetry.js';
import { renderAdmin, bindAdmin } from './screens/admin.js';
import { renderProfile, bindProfile } from './screens/profile.js';

const app = document.getElementById('app');

const routes = {
  home: [renderHome, bindHome],
  policies: [renderPolicies, bindPolicies],
  claims: [renderClaims, bindClaims],
  telemetry: [renderTelemetry, bindTelemetry],
  admin: [renderAdmin, bindAdmin],
  profile: [renderProfile, bindProfile]
};

function render() {
  const { prefs } = getState();
  const [renderRoute, bindRoute] = routes[prefs.route] || routes.home;
  app.innerHTML = shell(renderRoute());
  bindLayoutEvents();
  bindRoute();
  document.documentElement.lang = prefs.language;
  document.documentElement.dir = prefs.direction;
}

subscribe(render);
render();

refreshHealth().then(setServerStatus);
