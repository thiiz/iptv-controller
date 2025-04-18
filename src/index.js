require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { loadProviders } = require('./utils');
const apiRoutes = require('./routes/api');
const providerRoutes = require('./routes/providers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aumentar o limite de timeout para streaming
app.use((req, res, next) => {
    // Aumentar o timeout para 10 minutos para streaming
    req.setTimeout(600000);
    next();
});

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

// Carregar providers do .env
const providers = loadProviders();

app.get('/', (req, res) => {
    res.json({
        message: 'IPTV Controller API is running',
        providers: Object.keys(providers)
    });
});

app.use('/api', apiRoutes(providers));
app.use('/providers', providerRoutes(providers));

// Handler para erro 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Handler para erros
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Vercel usa o export do módulo para serverless
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Available providers: ${Object.keys(providers).join(', ')}`);
    });
}

// Exportar para Vercel
module.exports = app; 