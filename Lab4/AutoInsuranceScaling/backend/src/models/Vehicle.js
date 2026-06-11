const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema(
    {
        vehicle_id: { type: Number, required: true, unique: true },
        client_id: { type: Number, required: true }, // FK -> clients.client_id
        vin: { type: String, required: true, unique: true },
        plate_number: { type: String, required: true },
        make: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        engine_capacity: { type: Number },
        fuel_type: { type: String },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'vehicles' }
)

module.exports = mongoose.model('Vehicle', VehicleSchema)