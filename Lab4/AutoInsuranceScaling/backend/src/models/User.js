const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        user_id: { type: Number, required: true, unique: true },
        role: { type: String, enum: ['Admin', 'Agent', 'Manager', 'Driver'], required: true },
        full_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    { collection: 'users' }
)

module.exports = mongoose.model('User', UserSchema)