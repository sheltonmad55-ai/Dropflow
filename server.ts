/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Ensure JSON parser handles bodies
app.use(express.json({ limit: '10mb' }));

// Helper to initialize server database if it doesn't exist
function initServerDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialSchema = {
      users: [],         // { id, email, password }
      profiles: [],      // { id, nome, pais, moeda, plano, trial_expires_at, criado_em, anuncios_percent, lucro_percent }
      caixinhas: [],
      vendas: [],
      despesas: [],
      produtos: [],
      fornecedores: [],
      zonas_entrega: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2));
  }
}

// Helper to read database
function readDB() {
  initServerDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading server database, resetting:', err);
    return {
      users: [],
      profiles: [],
      caixinhas: [],
      vendas: [],
      despesas: [],
      produtos: [],
      fornecedores: [],
      zonas_entrega: []
    };
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing server database:', err);
  }
}

// Basic Token Generator/Validator
function generateToken(userId: string) {
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64');
}

function validateToken(token: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (decoded.exp > Date.now()) {
      return decoded.userId;
    }
  } catch (e) {
    // invalid token
  }
  return null;
}

// Middleware to extract user auth
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nenhuma credencial fornecida.' });
  }

  const token = authHeader.split('Bearer ')[1];
  const userId = validateToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Sessão expirada. Por favor, faça login novamente.' });
  }

  (req as any).userId = userId;
  next();
};

// ================= API ENDPOINTS =================

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, nome, pais, moeda } = req.body;

  if (!email || !password || !nome) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Este e-mail já está registado.' });
  }

  const userId = crypto.randomUUID();
  const newUser = { id: userId, email: email.toLowerCase(), password }; // in real app, hash password
  
  // Calculate trial expiry (7 days from now)
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 7);

  const profile = {
    id: userId,
    nome,
    pais: pais || 'Moçambique',
    moeda: moeda || 'MT',
    plano: 'trial',
    trial_expires_at: trialExpiry.toISOString(),
    anuncios_percent: 50,
    lucro_percent: 50,
    criado_em: new Date().toISOString()
  };

  // Create default Pockets (Caixinhas)
  const defaultCaixinhas = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: 'Lucro',
      icone: 'TrendingUp',
      cor: 'bg-emerald-500',
      tipo: 'lucro',
      saldo_atual: 0,
      criado_em: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: 'Anúncios',
      icone: 'Megaphone',
      cor: 'bg-sky-500',
      tipo: 'anuncios',
      saldo_atual: 0,
      criado_em: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: 'Produtos/Fornecedores',
      icone: 'Package',
      cor: 'bg-amber-500',
      tipo: 'fornecedores',
      saldo_atual: 0,
      criado_em: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: 'Delivery',
      icone: 'Truck',
      cor: 'bg-indigo-500',
      tipo: 'delivery',
      saldo_atual: 0,
      criado_em: new Date().toISOString()
    }
  ];

  db.users.push(newUser);
  db.profiles.push(profile);
  db.caixinhas.push(...defaultCaixinhas);

  writeDB(db);

  const token = generateToken(userId);
  res.json({ token, profile, caixinhas: defaultCaixinhas });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são necessários.' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Credenciais inválidas.' });
  }

  const profile = db.profiles.find((p: any) => p.id === user.id);
  const userCaixinhas = db.caixinhas.filter((c: any) => c.user_id === user.id);

  const token = generateToken(user.id);
  res.json({ token, profile, caixinhas: userCaixinhas });
});

// Auth: Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const userId = (req as any).userId;
  const db = readDB();
  const profile = db.profiles.find((p: any) => p.id === userId);
  if (!profile) {
    return res.status(404).json({ error: 'Perfil não encontrado.' });
  }
  res.json({ profile });
});

// Sync: Push and Pull Endpoint (bi-directional sync)
app.post('/api/sync', requireAuth, (req, res) => {
  const userId = (req as any).userId;
  const { queue } = req.body; // Array of SyncQueueItem
  
  const db = readDB();

  // Process any incoming sync queue changes from client
  if (Array.isArray(queue) && queue.length > 0) {
    queue.forEach((item: any) => {
      const { type, action, data } = item;
      if (!data) return;

      // Enforce security: data user_id must match authenticated userId (except profiles where user id is 'id')
      if (type === 'profile') {
        if (data.id !== userId) return;
      } else {
        if (data.user_id !== userId) return;
      }

      const tableKey = type === 'zona' ? 'zonas_entrega' : `${type}s`;
      if (!db[tableKey]) return;

      if (action === 'create' || action === 'update') {
        const idx = db[tableKey].findIndex((x: any) => x.id === data.id);
        if (idx > -1) {
          // Last write wins (merge update)
          db[tableKey][idx] = { ...db[tableKey][idx], ...data };
        } else {
          db[tableKey].push(data);
        }
      } else if (action === 'delete') {
        db[tableKey] = db[tableKey].filter((x: any) => x.id !== data.id);
      }
    });

    writeDB(db);
  }

  // Pull latest values from server
  const serverProfile = db.profiles.find((p: any) => p.id === userId);
  const serverCaixinhas = db.caixinhas.filter((c: any) => c.user_id === userId);
  const serverVendas = db.vendas.filter((v: any) => v.user_id === userId);
  const serverDespesas = db.despesas.filter((d: any) => d.user_id === userId);
  const serverProdutos = db.produtos.filter((p: any) => p.user_id === userId);
  const serverFornecedores = db.fornecedores.filter((f: any) => f.user_id === userId);
  const serverZonasEntrega = db.zonas_entrega.filter((z: any) => z.user_id === userId);

  res.json({
    success: true,
    data: {
      profile: serverProfile,
      caixinhas: serverCaixinhas,
      vendas: serverVendas,
      despesas: serverDespesas,
      produtos: serverProdutos,
      fornecedores: serverFornecedores,
      zonas_entrega: serverZonasEntrega
    }
  });
});

// ================= VITE CLIENT INTEGRATION =================

async function startServer() {
  initServerDB();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DropFlow server running on http://localhost:${PORT}`);
  });
}

startServer();
