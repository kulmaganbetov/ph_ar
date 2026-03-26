import crypto from 'node:crypto';
import { SignJWT } from 'jose';

const enc = new TextEncoder();

function json(res, code, body) {
  res.status(code).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Redis env vars not configured');
  return { url, token };
}

async function redisCommand(command, ...args) {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command, ...args])
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis error: ${text}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

function stablePasswordHash(password) {
  const alreadyHashed = /^[a-f0-9]{64}$/i.test(password);
  if (alreadyHashed) return password.toLowerCase();
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function getUser(email) {
  const raw = await redisCommand('GET', `user:${email}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

async function setUser(email, user) {
  await redisCommand('SET', `user:${email}`, JSON.stringify(user));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { action, email, password, name } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!action || !normalizedEmail || !password) {
    return json(res, 400, { error: 'Қажетті өрістер толтырылмаған' });
  }

  try {
    if (action === 'register') {
      const existing = await getUser(normalizedEmail);
      if (existing) return json(res, 409, { error: 'Пайдаланушы бар' });

      const user = {
        email: normalizedEmail,
        name: (name || normalizedEmail.split('@')[0]).trim(),
        passwordHash: stablePasswordHash(password),
        createdAt: new Date().toISOString()
      };

      await setUser(normalizedEmail, user);
      return json(res, 200, { success: true });
    }

    if (action === 'login') {
      const user = await getUser(normalizedEmail);
      const inputHash = stablePasswordHash(password);
      if (!user || user.passwordHash !== inputHash) {
        return json(res, 401, { error: 'Email немесе құпиясөз қате' });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) return json(res, 500, { error: 'JWT_SECRET бапталмаған' });

      const token = await new SignJWT({ email: user.email, name: user.name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(enc.encode(secret));

      return json(res, 200, { token, user: { email: user.email, name: user.name } });
    }

    return json(res, 400, { error: 'Белгісіз action' });
  } catch (error) {
    const digest = crypto.createHash('sha1').update(String(error)).digest('hex').slice(0, 8);
    return json(res, 500, { error: `Ішкі қате (${digest})` });
  }
}
