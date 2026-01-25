import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key for server-side verification
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // For Signal Lite PWA
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || [];
// Remove trailing slash if present to prevent CORS errors
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
// Additional allowed origins from environment (comma-separated)
const EXTRA_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'https://kebule.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  ...EXTRA_ORIGINS
];

const BRAND_MAPPING = process.env.BRAND_MAPPING ? JSON.parse(process.env.BRAND_MAPPING) : {};

// Initialize Supabase client for server-side verification
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// Initialize Google OAuth client for Signal Lite PWA
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// Verify token middleware - supports both Supabase JWT and Google OAuth tokens
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  let user = null;

  try {
    // Try Supabase token first (for Strategy App)
    console.log('Attempting Supabase token verification...');
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);
    
    if (supabaseUser && !supabaseError) {
      console.log('✓ Supabase token verified for:', supabaseUser.email);
      user = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email,
        picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture
      };
    } else {
      // Try Google OAuth token (for Signal Lite PWA)
      console.log('Supabase verification failed, trying Google OAuth...');
      console.log('Using GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
      console.log('Token preview (first 50 chars):', token.substring(0, 50));
      
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        console.log('✓ Google OAuth token verified for:', payload.email);
        user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };
      } catch (googleError) {
        // Fallback: verify via Google's tokeninfo endpoint
        console.log('google-auth-library failed, trying tokeninfo endpoint...', googleError.message);
        const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        
        if (!tokenInfoResponse.ok) {
          throw new Error('Token verification failed via tokeninfo endpoint');
        }
        
        const tokenInfo = await tokenInfoResponse.json();
        console.log('Token info response:', JSON.stringify(tokenInfo, null, 2));
        
        // Verify the audience matches our client ID
        if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
          throw new Error(`Token audience mismatch: expected ${GOOGLE_CLIENT_ID}, got ${tokenInfo.aud}`);
        }
        
        console.log('✓ Google token verified via tokeninfo for:', tokenInfo.email);
        user = {
          id: tokenInfo.sub,
          email: tokenInfo.email,
          name: tokenInfo.name,
          picture: tokenInfo.picture
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const email = user.email;
    const domain = email.split('@')[1];
    console.log('Domain:', domain);
    console.log('Allowed domains:', ALLOWED_DOMAINS);

    // Check if domain is allowed
    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.includes(domain)) {
      console.log('Domain not allowed:', domain);
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Attach user info to request
    req.user = user;

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
    const { title, body } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    // Ensure user profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Failed to upsert profile:', profileError);
    }

    const id = randomUUID();

    const signal = {
      id,
      title,
      body: body || null,
      priority: req.body.priority || null,
      author_id: req.user.id,
      author_name: req.user.name,
      author_email: req.user.email,
      status: 'inbox',
      resolution_note: null,
      project_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store in Supabase
    const { error: insertError } = await supabase
      .from('signals')
      .insert([signal]);

    if (insertError) {
      console.error('Failed to insert signal:', insertError);
      throw insertError;
    }

    console.log('Signal created in Supabase:', id);

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

    // Only allow specific fields to be updated
    const allowedFields = ['title', 'body', 'status', 'priority', 'project_id', 'resolution_note'];
    const filteredUpdates = {};

    for (const field of allowedFields) {
      if (updates.hasOwnProperty(field)) {
        filteredUpdates[field] = updates[field];
      }
    }

    filteredUpdates.updated_at = new Date().toISOString();

    console.log('Filtered updates to apply:', JSON.stringify(filteredUpdates, null, 2));

    const { data, error } = await supabase
      .from('signals')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Signal not found' });
      }
      return res.status(500).json({
        error: 'Failed to update signal',
        details: error.message,
        code: error.code
      });
    }

    console.log('Signal updated in Supabase:', id);
    res.json({
      ok: true,
      signal: data,
      message: 'Signal updated successfully'
    });
  } catch (error) {
    console.error('Error updating signal:', error);
    res.status(500).json({ error: 'Failed to update signal', details: error.message });
  }
});

// GET /signals - Retrieve signals (for main app integration)
app.get('/signals', async (req, res) => {
  try {
    const { limit = 100, offset = 0, authorEmail, status } = req.query;

    let query = supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (authorEmail) {
      query = query.eq('author_email', authorEmail);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: signals, error } = await query;

    if (error) {
      console.error('Error fetching signals from Supabase:', error);
      throw error;
    }

    res.json({ signals: signals || [] });
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

    // Check if signal exists and get author info
    const { data: signal, error: fetchError } = await supabase
      .from('signals')
      .select('author_email')
      .eq('id', id)
      .single();

    if (fetchError || !signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    // Check if user is the author or has admin rights
    if (signal.author_email !== req.user.email) {
      // For now, allow anyone to delete (you can add admin check later)
      console.log('User is not author but allowing delete');
    }

    // Delete the signal
    const { error: deleteError } = await supabase
      .from('signals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting signal:', deleteError);
      throw deleteError;
    }

    console.log('Signal deleted from Supabase:', id);
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

// POST /api/bulk-brands - Bulk create brands directly
app.post('/api/bulk-brands', async (req, res) => {
  try {
    const { brands } = req.body;

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({ error: 'Brands array is required' });
    }

    console.log(`Creating ${brands.length} brands...`);

    const { data, error } = await supabase
      .from('brands')
      .insert(brands)
      .select();

    if (error) {
      console.error('Error creating brands:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    console.log(`Successfully created ${data.length} brands`);
    res.json({ ok: true, brands: data, count: data.length });
  } catch (error) {
    console.error('Error in bulk brands:', error);
    res.status(500).json({ error: 'Failed to create brands' });
  }
});

// POST /api/generate-brands - Generate brand suggestions using Claude API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/api/generate-brands', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const systemPrompt = `You are a brand strategist helping to populate a brand database for a restaurant/hospitality company.
Generate brand entries based on the user's request. The user will specify how many brands they want in their prompt.
Each brand should have:
- name: Brand name (string)
- description: Short description of the brand concept (1-2 sentences)
- vision: The brand's vision/mission statement (1 sentence)
- color: A hex color that represents the brand (e.g., "#E57373")

Respond ONLY with a valid JSON array of brand objects. No other text.
Example: [{"name": "Café Luna", "description": "Cozy neighborhood coffee shop with artisan pastries.", "vision": "Bringing community together one cup at a time.", "color": "#8B4513"}]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return res.status(500).json({ error: 'Failed to generate brands' });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '[]';

    console.log('Claude response:', content.substring(0, 500));

    // Parse the JSON response
    let brands;
    try {
      brands = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          brands = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0].substring(0, 200));
          return res.status(400).json({ error: 'Claude vrátil neplatnou odpověď. Zkuste jednodušší prompt bez URL.' });
        }
      } else {
        console.error('No JSON array found in response');
        return res.status(400).json({ error: 'Claude nemůže procházet webové stránky. Popište značky vlastními slovy.' });
      }
    }

    res.json({ brands });
  } catch (error) {
    console.error('Error generating brands:', error);
    res.status(500).json({ error: 'Failed to generate brands' });
  }
});

// POST /api/fetch-restaurant-address - Use Claude to find restaurant address
app.post('/api/fetch-restaurant-address', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    console.log(`Fetching address for restaurant: ${name}`);

    const systemPrompt = `You are a helpful assistant that finds restaurant addresses in Prague, Czech Republic.
Given a restaurant or brand name, provide the main address if you know it.
If you're not sure or the restaurant doesn't exist, say so.

Respond ONLY with a JSON object in this format:
{"address": "the address", "confidence": "high|medium|low"}

If you don't know the address:
{"address": null, "confidence": "none", "message": "reason why not found"}

Be concise. Only include the street address, no additional information.
Example: {"address": "Dlouhá 33, Praha 1", "confidence": "high"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `What is the address of "${name}" restaurant/brand in Prague?`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return res.status(500).json({ error: 'Failed to fetch address' });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';

    console.log('Claude response for address:', content);

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(400).json({ error: 'Failed to parse response' });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurant address:', error);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Signal Lite backend running on port ${PORT}`);
  console.log(`📊 Database: ${DB_FILE}`);
  console.log(`🔐 Allowed domains: ${ALLOWED_DOMAINS.join(', ') || 'ALL'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});
