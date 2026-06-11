const Policy = require('../models/Policy')
const Payment = require('../models/Payment')
const SystemSettings = require('../models/SystemSettings')

const getTariffCoeff = async (plan) => {
    if (plan === 'CASCO') {
        const row = await SystemSettings.findOne({ key: 'cascoCoeff' }).lean()
        return row && Number.isFinite(row.valueNumber) ? row.valueNumber : 1.5
    }

    const row = await SystemSettings.findOne({ key: 'oscpvCoeff' }).lean()
    return row && Number.isFinite(row.valueNumber) ? row.valueNumber : 1.0
}

exports.createPolicy = async (data) => {
    const coeff = await getTariffCoeff(data.tariff_plan)

    const policy = new Policy({
        ...data,
        status: 'Draft',
        final_premium: data.base_premium * coeff
    })

    return policy.save()
}

exports.activatePolicy = async (policyId) => {
    const payment = await Payment.findOne({ policy_id: policyId, status: 'Paid' })
    if (!payment) {
        throw new Error('Policy cannot be activated without payment')
    }

    return Policy.findByIdAndUpdate(
        policyId,
        { status: 'Active', start_date: new Date() },
        { new: true }
    )
}