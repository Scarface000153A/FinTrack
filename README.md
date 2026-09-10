# FinTrack.ai - Modern Personal Finance & Currency Intelligence Platform

A high-performance, commercial-grade Personal Finance SaaS Web Application built with **Python (Flask)**, **SQLite**, **Chart.js**, and **Modern CSS/JS**.

---

## 🌟 Key Capabilities & Architecture

### 1. 🌐 Public SaaS Landing Page (`/`)
- Professional hero showcase with live preview mockup and trust badges.
- 6-feature capability grid detailing real-time conversion, security sandbox, and analytics.
- 3-step onboarding guide and interactive FAQ accordion.
- Smart auto-routing: Guests see the landing page; logged-in users are routed straight to `/dashboard`.

### 2. 💱 Real-Time Currency Intelligence
- Seamless multi-currency engine supporting **INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), AED (AED), CAD (C$), and AUD (A$)**.
- Live foreign exchange rate fetching via Open Exchange API with in-memory 1-hour caching and resilient offline fallback.
- **Dynamic Conversion**: Switch display currency anytime from the top bar — all past transactions, KPI summaries, and charts convert instantly based on current FX rates while preserving the original recorded currency.

### 3. 🛡️ Multi-User Sandbox & Cryptographic Security
- User registration and authentication with cryptographic password hashing (`werkzeug.security`).
- Strict data isolation via relational foreign keys (`user_id`). No user can ever access or view another user's financial records.
- Persistent SQLite database (`finance_tracker.db`) auto-initialized on first run.

### 4. 🌓 OLED Dark & Light Theme Engine
- Instant toggle between sleek Dark Mode and clean Light Mode.
- Zero-flash startup using inline `<head>` theme restoration from `localStorage`.
- Dynamic Chart.js theme synchronization: Gridlines, axes ticks, doughnut borders, and tooltips automatically adapt to the active theme.

### 5. 📱 Progressive Web App (PWA) Setup
- Standalone web app manifest (`manifest.json`) and service worker (`sw.js`).
- 1-click installation to iPhone home screen, Android app drawer, or Windows/macOS desktop without needing an app store.

### 6. 📊 Analytics & 1-Click Data Export
- Visual Doughnut Breakdown for expense categories and Bar Chart for cash flow comparison.
- **Export CSV**: Instant Excel-ready spreadsheet download (`/export/csv`).
- **Export JSON**: Structured, machine-readable backup of user profile and transaction history (`/export/json`).

---

## 🚀 Quick Start Guide

### 1. Run via Double-Click (Zero Terminal Required)
Double-click **`start_silently.vbs`** or **`FinTrack.bat`** in the project directory:
- Starts the backend server silently in the background.
- Automatically opens `http://127.0.0.1:5000` in your default browser.
- To stop the server later, simply double-click **`stop_server.bat`**.

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
python test_app.py
```

---

## ☁️ 1-Click Free Cloud Deployment

This project includes a production WSGI entrypoint (`Procfile` + `gunicorn` + dynamic `$PORT` binding in `app.py`). You can deploy it live on the web for free:

### Option A: Render.com (Recommended - Free)
1. Push this folder to a GitHub repository.
2. Sign in to [Render.com](https://render.com) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `gunicorn app:app`
6. Click **Deploy Web Service** & your live URL will be active in ~1 minute!

### Option B: Railway.app / Heroku
- Deploy directly from GitHub; Railway automatically detects the included `Procfile` and `requirements.txt`.

