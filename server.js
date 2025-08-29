import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

// Sabit kullanıcılar (plaintext -> açılışta hash).
const PLAIN_USERS = [
  { id: 1, username: 'danielyldrm', password: 'dani1' },
  { id: 2, username: 'mustafa',     password: 'mustafa1' }
];

const USERS = PLAIN_USERS.map(u => ({
  id: u.id,
  username: u.username,
  passwordHash: bcrypt.hashSync(u.password, 10)
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPromise = initDb();

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Yetkisiz' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token geçersiz' });
  }
}

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Geçersiz bilgiler' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Geçersiz bilgiler' });
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

// Hafta verisi
app.get('/api/week', auth, async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all(
    'SELECT day_index, data_json FROM workout_days WHERE username = ? ORDER BY day_index',
    [req.user.username]
  );
  const week = Array(7).fill(null).map((_, i) => {
    const row = rows.find(r => r.day_index === i);
    return row ? JSON.parse(row.data_json) : { dayIndex: i, exercises: [] };
  });
  res.json({ week });
});

// Gün kaydet
app.put('/api/day/:dayIndex', auth, async (req, res) => {
  const dayIndex = parseInt(req.params.dayIndex, 10);
  if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    return res.status(400).json({ error: 'dayIndex 0-6 olmalı' });
  }
  const { exercises } = req.body;
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'exercises dizi olmalı' });
  }
  const payload = { dayIndex, exercises };
  const db = await dbPromise;
  await db.run(`
    INSERT INTO workout_days (username, day_index, data_json)
    VALUES (?, ?, ?)
    ON CONFLICT(username, day_index)
    DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
  `, [req.user.username, dayIndex, JSON.stringify(payload)]);
  res.json({ message: 'Gün kaydedildi', day: payload });
});

// Tüm haftayı toplu kaydet (isteğe bağlı)
app.put('/api/week', auth, async (req, res) => {
  const { week } = req.body;
  if (!Array.isArray(week) || week.length !== 7) {
    return res.status(400).json({ error: 'week 7 elemanlı olmalı' });
  }
  const db = await dbPromise;
  await db.run('BEGIN');
  try {
    for (const day of week) {
      if (typeof day.dayIndex !== 'number' || day.dayIndex < 0 || day.dayIndex > 6) {
        throw new Error('Geçersiz dayIndex');
      }
      const json = JSON.stringify({ dayIndex: day.dayIndex, exercises: day.exercises || [] });
      await db.run(`
        INSERT INTO workout_days (username, day_index, data_json)
        VALUES (?, ?, ?)
        ON CONFLICT(username, day_index)
        DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
      `, [req.user.username, day.dayIndex, json]);
    }
    await db.run('COMMIT');
    res.json({ message: 'Hafta güncellendi' });
  } catch (e) {
    await db.run('ROLLBACK');
    res.status(400).json({ error: e.message });
  }
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Sunucu çalışıyor: http://localhost:' + PORT);
  console.log('Kullanıcılar:');
  PLAIN_USERS.forEach(u => console.log(`  ${u.username} / ${u.password}`));
});