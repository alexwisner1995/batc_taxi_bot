const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    
    if (req.method === 'GET') {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return res.json(settings);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
};
