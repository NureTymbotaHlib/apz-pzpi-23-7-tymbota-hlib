require('dotenv').config()
const { connectDb } = require('../db')

const User = require('../models/User')
const Client = require('../models/Client')
const Vehicle = require('../models/Vehicle')
const Policy = require('../models/Policy')
const Payment = require('../models/Payment')
const Claim = require('../models/Claim')
const TelemetryEvent = require('../models/TelemetryEvent')

async function run() {
    await connectDb()

    // ensure Manager exists (user_id = 3)
    await User.updateOne(
        { user_id: 3 },
        {
            $setOnInsert: {
                user_id: 3,
                role: 'Manager',
                full_name: 'Manager Olena',
                email: 'manager1@test.com',
                password_hash: 'demo_hash'
            }
        },
        { upsert: true }
    )

    // Clean dependent collections (keep users/clients from step1)
    await Vehicle.deleteMany({})
    await Policy.deleteMany({})
    await Payment.deleteMany({})
    await Claim.deleteMany({})
    await TelemetryEvent.deleteMany({})

    const client = await Client.findOne({ client_id: 1 })
    if (!client) throw new Error('Client client_id=1 not found. Run seed_step1 first.')

    // Vehicle
    await Vehicle.create({
        vehicle_id: 1,
        client_id: 1,
        vin: 'VINTEST00000000001',
        plate_number: 'AA0001AA',
        make: 'Toyota',
        model: 'Corolla',
        year: 2018,
        engine_capacity: 1.6,
        fuel_type: 'Petrol'
    })

    // Policy (created by Agent user_id=2)
    await Policy.create({
        policy_id: 1,
        client_id: 1,
        vehicle_id: 1,
        policy_number: 'POL-000001',
        type: 'OSCPV',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        status: 'Active',
        base_premium: 5000,
        final_premium: 5200,
        tariff_plan: 'Standard',
        created_by_user_id: 2
    })

    // Payment
    await Payment.create({
        payment_id: 1,
        policy_id: 1,
        amount: 5200,
        currency: 'UAH',
        payment_date: new Date(),
        payment_method: 'Card',
        status: 'Paid'
    })

    // Claim (handled by Manager user_id=3)
    await Claim.create({
        claim_id: 1,
        policy_id: 1,
        reported_by_client_id: 1,
        handler_user_id: 3,
        event_time: new Date('2025-12-20T18:40:00Z'),
        location_lat: 50.4501,
        location_lng: 30.5234,
        description: 'Minor ДТП, пошкодження бампера',
        status: 'InReview',
        estimated_damage: 15000
    })

    // TelemetryEvent
    await TelemetryEvent.create({
        event_id: 1,
        vehicle_id: 1,
        timestamp: new Date(),
        speed: 62,
        engine_rpm: 2300,
        acceleration: 2.4,
        braking_flag: false,
        impact_flag: false,
        latitude: 50.4501,
        longitude: 30.5234
    })

    console.log('✅ Seed step2 done (vehicles, policies, payments, claims, telemetry_events)')
    process.exit(0)
}

run().catch(err => {
    console.error('❌ Seed step2 error:', err)
    process.exit(1)
})