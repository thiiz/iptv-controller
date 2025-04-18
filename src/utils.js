const axios = require('axios');

const loadProviders = () => {
    const providers = {};

    Object.keys(process.env).forEach(key => {
        if (key.startsWith('PROVIDER_') && key.endsWith('_URL')) {
            const providerKey = key.replace('PROVIDER_', '').replace('_URL', '').toLowerCase();
            providers[providerKey] = process.env[key];
        }
    });

    return providers;
};

const formatError = (error) => {
    if (error.response) {
        return {
            error: 'Provider API error',
            status: error.response.status,
            message: error.message
        };
    }

    return {
        error: 'Service unavailable',
        message: error.message
    };
};

module.exports = {
    loadProviders,
    formatError
}; 