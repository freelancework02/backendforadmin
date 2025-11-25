// Controller/authController.js
const pool = require('../Db/index');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ---------------------------------------------------
// Helper to send a login cookie
// ---------------------------------------------------
function createSession(res, user, remember = false) {
  const token = crypto.randomBytes(32).toString('hex');
  const maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days / 1 day

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge
  });

  return token;
}

// ---------------------------------------------------
// REGISTER
// POST /api/auth/register
// ---------------------------------------------------
exports.register = async (req, res) => {
  const { name, email, password, remember } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email and password are required.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create user
      const [r] = await conn.query(
        `INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)`,
        [name.trim(), email.trim().toLowerCase(), hashed]
      );

      const userId = r.insertId;

      // Create remember token or session token
      const sessionToken = createSession(res, userId, remember);

      // Save token
      await conn.query(
        `UPDATE users SET remember_token = ? WHERE id = ?`,
        [sessionToken, userId]
      );

      await conn.commit();
      return res.json({ ok: true, id: userId });

    } catch (err) {
      await conn.rollback();
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email is already registered.' });
      }
      throw err;
    } finally {
      conn.release();
    }

  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ---------------------------------------------------
// LOGIN
// POST /api/auth/login
// ---------------------------------------------------
exports.login = async (req, res) => {
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const conn = await pool.getConnection();
    let user;
    try {
      const [rows] = await conn.query(
        `SELECT id, full_name, email, password_hash FROM users WHERE email = ? LIMIT 1`,
        [email.trim().toLowerCase()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      user = rows[0];

      // Compare hashed password
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Create session cookie
      const sessionToken = createSession(res, user.id, remember);

      // Save token in DB
      await conn.query(
        `UPDATE users SET remember_token = ?, last_login_at = NOW() WHERE id = ?`,
        [sessionToken, user.id]
      );

    } finally {
      conn.release();
    }

    return res.json({ ok: true, id: user.id, name: user.full_name });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ---------------------------------------------------
// LOGOUT
// POST /api/auth/logout
// ---------------------------------------------------
exports.logout = async (req, res) => {
  try {
    res.clearCookie('auth_token');
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
