from locust import HttpUser, task, between

class AutoInsuranceUser(HttpUser):
    wait_time = between(0.3, 1.5)

    @task(4)
    def health(self):
        self.client.get('/api/health', name='GET /api/health')

    @task(3)
    def policy_details(self):
        self.client.get('/api/policies/1', name='GET /api/policies/{id}')

    @task(2)
    def vehicle_details(self):
        self.client.get('/api/vehicles/1', name='GET /api/vehicles/{id}')

    @task(1)
    def telemetry_list(self):
        self.client.get('/api/telemetry-events?vehicleId=1', name='GET /api/telemetry-events')