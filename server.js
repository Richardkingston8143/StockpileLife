require(‘dotenv’).config();
const express = require(‘express’);
const cors = require(‘cors’);
const Anthropic = require(’@anthropic-ai/sdk’);
const path = require(‘path’);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
origin: process.env.ALLOWED_ORIGIN || ‘*’,
methods: [‘GET’, ‘POST’],
}));

// Serve static frontend
app.use(express.static(path.join(__dirname, ‘public’)));

// ─── Anthropic client ──────────────────────────────────────────────────────────
const anthropic = new Anthropic({
apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Format instructions ───────────────────────────────────────────────────────
const FORMAT_INSTRUCTIONS = {
caption: `Write a single Instagram static post caption. Structure:

1. A powerful first line (the hook — make it curiosity-driven or bold)
1. Main body with natural line breaks, emojis used sparingly and naturally
1. A clear CTA (call to action) at the end
   Max 300 words total.`,

reel: `Write a Reel video script for 20-30 seconds. Structure:

- Timestamp (0:00, 0:04 etc.) | ON-SCREEN TEXT | [Visual direction in brackets]
  Start with a 2-second verbal hook. 4-5 punchy points. End with CTA.
  Be punchy — every second counts.`,
  
  carousel: `Write a carousel post outline with exactly 8 slides: SLIDE 1: [Cover — hook headline] SLIDE 2-7: [Each slide: title + 2-3 bullet points of content] SLIDE 8: [CTA slide] Make slide 1 irresistible. Each slide should leave reader wanting the next.`,
  
  thread: `Write an Instagram Story series of 5 screens: SCREEN 1-5: [Text that appears on screen — max 3 short lines] ACTION: [Poll / Question sticker / Swipe / Tap suggestion for each] Keep text minimal — Stories are visual. Make each screen a cliffhanger.`
  };

const FORMAT_LABELS = {
caption: ‘Static Post Caption’,
reel: ‘Reel Script’,
carousel: ‘Carousel Outline’,
thread: ‘Story Series’
};

// ─── Generate endpoint ─────────────────────────────────────────────────────────
app.post(’/api/generate’, async (req, res) => {
const { format = ‘caption’, topics = [], tone = ‘educational and engaging’, custom = ‘’ } = req.body;

if (!topics.length) {
return res.status(400).json({ error: ‘At least one topic is required.’ });
}

const topicsStr = topics.join(’, ’);
const formatLabel = FORMAT_LABELS[format] || ‘Instagram Post’;

const systemPrompt = `You are an expert investing content creator for Instagram with deep knowledge of financial markets, ETFs, IPOs, and global economics.

You produce content that is:

- Highly educational and engaging for a general audience
- Always current — you MUST search the web for today’s real market data, news, IPOs, and trends
- NEVER financial advice — purely educational and informational
- Written in tone: ${tone}
- Optimised for Instagram engagement (saves, shares, comments)
- Includes emojis where natural, not forced

CRITICAL RULES:

1. Search the web first to find genuinely current information (today’s date is ${new Date().toLocaleDateString(‘en-GB’, { day: ‘numeric’, month: ‘long’, year: ‘numeric’ })})
1. Reference real, specific current events, numbers, or trends you find
1. ALWAYS end with “📌 Educational content only — not financial advice.”
1. Never recommend specific investments or predict price movements

RESPONSE FORMAT — return ONLY valid JSON, no markdown, no backticks:
{
“newsContext”: [“2-3 short current news items you found (max 6 words each)”],
“hook”: “The opening hook line only”,
“body”: “Full post body with \n for line breaks”,
“hashtags”: “#tag1 #tag2 #tag3 (15-20 relevant hashtags)”,
“cta”: “Call to action line”
}`;

const userPrompt = `Create an Instagram ${formatLabel} about: ${topicsStr}. ${custom ? `Additional focus: ${custom}` : ‘’}

Search the web NOW for current information on these topics before writing.
${FORMAT_INSTRUCTIONS[format]}

Return only the JSON object described. No other text.`;

try {
// Stream the response for faster perceived performance
res.setHeader(‘Content-Type’, ‘text/event-stream’);
res.setHeader(‘Cache-Control’, ‘no-cache’);
res.setHeader(‘Connection’, ‘keep-alive’);

```
// Send loading steps as SSE
const steps = [
  'Searching live market data…',
  'Scanning for trending news…',
  'Checking upcoming IPOs…',
  'Analysing global events…',
  'Crafting your content…'
];

let stepIdx = 0;
const stepInterval = setInterval(() => {
  if (stepIdx < steps.length) {
    res.write(`data: ${JSON.stringify({ type: 'step', text: steps[stepIdx++] })}\n\n`);
  }
}, 1200);

// Call Anthropic with web search
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1500,
  system: systemPrompt,
  tools: [{ type: 'web_search_20250305', name: 'web_search' }],
  messages: [{ role: 'user', content: userPrompt }]
});

clearInterval(stepInterval);

// Extract text from content blocks
const textContent = (message.content || [])
  .filter(b => b.type === 'text')
  .map(b => b.text)
  .join('');

// Parse JSON safely
const clean = textContent.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(clean);

res.write(`data: ${JSON.stringify({ type: 'result', data: parsed })}\n\n`);
res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
res.end();
```

} catch (err) {
console.error(‘Generation error:’, err.message);
res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
res.end();
}
});

// ─── Health check ──────────────────────────────────────────────────────────────
app.get(’/api/health’, (req, res) => {
res.json({
status: ‘ok’,
apiKeySet: !!process.env.ANTHROPIC_API_KEY,
timestamp: new Date().toISOString()
});
});

// ─── Fallback to index.html (SPA) ─────────────────────────────────────────────
app.get(’*’, (req, res) => {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
console.log(`\n🚀 InvestIQ running at http://localhost:${PORT}`);
console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing — add to .env'}`);
console.log(`   Press Ctrl+C to stop\n`);
});
