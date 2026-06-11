require('dotenv').config()
const { connectDb } = require('../db')
const User = require('../models/User')
const Client = require('../models/Client')

async function run() {
    await connectDb()

    await User.deleteMany({})
    await Client.deleteMany({})

    await User.create([
        {
            user_id: 1,
            role: 'Driver',
            full_name: 'Ivan Tymbota',
            email: 'driver1@test.com',
            password_hash: 'demo_hash'
        },
        {
            user_id: 2,
            role: 'Agent',
            full_name: 'Agent Petro',
            email: 'agent1@test.com',
            password_hash: 'demo_hash'
        }
    ])

    await Client.create([
        {
            client_id: 1,
            full_name: 'Ivan Tymbota',
            email: 'driver1@test.com',
            phone: '+380000000000',
            date_of_birth: new Date('2005-01-01'),
            driver_license_number: 'AB123456'
        }
    ])

    console.log('✅ Seed step1 done (users, clients)')
    process.exit(0)
}

run().catch(err => {
    console.error('❌ Seed step1 error:', err)
    process.exit(1)
})