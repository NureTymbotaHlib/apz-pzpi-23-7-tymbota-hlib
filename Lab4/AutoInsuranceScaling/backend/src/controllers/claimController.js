const claimService = require('../services/claimService')

exports.createClaim = async (req, res) => {
    try {
        const claim = await claimService.createClaim(req.body)
        res.status(201).json(claim)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.registerClaim = async (req, res) => {
    try {
        const claimId = Number(req.params.id)
        const { manager_user_id } = req.body

        const claim = await claimService.registerClaim(claimId, Number(manager_user_id))
        res.json(claim)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.decideClaim = async (req, res) => {
    try {
        const claimId = Number(req.params.id)
        const { manager_user_id, decision, approved_payout } = req.body

        const claim = await claimService.decideClaim(
            claimId,
            Number(manager_user_id),
            decision,
            approved_payout
        )

        res.json(claim)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

exports.payClaim = async (req, res) => {
    try {
        const claimId = Number(req.params.id)
        const { manager_user_id } = req.body

        const claim = await claimService.payClaim(claimId, Number(manager_user_id))
        res.json(claim)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}