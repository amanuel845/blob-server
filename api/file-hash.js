import { IncomingForm } from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ CRITICAL FIX: CORS headers (without these, the browser gives Error 0)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({
    maxFileSize: 50 * 1024 * 1024, // 50MB limit to prevent crashes
  });

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const hash = crypto.createHash('md5');

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(file.filepath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const md5Hash = hash.digest('hex');

    return res.status(200).json({ hash: md5Hash });

  } catch (error) {
    console.error('Error hashing file:', error);
    return res.status(500).json({ error: error.message });
  }
}
