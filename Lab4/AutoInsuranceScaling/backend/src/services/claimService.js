const Claim = require('../models/Claim')
const Policy = require('../models/Policy')
const User = require('../models/User')

const httpError = (status, message) => {
    const err = new Error(message)
    err.status = status
    return err
}

const getNextClaimId = async () => {
    const last = await Claim.findOne({}).sort({ claim_id: -1 }).lean()
    return last ? last.claim_id + 1 : 1
}

const ensureManager = async (managerUserId) => {
    const manager = await User.findOne({ user_id: managerUserId }).lean()
    if (!manager) throw httpError(404, 'Manager user not found')
    if (manager.role !== 'Manager') throw httpError(403, 'Only Manager can perform this action')
    return manager
}

exports.createClaim = async (data) => {
    const {
        policy_id,
        reported_by_client_id,
        event_time,
        location_lat,
        location_lng,
        description,
        estimated_damage
    } = data

    if (!policy_id || !reported_by_client_id || !event_time || !description) {
        throw httpError(400, 'Required fields: policy_id, reported_by_client_id, event_time, description')
    }

    const policy = await Policy.findOne({ policy_id }).lean()
    if (!policy) throw httpError(404, 'Policy not found')

    if (policy.client_id !== Number(reported_by_client_id)) {
        throw httpError(403, 'Client is not owner of this policy')
    }

    const evTime = new Date(event_time)
    if (Number.isNaN(evTime.getTime())) throw httpError(400, 'Invalid event_time')

    if (policy.status !== 'Active') throw httpError(400, 'Policy must be Active to create a claim')
    if (evTime < new Date(policy.start_date) || evTime > new Date(policy.end_date)) {
        throw httpError(400, 'Event time is outside policy coverage period')
    }

    const claim_id = await getNextClaimId()

    const claim = await Claim.create({
        claim_id,
        policy_id: Number(policy_id),
        reported_by_client_id: Number(reported_by_client_id),
        handler_user_id: null,
        event_time: evTime,
        location_lat,
        location_lng,
        description,
        status: 'Created',
        estimated_damage
    })

    return claim
}

exports.registerClaim = async (claimId, managerUserId) => {
    await ensureManager(managerUserId)

    const claim = await Claim.findOne({ claim_id: claimId })
    if (!claim) throw httpError(404, 'Claim not found')

    if (claim.status !== 'Created') {
        throw httpError(400, 'Only claims with status Created can be registered')
    }

    claim.handler_user_id = Number(managerUserId)
    claim.status = 'InReview'
    await claim.save()

    return claim
}

exports.decideClaim = async (claimId, managerUserId, decision, approved_payout) => {
    await ensureManager(managerUserId)

    const claim = await Claim.findOne({ claim_id: claimId })
    if (!claim) throw httpError(404, 'Claim not found')

    if (claim.status !== 'InReview') {
        throw httpError(400, 'Decision is allowed only for InReview claims')
    }

    if (claim.handler_user_id !== Number(managerUserId)) {
        throw httpError(403, 'Only claim handler can make a decision')
    }

    if (decision !== 'Approved' && decision !== 'Rejected') {
        throw httpError(400, "decision must be 'Approved' or 'Rejected'")
    }

    if (decision === 'Approved') {
        const payout = Number(approved_payout)
        if (!Number.isFinite(payout) || payout < 0) throw httpError(400, 'Invalid approved_payout')

        if (Number.isFinite(claim.estimated_damage) && payout > Number(claim.estimated_damage)) {
            throw httpError(400, 'approved_payout cannot exceed estimated_damage')
        }

        claim.approved_payout = payout
        claim.status = 'Approved'
    } else {
        claim.approved_payout = undefined
        claim.status = 'Rejected'
    }

    await claim.save()
    return claim
}

exports.payClaim = async (claimId, managerUserId) => {
    await ensureManager(managerUserId)

    const claim = await Claim.findOne({ claim_id: claimId })
    if (!claim) throw httpError(404, 'Claim not found')

    if (claim.status !== 'Approved') {
        throw httpError(400, 'Only Approved claim can be paid')
    }

    if (claim.handler_user_id !== Number(managerUserId)) {
        throw httpError(403, 'Only claim handler can mark claim as Paid')
    }

    claim.status = 'Paid'
    await claim.save()

    return claim
}