import express from 'express';
import cors from 'cors';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createApiRouter } from './api/routes.js';
import { getDatabase } from './core/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Broadcast helper to all connected UI clients
function wsBroadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Smart Organizer Engine Ready' }));
});

// Initialize SQLite database
getDatabase();

// Mount API routes
app.use('/api', createApiRouter(wsBroadcast));

// Serve static frontend in production if built
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  UNIVERSAL SMART FILE ORGANIZER ENGINE ACTIVE`);
  console.log(`  Local API & WebSocket: http://localhost:${PORT}`);
  console.log(`  Mode: Local-first, Privacy-focused, Zero Cloud Telemetry`);
  console.log(`======================================================\n`);
});
