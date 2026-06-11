const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema(
    {
        payment_id: { type: Number, required: true, unique: true },
        policy_id: { type: Number, required: true }, // FK -> policies.policy_id
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        payment_date: { type: Date, required: true },
        payment_method: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], required: true },
        created_at: { type: Date, default: Date.now }
    },
    { collection: 'payments' }
)

module.exports = mongoose.model('Payment', PaymentSchema)