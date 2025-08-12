// API endpoint for getting a single pattern by ID
const db = require('./db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ error: 'Pattern ID is required' });
        }
        
    const pattern = await db.getPattern(id);
        
        if (!pattern) {
            return res.status(404).json({ error: 'Pattern not found' });
        }
        
    return res.status(200).json(pattern);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
