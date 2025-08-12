// API endpoint for submitting a new pattern
const db = require('./db');

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const { name, pattern, description, author, tags } = req.body;
            
            // Validate required fields
            if (!name || !pattern || !description || !tags) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const newPattern = db.addPattern({
                name,
                pattern,
                description,
                author: author || 'Anonymous',
                tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())
            });
            
            return res.status(201).json(newPattern);
        } catch (error) {
            console.error('Error adding pattern:', error);
            return res.status(500).json({ error: 'Failed to add pattern' });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
