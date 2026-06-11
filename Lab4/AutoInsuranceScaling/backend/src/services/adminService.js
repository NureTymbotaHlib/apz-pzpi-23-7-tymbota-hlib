const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const SystemSettings = require('../models/SystemSettings')

const httpError = (status, message) => {
    const err = new Error(message)
    err.status = status
    return err
}

const ensureAdmin = async (actorUserId) => {
    const actor = await User.findOne({ user_id: actorUserId }).lean()
    if (!actor) throw httpError(404, 'Admin user not found')
    if (actor.role !== 'Admin') throw httpError(403, 'Only Admin can perform this action')
    return actor
}

const writeAudit = async ({ action, actor_user_id, target_user_id, details }) => {
    await AuditLog.create({
        action,
        actor_user_id,
        target_user_id: target_user_id ?? null,
        details: details || {}
    })
}

exports.changeUserRole = async (targetUserId, actorUserId, newRole) => {
    await ensureAdmin(actorUserId)

    const allowed = ['Admin', 'Manager', 'Agent', 'Driver']
    if (!allowed.includes(newRole)) throw httpError(400, 'Invalid role')

    const target = await User.findOne({ user_id: targetUserId })
    if (!target) throw httpError(404, 'Target user not found')

    target.role = newRole
    await target.save()

    await writeAudit({
        action: 'CHANGE_ROLE',
        actor_user_id: Number(actorUserId),
        target_user_id: Number(targetUserId),
        details: { newRole }
    })

    return target
}

exports.blockUser = async (targetUserId, actorUserId) => {
    await ensureAdmin(actorUserId)

    if (Number(targetUserId) === Number(actorUserId)) {
        throw httpError(400, 'Admin cannot block himself')
    }

    const target = await User.findOne({ user_id: targetUserId })
    if (!target) throw httpError(404, 'Target user not found')

    if (target.isActive === false) return target

    target.isActive = false
    await target.save()

    await writeAudit({
        action: 'BLOCK_USER',
        actor_user_id: Number(actorUserId),
        target_user_id: Number(targetUserId)
    })

    return target
}

exports.unblockUser = async (targetUserId, actorUserId) => {
    await ensureAdmin(actorUserId)

    const target = await User.findOne({ user_id: targetUserId })
    if (!target) throw httpError(404, 'Target user not found')

    if (target.isActive === true) return target

    target.isActive = true
    await target.save()

    await writeAudit({
        action: 'UNBLOCK_USER',
        actor_user_id: Number(actorUserId),
        target_user_id: Number(targetUserId)
    })

    return target
}

exports.getAuditLogs = async (actorUserId, limit = 50) => {
    await ensureAdmin(actorUserId)
    return AuditLog.find({})
        .sort({ created_at: -1 })
        .limit(Number(limit))
        .lean()
}

exports.updateTariffs = async (actorUserId, payload) => {
    await ensureAdmin(actorUserId)

    const setNumber = async (key, value) => {
        const num = Number(value)
        if (!Number.isFinite(num)) throw httpError(400, `Invalid number for ${key}`)

        return SystemSettings.findOneAndUpdate(
            { key },
            { key, valueNumber: num, valueString: null },
            { upsert: true, new: true }
        )
    }

    const updated = []

    if (payload.impactSpeedThreshold !== undefined) {
        updated.push(await setNumber('impactSpeedThreshold', payload.impactSpeedThreshold))
    }

    if (payload.cascoCoeff !== undefined) {
        updated.push(await setNumber('cascoCoeff', payload.cascoCoeff))
    }

    if (payload.oscpvCoeff !== undefined) {
        updated.push(await setNumber('oscpvCoeff', payload.oscpvCoeff))
    }

    await writeAudit({
        action: 'UPDATE_TARIFFS',
        actor_user_id: Number(actorUserId),
        target_user_id: null,
        details: {
            updatedKeys: updated.map(x => x.key)
        }
    })

    return updated
}