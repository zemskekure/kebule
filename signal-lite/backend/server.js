import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key for server-side verification
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || [];
// Remove trailing slash if present to prevent CORS errors
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
// Add Strategy App URL to allowed origins
const STRATEGY_APP_URL = 'https://kebule.onrender.com';
const ALLOWED_ORIGINS = [FRONTEND_URL, STRATEGY_APP_URL, 'http://localhost:5173', 'http://localhost:5174'];

const BRAND_MAPPING = process.env.BRAND_MAPPING ? JSON.parse(process.env.BRAND_MAPPING) : {};

// Initialize Supabase client for server-side verification
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

// Verify Supabase JWT token middleware
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    console.log('Verifying Supabase token...');
    
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Token verification failed:', error?.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const email = user.email;
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
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
      picture: user.user_metadata?.avatar_url || user.user_metadata?.picture
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
      source: req.body.source || 'restaurant',
      authorId: req.user.id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorBrandIds,
      restaurantIds: req.body.restaurantIds || [],
      priority: req.body.priority || null,
      status: 'inbox',
      projectId: null,
      themeIds: [],
      influenceIds: [],
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

// PATCH /signals/:id - Update a signal (for Strategy App triage)
app.patch('/signals/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating signal:', id, updates);

    const db = loadDB();
    const signalIndex = db.signals.findIndex(s => s.id === id);
    
    if (signalIndex === -1) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    // Only allow specific fields to be updated
    const allowedFields = ['status', 'projectId', 'themeIds', 'influenceIds', 'restaurantIds', 'priority', 'body'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates.hasOwnProperty(field)) {
        filteredUpdates[field] = updates[field];
      }
    }

    db.signals[signalIndex] = {
      ...db.signals[signalIndex],
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    };
    
    saveDB(db);

    console.log('Signal updated:', id);
    res.json({ 
      ok: true, 
      signal: db.signals[signalIndex],
      message: 'Signal updated successfully' 
    });
  } catch (error) {
    console.error('Error updating signal:', error);
    res.status(500).json({ error: 'Failed to update signal' });
  }
});

// GET /signals - Retrieve signals (for main app integration)
app.get('/signals', (req, res) => {
  try {
    const { limit = 100, offset = 0, authorEmail, status } = req.query;
    
    const db = loadDB();
    let signals = db.signals;

    if (authorEmail) {
      signals = signals.filter(s => s.authorEmail === authorEmail);
    }

    if (status) {
      signals = signals.filter(s => s.status === status);
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

// DELETE /signals/:id - Delete a signal
app.delete('/signals/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting signal:', id, 'by user:', req.user.email);

    const db = loadDB();
    const signalIndex = db.signals.findIndex(s => s.id === id);
    
    if (signalIndex === -1) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    // Check if user is the author or has admin rights
    const signal = db.signals[signalIndex];
    if (signal.authorEmail !== req.user.email) {
      // For now, allow anyone to delete (you can add admin check later)
      console.log('User is not author but allowing delete');
    }

    // Remove the signal
    db.signals.splice(signalIndex, 1);
    saveDB(db);

    console.log('Signal deleted:', id);
    res.json({ 
      ok: true, 
      message: 'Signal deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting signal:', error);
    res.status(500).json({ error: 'Failed to delete signal' });
  }
});

// GET /restaurants - Retrieve restaurant list for dropdown
app.get('/restaurants', verifyToken, (req, res) => {
  try {
    const userBrandIds = BRAND_MAPPING[req.user.email] || [];
    
    // Hardcoded restaurant list based on Ambiente brands
    const allRestaurants = [
      // Lokál
      { id: 'l1', brandId: 'b1', name: 'Lokál Dlouhááá', brand: 'Lokál' },
      { id: 'l2', brandId: 'b1', name: 'Lokál U Bílé kuželky', brand: 'Lokál' },
      { id: 'l3', brandId: 'b1', name: 'Lokál Hamburk', brand: 'Lokál' },
      { id: 'l4', brandId: 'b1', name: 'Lokál Nad Stromovkou', brand: 'Lokál' },
      { id: 'l5', brandId: 'b1', name: 'Lokál U Zavadilů', brand: 'Lokál' },
      { id: 'l6', brandId: 'b1', name: 'Lokál Korunní', brand: 'Lokál' },
      { id: 'l7', brandId: 'b1', name: 'Lokál U Jiráta', brand: 'Lokál' },
      // Brasileiro
      { id: 'l8', brandId: 'b4', name: 'Brasileiro Slovanský dům', brand: 'Brasileiro' },
      { id: 'l9', brandId: 'b4', name: 'Brasileiro U Zelené žáby', brand: 'Brasileiro' },
      // Eska
      { id: 'l10', brandId: 'b2', name: 'Eska Karlín', brand: 'Eska' },
      { id: 'l24', brandId: 'b2', name: 'Eska Letná', brand: 'Eska' },
      // Others
      { id: 'l11', brandId: 'b21', name: 'Štangl', brand: 'Štangl' },
      { id: 'l12', brandId: 'b3', name: 'Café Savoy', brand: 'Café Savoy' },
      { id: 'l13', brandId: 'b5', name: 'Čestr', brand: 'Čestr' },
      { id: 'l14', brandId: 'b13', name: 'Kuchyň', brand: 'Kuchyň' },
      { id: 'l15', brandId: 'b14', name: 'La Degustation', brand: 'La Degustation' },
      { id: 'l16', brandId: 'b12', name: 'Kantýna', brand: 'Kantýna' },
      { id: 'l17', brandId: 'b16', name: 'Naše maso', brand: 'Naše maso' },
      { id: 'l18', brandId: 'b17', name: 'Pasta Fresca', brand: 'Pasta Fresca' },
      { id: 'l19', brandId: 'b18', name: 'Pastacaffé Vodičkova', brand: 'Pastacaffé' },
      { id: 'l20', brandId: 'b18', name: 'Pastacaffé Vězeňská', brand: 'Pastacaffé' },
      { id: 'l21', brandId: 'b19', name: 'Pizza Nuova', brand: 'Pizza Nuova' },
      { id: 'l22', brandId: 'b10', name: 'Myšák Vodičkova', brand: 'Cukrárna Myšák' },
      { id: 'l25', brandId: 'b10', name: 'Myšák Holešovice', brand: 'Cukrárna Myšák' },
      { id: 'l23', brandId: 'b22', name: 'U Kalendů', brand: 'U Kalendů' },
    ];

    // Filter by user's brands if mapping exists
    let restaurants = allRestaurants;
    if (userBrandIds.length > 0) {
      restaurants = allRestaurants.filter(r => userBrandIds.includes(r.brandId));
    }

    res.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Signal Lite backend running on port ${PORT}`);
  console.log(`📊 Database: ${DB_FILE}`);
  console.log(`🔐 Allowed domains: ${ALLOWED_DOMAINS.join(', ') || 'ALL'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});
