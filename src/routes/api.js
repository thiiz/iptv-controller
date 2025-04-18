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

    // Adicionar rota para streaming direto
    router.get('/:identifier/:streamType/:username/:password/:streamId', async (req, res) => {
        try {
            const { identifier, streamType, username, password, streamId } = req.params;

            const providerUrl = providers[identifier.toLowerCase()] || providers.default;

            if (!providerUrl) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            const fullUrl = `${providerUrl}/${streamType}/${username}/${password}/${streamId}`;
            console.log(`Streaming from: ${fullUrl}`);

            // Preparar os cabeçalhos para passar para o provedor
            const headers = {};
            // Copiar cabeçalho de Range se existir (importante para avançar/retroceder o vídeo)
            if (req.headers.range) {
                headers.range = req.headers.range;
                console.log(`Range request: ${req.headers.range}`);
            }

            // Outros cabeçalhos importantes
            if (req.headers['user-agent']) headers['user-agent'] = req.headers['user-agent'];
            if (req.headers['accept']) headers['accept'] = req.headers['accept'];
            if (req.headers['accept-encoding']) headers['accept-encoding'] = req.headers['accept-encoding'];
            if (req.headers['if-modified-since']) headers['if-modified-since'] = req.headers['if-modified-since'];
            if (req.headers['if-none-match']) headers['if-none-match'] = req.headers['if-none-match'];

            const response = await axios({
                method: 'get',
                url: fullUrl,
                responseType: 'stream',
                headers: headers,
                maxRedirects: 5,
                // Aumentar timeout para vídeos grandes
                timeout: 30000
            });

            // Copiar todos os headers da resposta
            const headersToSkip = ['connection', 'transfer-encoding'];
            Object.keys(response.headers).forEach(header => {
                if (!headersToSkip.includes(header.toLowerCase())) {
                    res.setHeader(header, response.headers[header]);
                }
            });

            // Definir o status correto (especialmente para respostas parciais de Range)
            res.status(response.status);

            response.data.pipe(res);
        } catch (error) {
            console.error('Stream request error:', error.message);

            if (error.response) {
                // Enviar o mesmo status que o provedor enviou
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

            // Preparar os cabeçalhos para passar para o provedor
            const headers = {};
            // Copiar cabeçalho de Range se existir (importante para avançar/retroceder o vídeo)
            if (req.headers.range) {
                headers.range = req.headers.range;
                console.log(`Range request: ${req.headers.range}`);
            }

            // Outros cabeçalhos importantes
            if (req.headers['user-agent']) headers['user-agent'] = req.headers['user-agent'];
            if (req.headers['accept']) headers['accept'] = req.headers['accept'];
            if (req.headers['accept-encoding']) headers['accept-encoding'] = req.headers['accept-encoding'];

            const response = await axios({
                method: 'get',
                url: fullUrl,
                responseType: 'stream',
                headers: headers,
                maxRedirects: 5,
                timeout: 30000
            });

            // Copiar todos os headers da resposta
            const headersToSkip = ['connection', 'transfer-encoding'];
            Object.keys(response.headers).forEach(header => {
                if (!headersToSkip.includes(header.toLowerCase())) {
                    res.setHeader(header, response.headers[header]);
                }
            });

            // Definir o status correto (especialmente para respostas parciais de Range)
            res.status(response.status);

            response.data.pipe(res);
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