// Database module for patterns with Vercel KV (preferred) and filesystem fallback
const fs = require('fs');
const path = require('path');

let kv = null;
try {
    // Proper CommonJS usage per latest @vercel/kv docs
    ({ kv } = require('@vercel/kv'));
} catch (_) {
    // @vercel/kv not installed or not available in local context
}

const hasKV = !!kv;

const PATTERNS_FILE = process.env.PATTERNS_DATA_FILE
  ? path.resolve(__dirname, process.env.PATTERNS_DATA_FILE)
  : path.join(__dirname, 'community-patterns.json');

// ------------- Filesystem fallback helpers -------------
function readPatternsFile() {
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

function writePatternsFile(patterns) {
    try {
        fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing patterns file:', error);
        return false;
    }
}

// ------------- KV helpers -------------
async function kvListIds() {
    // Newest first
    try {
        const ids = await kv.zrange('patterns:index', 0, -1, { rev: true });
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        console.error('KV zrange error:', e);
        return [];
    }
}

async function kvGetPattern(id) {
    const raw = await kv.get(`patterns:${id}`);
    return raw ? JSON.parse(raw) : null;
}

async function kvGetPatterns() {
    const ids = await kvListIds();
    if (!ids.length) return [];
    try {
        const keys = ids.map(id => `patterns:${id}`);
        // mget returns array of raw values in same order
        const values = await kv.mget(keys);
        return values
            .map(v => (v ? JSON.parse(v) : null))
            .filter(Boolean);
    } catch (e) {
        console.error('KV mget error:', e);
        // Fallback: fetch sequentially
        const results = [];
        for (const id of ids) {
            const p = await kvGetPattern(id);
            if (p) results.push(p);
        }
        return results;
    }
}

async function kvAddPattern(pattern) {
    const id = pattern.id || `comm-${Date.now()}`;
    const newPattern = {
        id,
        ...pattern,
        createdAt: new Date().toISOString().split('T')[0]
    };
    await kv.set(`patterns:${id}`, JSON.stringify(newPattern));
    await kv.zadd('patterns:index', { score: Date.now(), member: id });
    return newPattern;
}

async function kvDeletePattern(id) {
    await kv.del(`patterns:${id}`);
    if (kv.zrem) {
        await kv.zrem('patterns:index', id);
    } else {
        // If zrem not available in env, rebuild index (best-effort)
        const ids = await kvListIds();
        const remaining = ids.filter(x => x !== id);
        // Clear and rebuild
        if (kv.del) await kv.del('patterns:index');
        const now = Date.now();
        for (let i = 0; i < remaining.length; i++) {
            await kv.zadd('patterns:index', { score: now - i, member: remaining[i] });
        }
    }
    return true;
}

module.exports = {
    getPatterns: async () => {
        if (hasKV) return kvGetPatterns();
        return readPatternsFile();
    },
    getPattern: async (id) => {
        if (hasKV) return kvGetPattern(id);
        const patterns = readPatternsFile();
        return patterns.find(p => p.id === id) || null;
    },
    addPattern: async (pattern) => {
        if (hasKV) return kvAddPattern(pattern);
        const patterns = readPatternsFile();
        const newPattern = {
            id: `comm-${Date.now()}`,
            ...pattern,
            createdAt: new Date().toISOString().split('T')[0]
        };
        patterns.unshift(newPattern);
        writePatternsFile(patterns);
        return newPattern;
    },
    deletePattern: async (id) => {
        if (hasKV) return kvDeletePattern(id);
        const patterns = readPatternsFile();
        const initialLength = patterns.length;
        const filtered = patterns.filter(p => p.id !== id);
        if (initialLength !== filtered.length) {
            writePatternsFile(filtered);
            return true;
        }
        return false;
    }
};
