const mongoose = require('mongoose')

const SystemSettingsSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        valueNumber: { type: Number, default: null },
        valueString: { type: String, default: null },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'system_settings' }
)

SystemSettingsSchema.pre('save', function (next) {
    this.updated_at = new Date()
    next()
})

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema)