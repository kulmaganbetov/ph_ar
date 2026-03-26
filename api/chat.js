import { jwtVerify } from 'jose';
import OpenAI from 'openai';

const enc = new TextEncoder();

function json(res, code, body) {
  res.status(code).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function verifyAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new Error('Токен жоқ');
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET жоқ');
  await jwtVerify(token, enc.encode(secret));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    await verifyAuth(req);
  } catch {
    return json(res, 401, { error: 'Рұқсат жоқ' });
  }

  const { message, history } = req.body || {};
  if (!message) return json(res, 400, { error: 'Хабарлама бос' });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Сен физика пәнінің AI көмекшісісің. Қазақ тілінде жауап бер. Формулаларды LaTeX емес, қарапайым мәтінде жаз.' },
        ...Array.isArray(history) ? history.slice(-10) : [],
        { role: 'user', content: message }
      ],
      temperature: 0.4
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'Жауап табылмады';
    return json(res, 200, { reply });
  } catch {
    return json(res, 500, { error: 'AI қызметі қолжетімсіз' });
  }
}
