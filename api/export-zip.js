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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (clientKey !== API_SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { blobs } = await list({ token: BLOB_READ_WRITE_TOKEN });

    // ✅ EXACT LOGIC FROM YOUR MAIN APP
    let category = (req.query.category || 'image/ai').trim();

    // If someone passes 'uploads/image/ai/', strip the 'uploads/' prefix
    if (category.startsWith('uploads/')) {
      category = category.replace(/^uploads\//, '');
    }

    // Remove any leading/trailing slashes just in case
    category = category.replace(/^\/+|\/+$/g, '');

    // Construct the final filter EXACTLY like helper.filterBlobs does:
    const finalFilter = `uploads/${category}/`;
    
    const filteredBlobs = blobs.filter(blob => blob.pathname.startsWith(finalFilter));

    // Safety: Prevent downloading everything if root uploads is selected
    if (!finalFilter.startsWith('uploads/') || finalFilter === 'uploads/') {
      return res.status(400).json({ error: 'Invalid category. Cannot download root.' });
    }

    if (filteredBlobs.length === 0) {
      return res.status(404).json({ error: `No blobs found in ${finalFilter}` });
    }

    const zip = new JSZip();

    for (const blob of filteredBlobs) {
      const response = await fetch(blob.url);
      if (!response.ok) continue;

      const imageBuffer = await response.arrayBuffer();
      const filename = blob.pathname.split('/').pop();
      const ext = filename.slice(filename.lastIndexOf('.'));
      const base = filename.slice(0, filename.lastIndexOf('.'));
      const parts = base.split('-');
      if (parts.length > 1 && /^[A-Za-z0-9]{24}$/.test(parts[parts.length - 1])) {
        parts.pop();
      }
      zip.file(parts.join('-') + ext, imageBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.status(200).send(zipBuffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Failed to export ZIP' });
  }
}
