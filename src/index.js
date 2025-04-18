require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { loadProviders } = require('./utils');
const apiRoutes = require('./routes/api');
const providerRoutes = require('./routes/providers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const providers = loadProviders();

app.get('/', (req, res) => {
    res.json({
        message: 'IPTV Controller API is running',
        providers: Object.keys(providers)
    });
});

app.use('/api', apiRoutes(providers));
app.use('/providers', providerRoutes(providers));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Available providers: ${Object.keys(providers).join(', ')}`);
}); 