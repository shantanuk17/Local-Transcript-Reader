import { fromPath } from 'pdf2pic'; 
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import fetch from 'node-fetch';
import { createServer } from 'http';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/granite', upload.single('file'), async (req, res) => {
  const filePath = req.file?.path;
  const originalName = req.file?.originalname;
  if (!filePath) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(originalName).toLowerCase();
  const isPDF = ext === '.pdf';
  let imageBuffers = [];

  try {
    if (isPDF) {
      const options = { density: 100, format: 'png', width: 1200, height: 1600 };
      const convert = fromPath(path.resolve(filePath), options);
      for (let i = 1; i <= 5; i++) { 
        const pageData = await convert(i, { responseType: 'base64' });
        if (!pageData || !pageData.base64) break;  
        imageBuffers.push(pageData.base64);
      }
    } else {
      const buffer = fs.readFileSync(filePath);
      imageBuffers = [ buffer.toString('base64') ];
    }

    const prompt = `You are a transcript parser. From the following images of a transcript, extract JSON only with:
{
  "courses": [
    { "code": "...", "name": "...", "credits": "...", "grade": "...", "semester": "..." }
  ],
  "GPA": "..."
}
Respond ONLY with valid JSON.`;

    const graniteRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'granite3.2-vision:2b',
        prompt,
        images: imageBuffers,
        stream: false
      })
    });

    const graniteData = await graniteRes.json();
    if (!graniteData.response) {
      return res.status(400).json({ error: 'No response from Granite model.' });
    }

    let cleaned = graniteData.response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/"credits"\s*:\s*NP/g, '"credits": "NP"')
      .replace(/"GPA"\s*:\s*N\/A/g, '"GPA": "N/A"')
      .trim();

    const parsed = JSON.parse(cleaned);

    const gpaValues = parsed.courses
      .map(c => parseFloat(c.GPA))
      .filter(n => !isNaN(n));

    const avgGPA = gpaValues.length
      ? (gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length).toFixed(2)
      : null;

    res.json({
      courses: parsed.courses,
      GPA: avgGPA ?? parsed.GPA ?? null
    });

  } catch (err) {
    console.error('Granite Error:', err.message);
    res.status(500).json({ error: 'Failed to process file with Granite.' });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

const server = createServer(app);
server.listen(3001, () => console.log('Server running on http://localhost:3001'));
