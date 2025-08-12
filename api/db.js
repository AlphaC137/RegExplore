// Database module for patterns with Supabase (preferred), Vercel KV (secondary), and filesystem fallback
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

// ------------- Supabase helpers -------------
let supaClientPromise = null;
async function getSupabaseClient() {
    if (supaClientPromise) return supaClientPromise;
    try {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
        if (!url || !key) return null;
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(url, key, { auth: { persistSession: false } });
        supaClientPromise = Promise.resolve(client);
        return client;
    } catch (e) {
        console.error('Supabase client init failed:', e.message || e);
        return null;
    }
}

async function supaGetPatterns() {
    const supa = await getSupabaseClient();
    if (!supa) return null;
    const { data, error } = await supa
        .from('patterns')
        .select('*')
        .order('createdAt', { ascending: false });
    if (error) {
        console.error('Supabase select error:', error.message || error);
        return [];
    }
    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        pattern: row.pattern,
        description: row.description,
        author: row.author,
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? row.tags : []),
        createdAt: row.createdAt
    }));
}

async function supaGetPattern(id) {
    const supa = await getSupabaseClient();
    if (!supa) return null;
    const { data, error } = await supa
        .from('patterns')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
    if (error) {
        console.error('Supabase get error:', error.message || error);
        return null;
    }
    if (!data) return null;
    return {
        id: data.id,
        name: data.name,
        pattern: data.pattern,
        description: data.description,
        author: data.author,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags : []),
        createdAt: data.createdAt
    };
}

async function supaAddPattern(pattern) {
    const supa = await getSupabaseClient();
    if (!supa) return null;
    const newPattern = {
        id: `comm-${Date.now()}`,
        ...pattern,
        tags: Array.isArray(pattern.tags) ? pattern.tags : (pattern.tags ? [pattern.tags] : []),
        createdAt: new Date().toISOString().split('T')[0]
    };
    const { data, error } = await supa.from('patterns').insert(newPattern).select('*').maybeSingle();
    if (error) {
        console.error('Supabase insert error:', error.message || error);
        return null;
    }
    return data || newPattern;
}

async function supaDeletePattern(id) {
    const supa = await getSupabaseClient();
    if (!supa) return false;
    const { error } = await supa.from('patterns').delete().eq('id', id);
    if (error) {
        console.error('Supabase delete error:', error.message || error);
        return false;
    }
    return true;
}

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
        // Prefer Supabase
        const supa = await getSupabaseClient();
        if (supa) return supaGetPatterns();
        // Else KV
        if (hasKV) return kvGetPatterns();
        return readPatternsFile();
    },
    getPattern: async (id) => {
        const supa = await getSupabaseClient();
        if (supa) return supaGetPattern(id);
        if (hasKV) return kvGetPattern(id);
        const patterns = readPatternsFile();
        return patterns.find(p => p.id === id) || null;
    },
    addPattern: async (pattern) => {
        const supa = await getSupabaseClient();
        if (supa) {
            const added = await supaAddPattern(pattern);
            if (added) return added;
        }
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
        const supa = await getSupabaseClient();
        if (supa) return supaDeletePattern(id);
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
