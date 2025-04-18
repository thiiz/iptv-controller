const express = require('express');
const router = express.Router();
const ProviderManager = require('../providers');

module.exports = (providers) => {
    const providerManager = new ProviderManager(providers);

    router.get('/', (req, res) => {
        res.json({
            providers: providerManager.getAvailableProviders()
        });
    });

    router.get('/test/:identifier', async (req, res) => {
        try {
            const { identifier } = req.params;
            const result = await providerManager.testProvider(identifier);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    });

    return router;
}; 