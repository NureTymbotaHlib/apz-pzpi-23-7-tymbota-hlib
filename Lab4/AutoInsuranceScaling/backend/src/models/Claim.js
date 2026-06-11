const mongoose = require('mongoose')

const ClaimSchema = new mongoose.Schema(
    {
        claim_id: { type: Number, required: true, unique: true },
        policy_id: { type: Number, required: true },
        reported_by_client_id: { type: Number, required: true },
        handler_user_id: { type: Number, required: false, default: null },
        event_time: { type: Date, required: true },
        location_lat: { type: Number },
        location_lng: { type: Number },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['Created', 'InReview', 'Approved', 'Rejected', 'Paid'],
            default: 'Created'
        },
        estimated_damage: { type: Number },
        approved_payout: { type: Number },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'claims' }
)

ClaimSchema.pre('save', function (next) {
    this.updated_at = new Date()
    next()
})

module.exports = mongoose.model('Claim', ClaimSchema)