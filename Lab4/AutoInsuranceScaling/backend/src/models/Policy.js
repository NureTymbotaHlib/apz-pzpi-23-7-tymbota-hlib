const mongoose = require('mongoose')

const PolicySchema = new mongoose.Schema(
    {
        policy_id: { type: Number, required: true, unique: true },
        client_id: { type: Number, required: true }, // FK -> clients.client_id
        vehicle_id: { type: Number, required: true }, // FK -> vehicles.vehicle_id
        policy_number: { type: String, required: true, unique: true },
        type: { type: String, enum: ['OSCPV', 'CASCO'], required: true },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        status: { type: String, enum: ['Draft', 'Active', 'Expired', 'Cancelled'], required: true },
        base_premium: { type: Number, required: true },
        final_premium: { type: Number, required: true },
        tariff_plan: { type: String, required: true },
        created_by_user_id: { type: Number, required: true }, // FK -> users.user_id
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'policies' }
)

module.exports = mongoose.model('Policy', PolicySchema)