const mongoose = require('mongoose')

async function connectDb() {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is missing')

    await mongoose.connect(uri, { dbName: 'auto_insurance_db' })
    return mongoose
}

module.exports = { connectDb }