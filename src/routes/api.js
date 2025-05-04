const express = require('express');
const axios = require('axios');
const { formatError } = require('../utils');
const sessionManager = require('../session');

const router = express.Router();

module.exports = (providers) => {
    router.get('/:identifier/:endpoint', async (req, res) => {
        try {
            const { identifier, endpoint } = req.params;
            const { username, password, ...otherParams } = req.query;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const providerUrl = providers[identifier.toLowerCase()] || providers.default;

            if (!providerUrl) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            let apiEndpoint = '';

            switch (endpoint) {
                case 'player_api':
                    apiEndpoint = '/player_api.php';
                    break;
                case 'xmltv':
                    apiEndpoint = '/xmltv.php';
                    break;
                case 'login':
                    apiEndpoint = '/player_api.php';
                    break;
                default:
                    apiEndpoint = `/${endpoint}`;
            }

            const queryParams = new URLSearchParams({
                username,
                password,
                ...otherParams
            }).toString();

            const fullUrl = `${providerUrl}${apiEndpoint}?${queryParams}`;

            const response = await axios.get(fullUrl);

            // Create session for successful login
            if (endpoint === 'player_api' || endpoint === 'login') {
                if (response.data && !response.data.error) {
                    const sessionId = sessionManager.createSession(username, identifier.toLowerCase());
                    res.setHeader('X-Session-ID', sessionId);
                }
            }

            res.json(response.data);
        } catch (error) {
            console.error('API request error:', error.message);

            if (error.response) {
                return res.status(error.response.status).json(formatError(error));
            }

            res.status(500).json({ error: 'Failed to fetch data from provider' });
        }
    });

    // Modificar a rota para streaming direto usando redirecionamento
    router.get('/:identifier/:streamType/:username/:password/:streamId', async (req, res) => {
        try {
            const { identifier, streamType, username, password, streamId } = req.params;

            const providerUrl = providers[identifier.toLowerCase()] || providers.default;

            if (!providerUrl) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            const fullUrl = `${providerUrl}/${streamType}/${username}/${password}/${streamId}`;
            console.log(`Redirecting to: ${fullUrl}`);

            // Redirecionamento em vez de streaming por proxy
            return res.redirect(fullUrl);

        } catch (error) {
            console.error('Stream request error:', error.message);

            if (error.response) {
                return res.status(error.response.status).json(formatError(error));
            }

            res.status(500).json(formatError(error));
        }
    });

    router.get('/:identifier/stream/:streamType/:streamId', async (req, res) => {
        try {
            const { identifier, streamType, streamId } = req.params;
            const { username, password } = req.query;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const providerUrl = providers[identifier.toLowerCase()] || providers.default;

            if (!providerUrl) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            const fullUrl = `${providerUrl}/${streamType}/${username}/${password}/${streamId}`;
            console.log(`Redirecting to: ${fullUrl}`);

            // Redirecionamento em vez de streaming por proxy
            return res.redirect(fullUrl);

        } catch (error) {
            console.error('Stream request error:', error.message);
            res.status(500).json(formatError(error));
        }
    });

    router.get('/sessions', (req, res) => {
        const sessions = sessionManager.getActiveSessions()
            .map(session => ({
                username: session.username,
                providerId: session.providerId,
                createdAt: new Date(session.createdAt).toISOString(),
                lastAccess: new Date(session.lastAccess).toISOString()
            }));

        res.json({ sessions });
    });

    return router;
};