const mongoose = require('mongoose')

const AuditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        actor_user_id: { type: Number, required: true },
        target_user_id: { type: Number, default: null },
        details: { type: Object, default: {} },
        created_at: { type: Date, default: Date.now }
    },
    { collection: 'audit_logs' }
)

module.exports = mongoose.model('AuditLog', AuditLogSchema)