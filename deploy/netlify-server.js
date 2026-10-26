require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const installAuth = require('./authMiddleware');
const { requireLogin } = installAuth;

async function createApp() {
  for (const key of ['MONGO_URI', 'SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH']) {
    if (!process.env[key]) throw new Error(`Missing required setting: ${key}`);
  }
  if (process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  if (!/^\$2[aby]\$\d\d\$.{53}$/.test(process.env.ADMIN_PASSWORD_HASH)) throw new Error('ADMIN_PASSWORD_HASH must be a bcrypt hash');
  // Reuse one MongoDB connection for ledger queries and sessions.
  await mongoose.connect(process.env.MONGO_URI, {
    // Each serverless instance has its own pool; keep cold/idle instances small.
    maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 10000,
    // Fail within the function request budget if Atlas is unreachable.
    serverSelectionTimeoutMS: 5000
  });
  const app = express();
  const production = process.env.NODE_ENV === 'production';
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'same-origin');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  app.get('/healthz', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ ok: mongoose.connection.readyState === 1 }));
  app.use(express.json({ limit: '1mb' }));
  app.use(session({
    name: 'ayan.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient(), dbName: mongoose.connection.name, collectionName: 'app_sessions' }),
    cookie: { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 }
  }));
  installAuth(app, { email: process.env.ADMIN_EMAIL, passwordHash: process.env.ADMIN_PASSWORD_HASH, production });
  app.use('/api', requireLogin, (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api/ledger', require('./routes/ledgerRoutes'));
  app.use('/api/clients', require('./routes/clientRoutes'));
  app.use('/api/company-balance', require('./routes/companyBalanceRoutes'));
  app.use('/api/stock', require('./routes/stockRoutes'));
  app.use('/api/supplier-ledger', require('./routes/supplierLedgerRoutes'));
  app.use('/api/supplier-payments', require('./routes/supplierPaymentRoutes'));
  app.use('/api/cash-sales', require('./routes/cashSaleRoutes'));
  app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));
  app.use((err, req, res, next) => {
    console.error('Request failed:', err.name);
    if (!res.headersSent) res.status(500).json({ error: 'Unable to complete request' });
  });
  return app;
}
module.exports = { createApp };
