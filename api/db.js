// Database module for patterns
const fs = require('fs');
const path = require('path');

const PATTERNS_FILE = path.join(__dirname, 'community-patterns.json');

// Helper function to read patterns from file
function readPatterns() {
    try {
        if (fs.existsSync(PATTERNS_FILE)) {
            const data = fs.readFileSync(PATTERNS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error reading patterns file:', error);
        return [];
    }
}

// Helper function to write patterns to file
function writePatterns(patterns) {
    try {
        fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing patterns file:', error);
        return false;
    }
}

module.exports = {
    getPatterns: () => {
        return readPatterns();
    },
    
    getPattern: (id) => {
        const patterns = readPatterns();
        return patterns.find(pattern => pattern.id === id);
    },
    
    addPattern: (pattern) => {
        const patterns = readPatterns();
        
        const newPattern = {
            id: `comm-${Date.now()}`,
            ...pattern,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        patterns.unshift(newPattern);
        writePatterns(patterns);
        
        return newPattern;
    },
    
    deletePattern: (id) => {
        const patterns = readPatterns();
        const initialLength = patterns.length;
        const filteredPatterns = patterns.filter(pattern => pattern.id !== id);
        
        if (initialLength !== filteredPatterns.length) {
            writePatterns(filteredPatterns);
            return true;
        }
        
        return false;
    }
};
