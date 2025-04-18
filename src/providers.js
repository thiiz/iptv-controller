const axios = require('axios');

class ProviderManager {
    constructor(providers) {
        this.providers = providers;
    }

    getProviderUrl(identifier) {
        const providerKey = identifier.toLowerCase();
        return this.providers[providerKey] || this.providers.default;
    }

    async testProvider(identifier) {
        const providerUrl = this.getProviderUrl(identifier);

        if (!providerUrl) {
            throw new Error('Provider not found');
        }

        try {
            const response = await axios.get(providerUrl, { timeout: 5000 });
            return {
                status: response.status,
                available: true,
                url: providerUrl
            };
        } catch (error) {
            return {
                status: error.response?.status || 500,
                available: false,
                error: error.message,
                url: providerUrl
            };
        }
    }

    getAvailableProviders() {
        return Object.keys(this.providers);
    }
}

module.exports = ProviderManager; 