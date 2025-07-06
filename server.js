import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/llm', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Transcript text is empty.' });
  }

  const prompt = `You are a transcript parser. Given the text of an academic transcript, respond with valid JSON only. The JSON must contain two fields:
1. "courses": an array of objects with { code, name, credits, grade, semester }
2. "GPA": a number

Here is the transcript text:

${text}

Respond with only valid JSON. Do not explain. Do not wrap in markdown.`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    console.log("JSON response:", data);

    if (!data || !data.response) {
      console.error("No response from LLM:", data);
      return res.status(400).json({ error: "No valid response from model." });
    }

    let output = data.response.trim();
    console.log('Raw LLM output:\n', output);

    const match = output.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('No valid JSON object found in model output.');
      return res.status(400).json({ error: 'Model response did not include valid JSON.' });
    }

    try {
      const parsed = JSON.parse(match[0]);
      res.json(parsed);
    } catch (e) {
      console.error('Failed to parse extracted JSON:', e.message);
      return res.status(400).json({ error: 'Failed to parse JSON from model output.' });
    }

  } catch (e) {
    console.error('Server error during LLM processing:', e.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const server = createServer(app);
server.listen(3001, () => console.log('Server running on http://localhost:3001'));