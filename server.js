# InvestIQ — AI Investing Content Generator

An AI-powered Instagram content generator for the investing niche. Uses Claude AI with live web search to produce current, educational content about markets, ETFs, IPOs, and global economic events.

---

## Features

- 4 post formats: Static post, Reel script, Carousel outline, Story series
- 8 topic chips: Market news, IPOs, ETFs, World events, Beginners, Compounding, Psychology, Dividends
- Live web search — every post uses real, current market data
- Full ETF education guide built in
- Generation history saved per session
- One-click copy for all content
- Legal disclaimer on every post
- Deploy to Railway or Render in under 5 minutes (free tier available)

---

## Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
```bash
cp .env.example .env
```
Open `.env` and replace `your_api_key_here` with your real key from:
👉 https://console.anthropic.com/api-keys

### 3. Run it
```bash
npm start
```

Open http://localhost:3000 in your browser. Done.

---

## Deploy to Railway (Recommended — Free Tier)

Railway gives you a live URL your audience can use. Free tier is plenty for personal use.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial InvestIQ deploy"
```
Create a new repo at github.com and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/investiq.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to https://railway.app and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Select your `investiq` repo
4. Railway auto-detects Node.js and builds it

### Step 3 — Add your API key
1. In Railway dashboard, click your project → **Variables**
2. Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com
3. Railway auto-restarts your app

### Step 4 — Get your live URL
Railway gives you a URL like `investiq-production.up.railway.app`
Put this in your Instagram bio via Linktree!

---

## Deploy to Render (Alternative Free Option)

1. Push to GitHub (same as Step 1 above)
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable: `ANTHROPIC_API_KEY`
7. Click **Create Web Service**

Free tier spins down after inactivity (30 second cold start). Railway stays warm.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your key from console.anthropic.com |
| `PORT` | No | Port to run on (auto-set by Railway/Render) |
| `ALLOWED_ORIGIN` | No | Restrict CORS to your domain e.g. `https://yourdomain.com` |

---

## Cost Estimate

Each content generation uses approximately 800–1,500 tokens.
At Claude Sonnet pricing (~$3/million input tokens):
- 100 generations/day ≈ $0.10–0.20/day
- Well within free trial credits to start

---

## Legal

All generated content includes an educational disclaimer. This tool does not provide financial advice. You are responsible for reviewing content before publishing.

---

## Stack

- **Backend**: Node.js + Express
- **AI**: Claude claude-sonnet-4-20250514 with web search tool
- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)
- **Deploy**: Railway or Render
