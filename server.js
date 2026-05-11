require(‘dotenv’).config();
const express = require(‘express’);
const cors = require(‘cors’);
const path = require(‘path’);
const https = require(‘https’);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, ‘public’)));

app.post(’/api/generate’, function(req, res) {
const format = req.body.format || ‘caption’;
const topics = req.body.topics || [];
const tone = req.body.tone || ‘educational’;
const custom = req.body.custom || ‘’;

const formatNames = {
caption: ‘Instagram caption’,
reel: ‘Reel script’,
carousel: ‘carousel outline’,
thread: ‘Story series’
};

const userPrompt = ‘Create an investing ’ + (formatNames[format] || ‘post’) + ’ about: ’ + topics.join(’, ’) + ’. Tone: ’ + tone + ‘. ’ + custom + ’ Search the web for current market news, IPOs, ETF data. Return ONLY valid JSON: {“newsContext”:[“news1”,“news2”],“hook”:“hook line”,“body”:“post body with newlines”,“hashtags”:”#tag1 #tag2”,“cta”:“call to action”}. Never give financial advice. Always add educational disclaimer.’;

const payload = JSON.stringify({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 1000,
system: ‘You are an investing content creator for Instagram. Create educational content only, never financial advice. Always end with a disclaimer. Return only valid JSON, no markdown, no backticks.’,
tools: [{ type: ‘web_search_20250305’, name: ‘web_search’ }],
messages: [{ role: ‘user’, content: userPrompt }]
});

const options = {
hostname: ‘api.anthropic.com’,
path: ‘/v1/messages’,
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’,
‘anthropic-beta’: ‘web-search-2025-03-05’,
‘Content-Length’: Buffer.byteLength(payload)
}
};

res.setHeader(‘Content-Type’, ‘text/event-stream’);
res.setHeader(‘Cache-Control’, ‘no-cache’);
res.setHeader(‘Connection’, ‘keep-alive’);

res.write(’data: ’ + JSON.stringify({ type: ‘step’, text: ‘Searching live market data…’ }) + ‘\n\n’);

const apiReq = https.request(options, function(apiRes) {
let data = ‘’;
apiRes.on(‘data’, function(chunk) { data += chunk; });
apiRes.on(‘end’, function() {
try {
const parsed = JSON.parse(data);
const text = (parsed.content || []).filter(function(b) { return b.type === ‘text’; }).map(function(b) { return b.text; }).join(’’);
const clean = text.replace(/`json|`/g, ‘’).trim();
const result = JSON.parse(clean);
res.write(’data: ’ + JSON.stringify({ type: ‘result’, data: result }) + ‘\n\n’);
res.write(’data: ’ + JSON.stringify({ type: ‘done’ }) + ‘\n\n’);
res.end();
} catch(e) {
res.write(’data: ’ + JSON.stringify({ type: ‘error’, message: e.message }) + ‘\n\n’);
res.end();
}
});
});

apiReq.on(‘error’, function(e) {
res.write(’data: ’ + JSON.stringify({ type: ‘error’, message: e.message }) + ‘\n\n’);
res.end();
});

apiReq.write(payload);
apiReq.end();
});

app.get(’/api/health’, function(req, res) {
res.json({ status: ‘ok’, key: !!process.env.ANTHROPIC_API_KEY });
});

app.get(’*’, function(req, res) {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

app.listen(PORT, function() {
console.log(’StockpileLife running on port ’ + PORT);
});
