import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store signals in memory (or use a database)
const SIGNALS_FILE = 'signals-received.json';

function loadSignals() {
  if (!existsSync(SIGNALS_FILE)) {
    return [];
  }
  return JSON.parse(readFileSync(SIGNALS_FILE, 'utf8'));
}

function saveSignals(signals) {
  writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2));
}

// Webhook endpoint - receives signals from Signal Lite
app.post('/api/signals/webhook', (req, res) => {
  try {
    const signal = req.body;
    console.log('Received signal:', signal);
    
    const signals = loadSignals();
    signals.push(signal);
    saveSignals(signals);
    
    res.json({ ok: true, message: 'Signal received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process signal' });
  }
});

// Get all signals
app.get('/api/signals', (req, res) => {
  const signals = loadSignals();
  res.json({ signals });
});

// Serve static frontend
app.use(express.static('dist'));

app.listen(PORT, () => {
  console.log(`Strategy App backend running on port ${PORT}`);
});
