const mongoose = require('mongoose')

const ClientSchema = new mongoose.Schema(
    {
        client_id: { type: Number, required: true, unique: true },
        full_name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        date_of_birth: { type: Date, required: true },
        driver_license_number: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'clients' }
)

module.exports = mongoose.model('Client', ClientSchema)