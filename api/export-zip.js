import { list } from '@vercel/blob';
import JSZip from 'jszip';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // ✅ CORS headers (allows your standalone HTML to call it)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Authentication (Uses the same API key logic)
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (clientKey !== API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // ✅ List all blobs using the Vercel SDK
    const { blobs } = await list({ token: BLOB_READ_WRITE_TOKEN });

    // ✅ Filter for AI images only
    const aiBlobs = blobs.filter(b => b.pathname.startsWith('uploads/image/ai/'));

    if (aiBlobs.length === 0) {
      return res.status(404).json({ error: 'No AI blobs found' });
    }

    const zip = new JSZip();

    // ✅ Download each image and add to ZIP
    for (const blob of aiBlobs) {
      const response = await fetch(blob.url);
      if (!response.ok) continue; // Skip failed downloads

      const imageBuffer = await response.arrayBuffer();

      // ✅ Remove random suffix (24-char alphanumeric)
      const filename = blob.pathname.split('/').pop();
      const ext = filename.slice(filename.lastIndexOf('.'));
      const base = filename.slice(0, filename.lastIndexOf('.'));
      const parts = base.split('-');
      if (parts.length > 1 && /^[A-Za-z0-9]{24}$/.test(parts[parts.length - 1])) {
        parts.pop();
      }
      const cleanName = parts.join('-') + ext;

      zip.file(cleanName, imageBuffer);
    }

    // ✅ Generate ZIP and send
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-images.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.status(200).send(zipBuffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Failed to export ZIP' });
  }
}
