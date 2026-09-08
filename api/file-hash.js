import { IncomingForm } from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();
  
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

    // Stream the file into the crypto hash (prevents server memory overload)
    const hash = crypto.createHash('md5'); // or 'sha256'

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(file.filepath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const md5Hash = hash.digest('hex');

    // Optional: Return file metadata so you can check duplicates by name/date too
    return res.status(200).json({ 
      hash: md5Hash,
      filename: file.originalFilename,
      size: file.size
    });

  } catch (error) {
    console.error('Error hashing file:', error);
    return res.status(500).json({ error: error.message });
  }
}
