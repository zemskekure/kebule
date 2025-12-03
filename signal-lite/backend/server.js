import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';

dotenv.config();

const app = express();

// Middleware to log ALL requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Configured FRONTEND_URL:', FRONTEND_URL);
  next();
});

// Ensure PORT is always a valid number
let PORT = parseInt(process.env.PORT);
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error('Invalid PORT environment variable. Using default 3001');
  PORT = 3001;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || [];
// Remove trailing slash if present to prevent CORS errors
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
// Add Strategy App URL to allowed origins
const STRATEGY_APP_URL = 'https://kebule.onrender.com';
const ALLOWED_ORIGINS = [FRONTEND_URL, STRATEGY_APP_URL, 'http://localhost:5173', 'http://localhost:5174'];

const BRAND_MAPPING = process.env.BRAND_MAPPING ? JSON.parse(process.env.BRAND_MAPPING) : {};

// Initialize Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// JSON file storage
const DB_FILE = 'signals.json';

function loadDB() {
  if (!existsSync(DB_FILE)) {
    return { signals: [], users: {} };
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Verify Google ID token middleware
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    console.log('Verifying token...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const domain = email.split('@')[1];
    console.log('Token verified for:', email);
    console.log('Domain:', domain);
    console.log('Allowed domains:', ALLOWED_DOMAINS);

    // Check if domain is allowed
    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.includes(domain)) {
      console.log('Domain not allowed:', domain);
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Attach user info to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    // Update or create user in JSON DB
    const db = loadDB();
    const brandIds = BRAND_MAPPING[email] || [];
    db.users[req.user.id] = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      brandIds,
      lastSeen: new Date().toISOString()
    };
    saveDB(db);

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /signals - Create a new signal
app.post('/signals', verifyToken, async (req, res) => {
  try {
    console.log('Creating signal:', req.body);
    const { title, body, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Missing required fields: title, date' });
    }

    const id = randomUUID();
    const authorBrandIds = BRAND_MAPPING[req.user.email] || [];

    const signal = {
      id,
      title,
      body: body || null,
      date,
      source: 'restaurant',
      authorId: req.user.id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorBrandIds,
      createdAt: new Date().toISOString()
    };

    const db = loadDB();
    db.signals.push(signal);
    saveDB(db);

    console.log('Signal created:', id);

    // Send webhook to Strategy App (if configured)
    const STRATEGY_APP_WEBHOOK = process.env.STRATEGY_APP_WEBHOOK;
    if (STRATEGY_APP_WEBHOOK) {
      try {
        await fetch(STRATEGY_APP_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signal)
        });
        console.log('Webhook sent to Strategy App');
      } catch (err) {
        console.error('Webhook failed:', err);
        // Don't fail the request if webhook fails
      }
    }

    res.json({ 
      ok: true, 
      signalId: id,
      message: 'Signal created successfully' 
    });
  } catch (error) {
    console.error('Error creating signal:', error);
    res.status(500).json({ error: 'Failed to create signal' });
  }
});

// GET /signals - Retrieve signals (for main app integration)
app.get('/signals', (req, res) => {
  try {
    const { limit = 100, offset = 0, authorEmail } = req.query;
    
    const db = loadDB();
    let signals = db.signals;

    if (authorEmail) {
      signals = signals.filter(s => s.authorEmail === authorEmail);
    }

    signals.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const paginatedSignals = signals.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.json({ signals: paginatedSignals });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Signal Lite backend running on port ${PORT}`);
  console.log(`📊 Database: ${DB_FILE}`);
  console.log(`🔐 Allowed domains: ${ALLOWED_DOMAINS.join(', ') || 'ALL'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});
