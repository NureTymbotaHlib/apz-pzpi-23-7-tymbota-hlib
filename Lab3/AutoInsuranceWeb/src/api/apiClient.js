const BASE_URL = 'https://auto-insurance-server.onrender.com';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const raw = await response.text();

    let data = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { message: error.message || 'Network error' }
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function reachabilityCheck() {
  try {
    await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      mode: 'no-cors'
    });

    return {
      ok: true,
      status: 200,
      data: { status: 'reachable' }
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { message: error.message || 'Network error' }
    };
  }
}

export const apiClient = {
  baseUrl: BASE_URL,

  health: async () => {
    const normalCheck = await request('/api/health');

    if (normalCheck.ok) {
      return normalCheck;
    }

    return reachabilityCheck();
  },

  getPolicy: (id) => request(`/api/policies/${id}`),
  getVehicle: (id) => request(`/api/vehicles/${id}`),
  getTelemetry: (vehicleId = 1) => request(`/api/telemetry-events?vehicleId=${vehicleId}`),
  createTelemetry: (payload) => request('/api/telemetry-events', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createClaim: (payload) => request('/api/claims', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  registerClaim: (id, managerUserId = 3) => request(`/api/claims/${id}/register`, {
    method: 'POST',
    body: JSON.stringify({ manager_user_id: managerUserId })
  }),
  decideClaim: (id, payload) => request(`/api/claims/${id}/decision`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
};