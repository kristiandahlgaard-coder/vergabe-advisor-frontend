const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// HEALTH CHECK
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// SEED TEST-USERS
app.post('/api/seed-test-users', async (req, res) => {
  try {
    const testUsers = [
      'kristian@example.com',
      'vergabestelle@example.com',
      'finanzen@example.com',
      'recht@example.com',
      'bereichsleitung@example.com',
      'geschaeftsfuehrung@example.com',
      'admin@example.com'
    ];

    const passwordHash = await bcrypt.hash('test123', 12);

    for (const email of testUsers) {
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
    }

    res.json({
      status: 'ok',
      message: `${testUsers.length} Test-User aktualisiert`,
      testUsers
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort erforderlich' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, rolle: user.rolle },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      status: 'ok',
      token,
      user: {
        id: user.id,
        email: user.email,
        rolle: user.rolle
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// MIDDLEWARE: JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Ungültiger Token' });
  }
};

// GET VERGABEN
app.get('/api/vergaben', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, 
              json_agg(json_build_object('user_id', vf.user_id, 'status', vf.status)) as freigaben
       FROM vergaben v
       LEFT JOIN vergabe_freigabenkette vf ON v.id = vf.vergabe_id
       GROUP BY v.id
       ORDER BY v.created_at DESC`
    );

    res.json({
      status: 'ok',
      vergaben: result.rows
    });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE VERGABE
app.get('/api/vergaben/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const vergabeResult = await pool.query('SELECT * FROM vergaben WHERE id = $1', [id]);
    const vergabe = vergabeResult.rows[0];

    if (!vergabe) {
      return res.status(404).json({ error: 'Vergabe nicht gefunden' });
    }

    const freigabenResult = await pool.query(
      'SELECT * FROM vergabe_freigabenkette WHERE vergabe_id = $1 ORDER BY position',
      [id]
    );

    res.json({
      status: 'ok',
      vergabe: {
        ...vergabe,
        freigabenkette: freigabenResult.rows
      }
    });
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST VERGABE
app.post('/api/vergaben', authenticateJWT, async (req, res) => {
  try {
    const { leistungsart, volumen, beschreibung } = req.body;

    const result = await pool.query(
      `INSERT INTO vergaben (leistungsart, volumen, beschreibung, auftraggeber_id, status, created_by)
       VALUES ($1, $2, $3, $4, 'entwurf', $5)
       RETURNING *`,
      [leistungsart, volumen, beschreibung, req.user.userId, req.user.userId]
    );

    res.status(201).json({
      status: 'ok',
      vergabe: result.rows[0]
    });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SUBMIT VERGABE
app.post('/api/vergaben/:id/submit', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE vergaben SET status = $1 WHERE id = $2', ['eingereicht', id]);

    res.json({
      status: 'ok',
      message: 'Vergabe eingereicht'
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// APPROVE
app.post('/api/vergaben/:id/approve/:uid', authenticateJWT, async (req, res) => {
  try {
    const { id, uid } = req.params;

    await pool.query(
      'UPDATE vergabe_freigabenkette SET status = $1 WHERE vergabe_id = $2 AND user_id = $3',
      ['genehmigt', id, uid]
    );

    res.json({
      status: 'ok',
      message: 'Freigegeben'
    });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

// REJECT
app.post('/api/vergaben/:id/reject/:uid', authenticateJWT, async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE vergabe_freigabenkette SET status = $1, notes = $2 WHERE vergabe_id = $3 AND user_id = $4',
      ['abgelehnt', reason || '', id, uid]
    );

    res.json({
      status: 'ok',
      message: 'Abgelehnt'
    });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: err.message });
  }
});

// START
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Verbunden' : 'NICHT VERBUNDEN'}`);
});
