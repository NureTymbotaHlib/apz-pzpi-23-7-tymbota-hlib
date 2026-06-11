const adminService = require('../services/adminService')

exports.changeUserRole = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id)
        const { actor_user_id, role } = req.body

        const user = await adminService.changeUserRole(targetUserId, Number(actor_user_id), role)
        res.json(user)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.blockUser = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id)
        const { actor_user_id } = req.body

        const user = await adminService.blockUser(targetUserId, Number(actor_user_id))
        res.json(user)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.unblockUser = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id)
        const { actor_user_id } = req.body

        const user = await adminService.unblockUser(targetUserId, Number(actor_user_id))
        res.json(user)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.getAuditLogs = async (req, res) => {
    try {
        const actorUserId = Number(req.query.actor_user_id)
        const limit = Number(req.query.limit || 50)

        const logs = await adminService.getAuditLogs(actorUserId, limit)
        res.json(logs)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.updateTariffs = async (req, res) => {
    try {
        const { actor_user_id, impactSpeedThreshold, cascoCoeff, oscpvCoeff } = req.body

        const updated = await adminService.updateTariffs(
            Number(actor_user_id),
            { impactSpeedThreshold, cascoCoeff, oscpvCoeff }
        )

        res.json({ message: 'Tariffs/settings updated', updated })
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}