export const seedData = {
  users: [
    { id: 1, name: 'Гліб Тимбота', email: 'hlib.tymbota@nure.ua', role: 'Driver', active: true, locale: 'uk-UA' },
    { id: 2, name: 'Олена Кравченко', email: 'agent@autoinsure.ua', role: 'Agent', active: true, locale: 'uk-UA' },
    { id: 3, name: 'Ігор Мельник', email: 'manager@autoinsure.ua', role: 'Manager', active: true, locale: 'uk-UA' },
    { id: 4, name: 'Адміністратор системи', email: 'admin@autoinsure.ua', role: 'Admin', active: true, locale: 'uk-UA' }
  ],
  clients: [
    { id: 1, fullName: 'Тимбота Гліб Олексійович', phone: '+380501112233', email: 'hlib.tymbota@nure.ua', birthDate: '2005-03-15', driverLicense: 'AAE123456' },
    { id: 2, fullName: 'Бондар Андрій Сергійович', phone: '+380672225544', email: 'andrii.bondar@example.com', birthDate: '1998-06-02', driverLicense: 'BBB884422' },
    { id: 3, fullName: 'Клименко Марія Ігорівна', phone: '+380936661122', email: 'maria.klymenko@example.com', birthDate: '1996-11-20', driverLicense: 'CCC998811' }
  ],
  vehicles: [
    { id: 1, clientId: 1, vin: 'WVWZZZ1KZAW000001', plate: 'AX1234HB', make: 'Volkswagen', model: 'Golf', year: 2020, fuel: 'Petrol', active: true },
    { id: 2, clientId: 2, vin: 'VF1RFB00999900002', plate: 'AX7777KA', make: 'Renault', model: 'Megane', year: 2019, fuel: 'Diesel', active: true },
    { id: 3, clientId: 3, vin: 'JTDKN3DU0F0000003', plate: 'AX5050II', make: 'Toyota', model: 'Prius', year: 2021, fuel: 'Hybrid', active: true }
  ],
  policies: [
    { id: 1, clientId: 1, vehicleId: 1, number: 'POL-000001', type: 'OSCPV', status: 'Active', start: '2025-01-01T00:00:00.000Z', end: '2025-12-31T00:00:00.000Z', basePremium: 5000, finalPremium: 5200, tariffPlan: 'Standard' },
    { id: 2, clientId: 2, vehicleId: 2, number: 'POL-000002', type: 'CASCO', status: 'Draft', start: '2025-02-10T00:00:00.000Z', end: '2026-02-09T00:00:00.000Z', basePremium: 18000, finalPremium: 21300, tariffPlan: 'Premium' },
    { id: 3, clientId: 3, vehicleId: 3, number: 'POL-000003', type: 'OSCPV', status: 'Active', start: '2025-04-01T00:00:00.000Z', end: '2026-03-31T00:00:00.000Z', basePremium: 4700, finalPremium: 4890, tariffPlan: 'SafeDrive' }
  ],
  claims: [
    { id: 1, policyId: 1, clientId: 1, handlerUserId: 3, createdBy: 1, eventTime: '2025-06-12T11:30:00.000Z', status: 'InReview', description: 'Заявка після ДТП у міському русі. Потрібна перевірка телеметрії.', location: 'Харків, проспект Науки', estimatedDamage: 14500, approvedPayout: 0, history: ['Created by Driver', 'Registered by Manager'] },
    { id: 2, policyId: 3, clientId: 3, handlerUserId: null, createdBy: 3, eventTime: '2025-08-03T18:15:00.000Z', status: 'Created', description: 'Пошкодження бампера після паркування.', location: 'Харків, Салтівка', estimatedDamage: 6200, approvedPayout: 0, history: ['Created by Driver'] }
  ],
  telemetry: [
    { id: 1, vehicleId: 1, timestamp: '2025-06-12T11:29:30.000Z', speed: 42, engineRpm: 2100, acceleration: 1.3, braking: false, impact: false, severity: 'normal', lat: 49.9900, lng: 36.2300 },
    { id: 2, vehicleId: 1, timestamp: '2025-06-12T11:30:00.000Z', speed: 68, engineRpm: 3100, acceleration: 2.7, braking: true, impact: true, severity: 'critical', lat: 49.9911, lng: 36.2317 },
    { id: 3, vehicleId: 3, timestamp: '2025-08-03T18:14:50.000Z', speed: 12, engineRpm: 1300, acceleration: 0.4, braking: true, impact: false, severity: 'normal', lat: 49.9801, lng: 36.2501 }
  ],
  payments: [
    { id: 1, policyId: 1, amount: 5200, currency: 'UAH', status: 'Paid', paidAt: '2025-01-01T12:10:00.000Z' },
    { id: 2, policyId: 2, amount: 21300, currency: 'UAH', status: 'Pending', paidAt: null },
    { id: 3, policyId: 3, amount: 4890, currency: 'UAH', status: 'Paid', paidAt: '2025-04-01T08:25:00.000Z' }
  ],
  settings: {
    impactSpeedThreshold: 30,
    cascoCoeff: 1.5,
    oscpvCoeff: 1.0,
    defaultCurrency: 'UAH',
    dataRetentionMonths: 36
  },
  backups: []
};
