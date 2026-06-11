const policyService = require('../services/policyService');

exports.createPolicy = async (req, res) => {
    try {
        const policy = await policyService.createPolicy(req.body);
        res.status(201).json(policy);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};