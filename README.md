# FinTrack - Personal Finance and Currency Intelligence Platform

A personal finance web application built with Python (Flask), SQLite, Chart.js, and standard CSS and JavaScript.

---

## Key Capabilities and Architecture

### 1. Public Web Portal (`/`)
- Direct hero presentation with clear value proposition and clean UI preview.
- 6-feature capability grid detailing real-time conversion, sandbox data isolation, and visual analytics.
- 3-step onboarding guide and accessible FAQ accordion.
- Smart auto-routing: Guests see the landing page; logged-in users route directly to `/dashboard`.
- Legal compliance pages: Terms of Service (`/terms`) and Privacy Policy (`/privacy`).

### 2. Real-Time Currency Intelligence
- Multi-currency conversion engine supporting INR, USD, EUR, GBP, JPY, AED, CAD, and AUD.
- Live foreign exchange rate retrieval via Exchange Rate API with in-memory 1-hour caching and resilient offline fallback.
- Dynamic Conversion: Switch display currency anytime from the top bar. All past transactions, KPI summaries, and charts convert automatically based on current exchange rates while preserving the original recorded currency.

### 3. Multi-User Sandbox and Security
- User registration and authentication with cryptographic password hashing (`werkzeug.security`).
- Strict data isolation via relational foreign keys (`user_id`). No user can access or view another user's financial records.
- Persistent SQLite database (`finance_tracker.db`) auto-initialized on first run.

### 4. Dark and Light Theme Engine
- Instant toggle between Dark Mode and Light Mode.
- Zero-flash startup using inline theme restoration from `localStorage`.
- Dynamic Chart.js theme synchronization: Gridlines, axes ticks, doughnut borders, and tooltips adapt automatically to the active theme.

### 5. Progressive Web App (PWA) Support
- Standalone web app manifest (`manifest.json`) and service worker (`sw.js`).
- Installation support for iPhone home screen, Android app drawer, and Windows/macOS desktop.

### 6. Analytics and Data Export
- Visual Doughnut Breakdown for expense categories and Bar Chart for cash flow comparison.
- Export CSV: Formatted spreadsheet download (`/export/csv`).
- Export JSON: Structured backup of user profile and transaction history (`/export/json`).

---

## Quick Start Guide

### 1. Run via Double-Click (Zero Terminal Required)
Double-click `start_silently.vbs` or `FinTrack.bat` in the project directory:
- Starts the backend server in the background.
- Automatically opens `http://127.0.0.1:5000` in your default browser.
- To stop the server later, double-click `stop_server.bat`.

### 2. Run via Terminal / PowerShell
```powershell
# Navigate to the project directory
cd C:\Users\User\.gemini\antigravity\scratch\finance_tracker

# Install required dependencies
pip install -r requirements.txt

# Start the application
python run.py
```

### 3. Run Automated Unit Tests
```powershell
python -m unittest test_app.py -v
```

---

## Production Cloud Deployment (Render.com)

FinTrack supports automatic production deployment via `Procfile`, `gunicorn`, and dynamic database engine resolution (PostgreSQL in cloud, SQLite locally).

### Step 1: Deploy Web Service to Render
1. Push this project folder to your GitHub repository.
2. Log in to [Render.com](https://render.com) and click **New + > Web Service**.
3. Select your repository.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `gunicorn app:app`
6. Click **Deploy Web Service**.

---

## Permanent Database Setup on Render (Prevents Account Reset)

On Render's Free tier, the local filesystem is ephemeral and resets whenever the server sleeps after 15 minutes of inactivity. To ensure your user accounts and financial transactions are saved permanently forever, connect a free PostgreSQL database:

### Option A: Render Free PostgreSQL (Recommended)
1. On your Render dashboard, click **New + > PostgreSQL**.
2. Name it `fintrack-db` and select the Free tier.
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g. `postgres://fintrack:pass@dpg-xxx:5432/fintrack`).
5. Open your FinTrack Web Service on Render, navigate to **Environment**, and add an Environment Variable:
   - **Key**: `DATABASE_URL`
   - **Value**: *(paste your Internal Database URL)*
6. Click **Save Changes**. Render will automatically redeploy and initialize your schema in PostgreSQL. Your accounts and transactions will now be saved permanently!

### Option B: Supabase or Neon (Alternative Free PostgreSQL)
1. Create a free project at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the connection string (URI).
3. In your Render Web Service **Environment**, set `DATABASE_URL` to that URI.

---

## Custom Domain Setup (.com / Custom Domain)

To run FinTrack on your own custom domain (e.g., `www.yourcompany.com` or `app.yourdomain.com`), follow these standard DNS mapping steps:

### Step 1: Configure Host Provider Custom Domain
In your Render dashboard:
1. Navigate to your Web Service **Settings** > **Custom Domains**.
2. Enter your domain name (e.g., `app.yourdomain.com` or `yourdomain.com`).
3. Render will display the required DNS target records.

### Step 2: Add DNS Records in Domain Registrar
Open your DNS management zone in your registrar (Namecheap, Cloudflare, GoDaddy, etc.) and add:

#### For Subdomains (e.g., `app.yourdomain.com`):
| Record Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| CNAME | `app` | `<your-app-id>.onrender.com` | Automatic / 300s |

#### For Apex / Root Domains (e.g., `yourdomain.com`):
| Record Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| ANAME / ALIAS (or A) | `@` | `<provided-host-ip-or-target>` | Automatic / 300s |
| CNAME | `www` | `<your-app-id>.onrender.com` | Automatic / 300s |

Render automatically provisions and renews a free Let's Encrypt SSL/TLS certificate once DNS propagation completes.