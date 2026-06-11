require('dotenv').config()
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const { connectDb } = require('./db')

const User = require('./models/User')
const Client = require('./models/Client')
const Vehicle = require('./models/Vehicle')
const Policy = require('./models/Policy')
const Payment = require('./models/Payment')
const Claim = require('./models/Claim')
const TelemetryEvent = require('./models/TelemetryEvent')
const claimController = require('./controllers/claimController')
const telemetryController = require('./controllers/telemetryController')
const adminController = require('./controllers/adminController')


const app = express()
app.use(express.json())

connectDb()
    .then(() => console.log('✅ DB connected'))
    .catch(err => console.error('❌ DB connect error:', err.message))

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'Auto Insurance API', version: '1.0.0' },
        tags: [
            { name: 'System', description: 'Service endpoints' },
            { name: 'Auth', description: 'Authentication and session' },
            { name: 'Clients', description: 'Clients management' },
            { name: 'Vehicles', description: 'Vehicles management' },
            { name: 'Policies', description: 'Insurance policies' },
            { name: 'Payments', description: 'Payments' },
            { name: 'Claims', description: 'Insurance claims' },
            { name: 'Telemetry', description: 'Telemetry events (Wokwi/IoT)' },
            { name: 'Reports', description: 'Reports and analytics' },
            { name: 'Admin', description: 'Administration' }
        ]
    },
    apis: ['./src/app.js']
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

function toInt(v) {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id: { type: integer, example: 1 }
 *         role: { type: string, enum: [Admin, Agent, Manager, Driver], example: Driver }
 *         full_name: { type: string, example: "Ivan Tymbota" }
 *         email: { type: string, example: "driver1@test.com" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     Client:
 *       type: object
 *       properties:
 *         client_id: { type: integer, example: 1 }
 *         full_name: { type: string, example: "Ivan Tymbota" }
 *         email: { type: string, example: "driver1@test.com" }
 *         phone: { type: string, example: "+380000000000" }
 *         date_of_birth: { type: string, format: date, example: "2005-01-01" }
 *         driver_license_number: { type: string, example: "AB123456" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     Vehicle:
 *       type: object
 *       properties:
 *         vehicle_id: { type: integer, example: 1 }
 *         client_id: { type: integer, example: 1 }
 *         vin: { type: string, example: "VINTEST00000000001" }
 *         plate_number: { type: string, example: "AA0001AA" }
 *         make: { type: string, example: "Toyota" }
 *         model: { type: string, example: "Corolla" }
 *         year: { type: integer, example: 2018 }
 *         engine_capacity: { type: number, example: 1.6 }
 *         fuel_type: { type: string, example: "Petrol" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     Policy:
 *       type: object
 *       properties:
 *         policy_id: { type: integer, example: 1 }
 *         client_id: { type: integer, example: 1 }
 *         vehicle_id: { type: integer, example: 1 }
 *         policy_number: { type: string, example: "POL-000001" }
 *         type: { type: string, enum: [OSCPV, CASCO], example: "OSCPV" }
 *         start_date: { type: string, format: date, example: "2026-01-01" }
 *         end_date: { type: string, format: date, example: "2026-12-31" }
 *         status: { type: string, enum: [Draft, Active, Expired, Cancelled], example: "Active" }
 *         base_premium: { type: number, example: 5000 }
 *         final_premium: { type: number, example: 5200 }
 *         tariff_plan: { type: string, example: "Standard" }
 *         created_by_user_id: { type: integer, example: 2 }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     Payment:
 *       type: object
 *       properties:
 *         payment_id: { type: integer, example: 1 }
 *         policy_id: { type: integer, example: 1 }
 *         amount: { type: number, example: 5200 }
 *         currency: { type: string, example: "UAH" }
 *         payment_date: { type: string, format: date-time }
 *         payment_method: { type: string, example: "Card" }
 *         status: { type: string, enum: [Pending, Paid, Failed, Refunded], example: "Paid" }
 *         created_at: { type: string, format: date-time }
 *     Claim:
 *       type: object
 *       properties:
 *         claim_id: { type: integer, example: 1 }
 *         policy_id: { type: integer, example: 1 }
 *         reported_by_client_id: { type: integer, example: 1 }
 *         handler_user_id: { type: integer, example: 3 }
 *         event_time: { type: string, format: date-time }
 *         location_lat: { type: number, example: 50.4501 }
 *         location_lng: { type: number, example: 30.5234 }
 *         description: { type: string, example: "Minor ДТП, пошкодження бампера" }
 *         status: { type: string, enum: [Created, InReview, Approved, Rejected, Paid], example: "InReview" }
 *         estimated_damage: { type: number, example: 15000 }
 *         approved_payout: { type: number, example: 0 }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     TelemetryEvent:
 *       type: object
 *       properties:
 *         event_id: { type: integer, example: 1 }
 *         vehicle_id: { type: integer, example: 1 }
 *         timestamp: { type: string, format: date-time }
 *         speed: { type: number, example: 62 }
 *         engine_rpm: { type: integer, example: 2300 }
 *         acceleration: { type: number, example: 2.4 }
 *         braking_flag: { type: boolean, example: false }
 *         impact_flag: { type: boolean, example: false }
 *         latitude: { type: number, example: 50.4501 }
 *         longitude: { type: number, example: 30.5234 }
 */

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

/* -------------------- AUTH (stubs) -------------------- */
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user (stub)
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/auth/register', (req, res) => res.status(201).json({ message: 'Stub: register' }))

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user (stub)
 *     responses:
 *       200: { description: OK }
 */
app.post('/api/auth/login', (req, res) => res.json({ message: 'Stub: login' }))

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current user (stub)
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/auth/me', (req, res) => res.json({ message: 'Stub: me' }))

/* -------------------- CLIENTS -------------------- */
/**
 * @openapi
 * /api/clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create client (stub)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Client' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/clients', (req, res) => res.status(201).json({ message: 'Stub: create client' }))

/**
 * @openapi
 * /api/clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Get client by client_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Client' }
 *       404: { description: Not found }
 */
app.get('/api/clients/:id', async (req, res) => {
    const id = toInt(req.params.id)
    const client = await Client.findOne({ client_id: id }).lean()
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json(client)
})

/**
 * @openapi
 * /api/clients/{id}:
 *   patch:
 *     tags: [Clients]
 *     summary: Update client (stub)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.patch('/api/clients/:id', (req, res) => res.json({ message: 'Stub: update client' }))

/* -------------------- VEHICLES -------------------- */
/**
 * @openapi
 * /api/vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Create vehicle (stub)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Vehicle' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/vehicles', (req, res) => res.status(201).json({ message: 'Stub: create vehicle' }))

/**
 * @openapi
 * /api/vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get vehicle by vehicle_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Vehicle' }
 *       404: { description: Not found }
 */
app.get('/api/vehicles/:id', async (req, res) => {
    const id = toInt(req.params.id)
    const vehicle = await Vehicle.findOne({ vehicle_id: id }).lean()
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' })
    res.json(vehicle)
})

/**
 * @openapi
 * /api/vehicles/{id}:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Update vehicle (stub)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.patch('/api/vehicles/:id', (req, res) => res.json({ message: 'Stub: update vehicle' }))

/**
 * @openapi
 * /api/vehicles/{id}:
 *   delete:
 *     tags: [Vehicles]
 *     summary: Deactivate vehicle (soft delete) (stub)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.delete('/api/vehicles/:id', (req, res) => {
    res.json({ message: 'Stub: vehicle deactivated' })
})

/* -------------------- POLICIES -------------------- */
/**
 * @openapi
 * /api/policies:
 *   post:
 *     tags: [Policies]
 *     summary: Create policy (stub)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Policy' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/policies', (req, res) => res.status(201).json({ message: 'Stub: create policy' }))

/**
 * @openapi
 * /api/policies/my:
 *   get:
 *     tags: [Policies]
 *     summary: Get my policies (stub)
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/policies/my', (req, res) => res.json({ message: 'Stub: my policies' }))

/**
 * @openapi
 * /api/policies/{id}:
 *   get:
 *     tags: [Policies]
 *     summary: Get policy by policy_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Policy' }
 *       404: { description: Not found }
 */
app.get('/api/policies/:id', async (req, res) => {
    const id = toInt(req.params.id)
    const policy = await Policy.findOne({ policy_id: id }).lean()
    if (!policy) return res.status(404).json({ message: 'Policy not found' })
    res.json(policy)
})

/**
 * @openapi
 * /api/policies/{id}/renew:
 *   patch:
 *     tags: [Policies]
 *     summary: Renew policy (stub)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.patch('/api/policies/:id/renew', (req, res) => res.json({ message: 'Stub: renew policy' }))

/**
 * @openapi
 * /api/policies/{id}:
 *   delete:
 *     tags: [Policies]
 *     summary: Cancel/archive policy (soft delete) (stub)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.delete('/api/policies/:id', (req, res) => {
    res.json({ message: 'Stub: policy cancelled/archived' })
})

/**
 * @openapi
 * /api/policies/create-for-client:
 *   post:
 *     tags: [Policies]
 *     summary: Create policy for client (stub)
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/policies/create-for-client', (req, res) =>
    res.status(201).json({ message: 'Stub: create-for-client' })
)

/* -------------------- PAYMENTS -------------------- */
/**
 * @openapi
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment (stub)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Payment' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/payments', (req, res) => res.status(201).json({ message: 'Stub: create payment' }))

/**
 * @openapi
 * /api/policies/{id}/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get payments by policy_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Payment' }
 */
app.get('/api/policies/:id/payments', async (req, res) => {
    const id = toInt(req.params.id)
    const payments = await Payment.find({ policy_id: id }).lean()
    res.json(payments)
})

/* -------------------- CLAIMS -------------------- */
/**
 * @openapi
 * /api/claims:
 *   post:
 *     tags: [Claims]
 *     summary: Create claim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Claim' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/claims', claimController.createClaim)

/**
 * @openapi
 * /api/claims/{id}:
 *   get:
 *     tags: [Claims]
 *     summary: Get claim by claim_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Claim' }
 *       404: { description: Not found }
 */
app.get('/api/claims/:id', async (req, res) => {
    const id = toInt(req.params.id)
    const claim = await Claim.findOne({ claim_id: id }).lean()
    if (!claim) return res.status(404).json({ message: 'Claim not found' })
    res.json(claim)
})

/**
 * @openapi
 * /api/claims/{id}/status:
 *   get:
 *     tags: [Claims]
 *     summary: Get claim status by claim_id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
app.get('/api/claims/:id/status', async (req, res) => {
    const id = toInt(req.params.id)
    const claim = await Claim.findOne({ claim_id: id }).lean()
    if (!claim) return res.status(404).json({ message: 'Claim not found' })
    res.json({ claim_id: claim.claim_id, status: claim.status })
})

/**
 * @openapi
 * /api/claims/{id}/register:
 *   post:
 *     tags: [Claims]
 *     summary: Register claim 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.post('/api/claims/:id/register', claimController.registerClaim)

/**
 * @openapi
 * /api/claims/{id}/decision:
 *   patch:
 *     tags: [Claims]
 *     summary: Decision for claim 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.patch('/api/claims/:id/decision', claimController.decideClaim)

/**
 * @openapi
 * /api/claims/{id}/pay:
 *   post:
 *     tags: [Claims]
 *     summary: Mark claim as Paid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               manager_user_id: { type: integer, example: 3 }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
app.post('/api/claims/:id/pay', claimController.payClaim)

/* -------------------- TELEMETRY -------------------- */
/**
 * @openapi
 * /api/telemetry-events:
 *   get:
 *     tags: [Telemetry]
 *     summary: Get telemetry events (optionally by vehicleId)
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/TelemetryEvent' }
 */
app.get('/api/telemetry-events', async (req, res) => {
    const vehicleId = req.query.vehicleId ? toInt(req.query.vehicleId) : null
    const filter = vehicleId ? { vehicle_id: vehicleId } : {}
    const events = await TelemetryEvent.find(filter).sort({ timestamp: -1 }).lean()
    res.json(events)
})

/**
 * @openapi
 * /api/telemetry-events:
 *   post:
 *     tags: [Telemetry]
 *     summary: Create telemetry event (Wokwi/IoT) (minimal)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TelemetryEvent' }
 *     responses:
 *       201: { description: Created }
 */
app.post('/api/telemetry-events', telemetryController.createTelemetryEvent)

/* -------------------- REPORTS + ADMIN -------------------- */
/**
 * @openapi
 * /api/reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: Sales statistics (demo)
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/reports/sales', async (req, res) => {
    const byStatus = await Policy.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])
    res.json({ policiesByStatus: byStatus })
})

/**
 * @openapi
 * /api/admin/statistics:
 *   get:
 *     tags: [Admin]
 *     summary: System statistics (demo)
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/admin/statistics', async (req, res) => {
    const [users, clients, vehicles, policies, payments, claims, telemetry] = await Promise.all([
        User.countDocuments({}),
        Client.countDocuments({}),
        Vehicle.countDocuments({}),
        Policy.countDocuments({}),
        Payment.countDocuments({}),
        Claim.countDocuments({}),
        TelemetryEvent.countDocuments({})
    ])
    res.json({ users, clients, vehicles, policies, payments, claims, telemetry_events: telemetry })
})

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change user role 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.patch('/api/admin/users/:id/role', adminController.changeUserRole)

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Deactivate user (soft delete) 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
app.delete('/api/admin/users/:id', adminController.blockUser)

/**
 * @openapi
 * /api/admin/users/{id}/unblock:
 *   post:
 *     tags: [Admin]
 *     summary: Unblock user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actor_user_id: { type: integer, example: 1 }
 *     responses:
 *       200: { description: OK }
 */
app.post('/api/admin/users/:id/unblock', adminController.unblockUser)

/**
 * @openapi
 * /api/admin/audit:
 *   get:
 *     tags: [Admin]
 *     summary: Get audit logs
 *     parameters:
 *       - in: query
 *         name: actor_user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, example: 50 }
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/admin/audit', adminController.getAuditLogs)

/**
 * @openapi
 * /api/admin/tariffs:
 *   put:
 *     tags: [Admin]
 *     summary: Update tariffs and system settings
 *     description: Updates system_settings keys used by business logic (telemetry threshold, policy coefficients).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actor_user_id]
 *             properties:
 *               actor_user_id:
 *                 type: integer
 *                 example: 1
 *               impactSpeedThreshold:
 *                 type: number
 *                 example: 30
 *               cascoCoeff:
 *                 type: number
 *                 example: 1.5
 *               oscpvCoeff:
 *                 type: number
 *                 example: 1.0
 *     responses:
 *       200:
 *         description: Updated settings
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
app.put('/api/admin/tariffs', adminController.updateTariffs)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`)
    console.log(`📄 Swagger UI: http://localhost:${port}/api/docs/`)
})