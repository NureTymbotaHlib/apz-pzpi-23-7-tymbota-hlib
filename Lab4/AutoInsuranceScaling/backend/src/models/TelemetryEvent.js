const mongoose = require('mongoose')

const TelemetryEventSchema = new mongoose.Schema(
    {
        event_id: { type: Number, required: true, unique: true },
        vehicle_id: { type: Number, required: true }, // FK -> vehicles.vehicle_id
        timestamp: { type: Date, required: true },
        speed: { type: Number },
        engine_rpm: { type: Number },
        acceleration: { type: Number },
        braking_flag: { type: Boolean },
        impact_flag: { type: Boolean },
        severity: { type: String, enum: ['normal', 'critical'], default: 'normal' },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    { collection: 'telemetry_events' }
)

module.exports = mongoose.model('TelemetryEvent', TelemetryEventSchema)