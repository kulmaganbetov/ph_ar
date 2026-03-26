import crypto from 'node:crypto';
import { kv } from '@vercel/kv';
import { SignJWT } from 'jose';

const enc = new TextEncoder();

function json(res, code, body) {
  res.status(code).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { action, email, password, name } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!action || !normalizedEmail || !password) return json(res, 400, { error: 'Қажетті өрістер толтырылмаған' });

  try {
    if (action === 'register') {
      const key = `user:${normalizedEmail}`;
      const existing = await kv.get(key);
      if (existing) return json(res, 409, { error: 'Пайдаланушы бар' });

      const user = {
        email: normalizedEmail,
        name: (name || normalizedEmail.split('@')[0]).trim(),
        passwordHash: password,
        createdAt: new Date().toISOString()
      };
      await kv.set(key, user);
      return json(res, 200, { success: true });
    }

    if (action === 'login') {
      const key = `user:${normalizedEmail}`;
      const user = await kv.get(key);
      if (!user || user.passwordHash !== password) return json(res, 401, { error: 'Email немесе құпиясөз қате' });

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
