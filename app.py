"""
FinTrack - Personal Finance & Currency Intelligence Platform
A multi-user personal finance tracker with real-time currency conversion,
data isolation, dark mode, CSV/JSON export, and PWA capabilities.
"""

import os
import io
import csv
import json
import urllib.request
import time
from datetime import datetime, date, timedelta
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, 
    url_for, flash, session, jsonify, Response
)
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fintrack_super_secret_production_key_2026")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
if os.environ.get("RENDER") or os.environ.get("DYNO"):
    app.config['SESSION_COOKIE_SECURE'] = True

# Initialize database schema on startup
init_db()

# ----------------- CURRENCY ENGINE & LIVE EXCHANGE RATES ----------------- #

CURRENCIES = {
    "INR": {"symbol": "₹", "name": "Indian Rupee"},
    "USD": {"symbol": "$", "name": "US Dollar"},
    "EUR": {"symbol": "€", "name": "Euro"},
    "GBP": {"symbol": "£", "name": "British Pound"},
    "JPY": {"symbol": "¥", "name": "Japanese Yen"},
    "AED": {"symbol": "AED", "name": "UAE Dirham"},
    "CAD": {"symbol": "C$", "name": "Canadian Dollar"},
    "AUD": {"symbol": "A$", "name": "Australian Dollar"}
}

# Currency symbol to code reverse lookup
SYMBOL_TO_CODE = {
    "₹": "INR",
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "AED": "AED",
    "AED ": "AED",
    "C$": "CAD",
    "A$": "AUD"
}

# Fallback exchange rates against USD (base = USD)
FALLBACK_RATES = {
    "USD": 1.0,
    "INR": 83.50,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 155.20,
    "AED": 3.67,
    "CAD": 1.36,
    "AUD": 1.51
}

# Rate Cache (1-hour cache duration)
RATES_CACHE = {
    "rates": FALLBACK_RATES,
    "last_updated": 0
}

def get_currency_symbol(code):
    """Returns the visual symbol for a currency code."""
    return CURRENCIES.get(code, {}).get("symbol", code)

def normalize_currency_code(curr_str):
    """Converts either a symbol or a code into a 3-letter currency code (e.g. '$' -> 'USD')."""
    if not curr_str:
        return "INR"
    curr_str = curr_str.strip()
    if curr_str in CURRENCIES:
        return curr_str
    if curr_str in SYMBOL_TO_CODE:
        return SYMBOL_TO_CODE[curr_str]
    return "INR"

def get_exchange_rates():
    """Fetches live exchange rates against USD, with 1-hour caching and fallback."""
    global RATES_CACHE
    current_time = time.time()
    
    # Return cached rates if fresh (within 3600 seconds)
    if current_time - RATES_CACHE["last_updated"] < 3600 and RATES_CACHE["rates"]:
        return RATES_CACHE["rates"]
        
    try:
        # Free open exchange rate endpoint (Base USD)
        req = urllib.request.Request(
            "https://open.er-api.com/v6/latest/USD",
            headers={"User-Agent": "FinTrack-App"}
        )
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data.get("result") == "success" and "rates" in data:
                    rates = data["rates"]
                    RATES_CACHE["rates"] = {
                        code: float(rates.get(code, FALLBACK_RATES.get(code, 1.0)))
                        for code in CURRENCIES.keys()
                    }
                    RATES_CACHE["rates"]["USD"] = 1.0
                    RATES_CACHE["last_updated"] = current_time
                    return RATES_CACHE["rates"]
    except Exception as e:
        print(f"[Warning] Could not fetch live exchange rates: {e}. Using fallback rates.")

    return RATES_CACHE["rates"] if RATES_CACHE["rates"] else FALLBACK_RATES

def convert_amount(amount, from_currency, to_currency):
    """Converts an amount from one currency to another using current exchange rates."""
    if amount is None or amount == 0:
        return 0.0

    from_code = normalize_currency_code(from_currency)
    to_code = normalize_currency_code(to_currency)

    if from_code == to_code:
        return round(float(amount), 2)

    rates = get_exchange_rates()
    from_rate = rates.get(from_code, FALLBACK_RATES.get(from_code, 1.0))
    to_rate = rates.get(to_code, FALLBACK_RATES.get(to_code, 1.0))

    # Convert from_code -> USD -> to_code
    amount_in_usd = float(amount) / from_rate
    converted = amount_in_usd * to_rate
    return round(converted, 2)

# ----------------- AUTHENTICATION HELPERS ----------------- #

def login_required(f):
    """Decorator to require login for protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM users WHERE id = ?", (session["user_id"],))
                if not cursor.fetchone():
                    session.clear()
                    flash("Your session has expired or the database was refreshed. Please log in again.", "info")
                    return redirect(url_for("login"))
        except Exception:
            session.clear()
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

# Context processor to inject user details and currencies into all templates
@app.context_processor
def inject_user():
    if "user_id" in session:
        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, username, full_name, currency FROM users WHERE id = ?",
                    (session["user_id"],)
                )
                user = cursor.fetchone()
            if not user:
                session.clear()
                return {"current_user": None, "available_currencies": CURRENCIES}

            curr_code = normalize_currency_code(user["currency"])
            return {
                "current_user": {
                    "id": user["id"],
                    "username": user["username"],
                    "full_name": user["full_name"],
                    "currency_code": curr_code,
                    "currency": get_currency_symbol(curr_code),
                    "currency_symbol": get_currency_symbol(curr_code)
                },
                "available_currencies": CURRENCIES
            }
        except Exception:
            session.clear()
            return {"current_user": None, "available_currencies": CURRENCIES}
    return {"current_user": None, "available_currencies": CURRENCIES}

# ----------------- PUBLIC & AUTHENTICATION ROUTES ----------------- #

@app.route("/")
def index():
    """Public Landing Page for guests, or redirect to Dashboard if already logged in."""
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return render_template("landing.html")

@app.route("/terms")
def terms():
    """Terms and Conditions page."""
    return render_template("terms.html")

@app.route("/privacy")
def privacy():
    """Privacy Policy page."""
    return render_template("privacy.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
        
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        username = request.form.get("username", "").strip().lower()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")
        currency = normalize_currency_code(request.form.get("currency", "INR"))

        # Validation
        if not full_name or not username or not email or not password:
            flash("All fields are required!", "danger")
            return render_template("register.html", full_name=full_name, username=username, email=email)

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html", full_name=full_name, username=username, email=email)

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html", full_name=full_name, username=username, email=email)

        password_hash = generate_password_hash(password)

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO users (username, email, full_name, password_hash, currency)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (username, email, full_name, password_hash, currency)
                )
                conn.commit()
                cursor.execute(
                    "SELECT id, username, full_name, currency FROM users WHERE username = ?",
                    (username,)
                )
                new_user = cursor.fetchone()

            session.clear()
            session.permanent = True
            session["user_id"] = new_user["id"]
            session["username"] = new_user["username"]
            session["full_name"] = new_user["full_name"]
            session["currency"] = normalize_currency_code(new_user["currency"])

            flash(f"Welcome to FinTrack, {new_user['full_name']}! Your account has been created.", "success")
            return redirect(url_for("dashboard"))
        except Exception as e:
            if "UNIQUE constraint failed: users.username" in str(e) or "unique constraint" in str(e).lower():
                flash("Username is already taken. Please choose another.", "danger")
            elif "UNIQUE constraint failed: users.email" in str(e) or "unique constraint" in str(e).lower():
                flash("An account with this email already exists.", "danger")
            else:
                flash("An error occurred during registration. Please try again.", "danger")
            return render_template("register.html", full_name=full_name, username=username, email=email)

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username_or_email = request.form.get("username_or_email", "").strip().lower()
        password = request.form.get("password", "")

        if not username_or_email or not password:
            flash("Please provide your username/email and password.", "danger")
            return render_template("login.html")

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, username, email, full_name, password_hash, currency 
                FROM users 
                WHERE username = ? OR email = ?
                """,
                (username_or_email, username_or_email)
            )
            user = cursor.fetchone()

        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session.permanent = True
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["full_name"] = user["full_name"]
            session["currency"] = normalize_currency_code(user["currency"])

            flash(f"Welcome back, {user['full_name']}!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid username/email or password.", "danger")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been successfully logged out.", "info")
    return redirect(url_for("index"))

# ----------------- DASHBOARD & CORE FINANCE ----------------- #

@app.route("/dashboard")
@login_required
def dashboard():
    user_id = session["user_id"]
    active_currency = normalize_currency_code(session.get("currency", "INR"))
    
    # Filter params
    filter_type = request.args.get("type", "all")
    filter_category = request.args.get("category", "all")

    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Fetch all raw transactions for calculations and display
        cursor.execute(
            """
            SELECT id, type, amount, currency, category, description, date, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY date DESC, created_at DESC
            """,
            (user_id,)
        )
        all_raw_transactions = cursor.fetchall()

        # 2. Get distinct categories for the user filter dropdown
        cursor.execute(
            "SELECT DISTINCT category FROM transactions WHERE user_id = ? ORDER BY category",
            (user_id,)
        )
        available_categories = [row["category"] for row in cursor.fetchall()]

    # Real-time currency conversion for summary KPIs
    total_income = 0.0
    total_expense = 0.0
    expense_by_category_dict = {}

    converted_transactions = []

    for t in all_raw_transactions:
        t_type = t["type"]
        raw_amt = float(t["amount"])
        raw_curr = normalize_currency_code(t["currency"] if "currency" in t.keys() and t["currency"] else active_currency)
        category = t["category"]

        # Convert to active display currency
        converted_amt = convert_amount(raw_amt, raw_curr, active_currency)

        if t_type == "income":
            total_income += converted_amt
        else:
            total_expense += converted_amt
            expense_by_category_dict[category] = expense_by_category_dict.get(category, 0.0) + converted_amt

        # Apply user filter for the display table
        matches_type = (filter_type == "all" or t_type == filter_type)
        matches_cat = (filter_category == "all" or category == filter_category)

        if matches_type and matches_cat:
            converted_transactions.append({
                "id": t["id"],
                "type": t["type"],
                "amount": converted_amt,
                "original_amount": raw_amt,
                "original_currency": raw_curr,
                "original_symbol": get_currency_symbol(raw_curr),
                "is_converted": (raw_curr != active_currency),
                "category": t["category"],
                "description": t["description"],
                "date": t["date"],
                "created_at": t["created_at"]
            })

    balance = total_income - total_expense
    savings_rate = round((balance / total_income * 100), 1) if total_income > 0 and balance > 0 else 0.0

    # Format expense breakdown for template preview
    expense_by_category = [
        {"category": cat, "total": round(amt, 2)}
        for cat, amt in sorted(expense_by_category_dict.items(), key=lambda x: x[1], reverse=True)
    ]

    return render_template(
        "dashboard.html",
        transactions=converted_transactions,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        balance=round(balance, 2),
        savings_rate=savings_rate,
        expense_by_category=expense_by_category,
        available_categories=available_categories,
        filter_type=filter_type,
        filter_category=filter_category,
        today_date=date.today().isoformat()
    )

@app.route("/transactions/add", methods=["POST"])
@login_required
def add_transaction():
    user_id = session["user_id"]
    t_type = request.form.get("type", "").strip().lower()
    amount = request.form.get("amount", "").strip()
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    t_date = request.form.get("date", "").strip()
    active_currency = normalize_currency_code(session.get("currency", "INR"))

    if not t_type or not amount or not category or not t_date:
        flash("Amount, category, and date are required.", "danger")
        return redirect(url_for("dashboard"))

    try:
        amount_val = float(amount)
        if amount_val <= 0:
            flash("Amount must be greater than zero.", "danger")
            return redirect(url_for("dashboard"))
    except ValueError:
        flash("Invalid amount format.", "danger")
        return redirect(url_for("dashboard"))

    if t_type not in ["income", "expense"]:
        flash("Invalid transaction type.", "danger")
        return redirect(url_for("dashboard"))

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO transactions (user_id, type, amount, currency, category, description, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, t_type, amount_val, active_currency, category, description, t_date)
        )
        conn.commit()

    flash(f"Successfully recorded {t_type} of {get_currency_symbol(active_currency)}{amount_val:.2f}!", "success")
    return redirect(url_for("dashboard"))

@app.route("/transactions/delete/<int:transaction_id>", methods=["POST"])
@login_required
def delete_transaction(transaction_id):
    user_id = session["user_id"]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM transactions WHERE id = ? AND user_id = ?",
            (transaction_id, user_id)
        )
        conn.commit()

    flash("Transaction deleted successfully.", "info")
    return redirect(url_for("dashboard"))

# ----------------- USER PROFILE & DATA EXPORT ----------------- #

@app.route("/profile/update", methods=["POST"])
@login_required
def update_profile():
    user_id = session["user_id"]
    full_name = request.form.get("full_name", "").strip()
    new_password = request.form.get("new_password", "").strip()

    if not full_name:
        flash("Full name cannot be empty.", "danger")
        return redirect(url_for("dashboard"))

    with get_db() as conn:
        cursor = conn.cursor()
        if new_password:
            if len(new_password) < 6:
                flash("New password must be at least 6 characters.", "danger")
                return redirect(url_for("dashboard"))
            pwd_hash = generate_password_hash(new_password)
            cursor.execute(
                "UPDATE users SET full_name = ?, password_hash = ? WHERE id = ?",
                (full_name, pwd_hash, user_id)
            )
        else:
            cursor.execute(
                "UPDATE users SET full_name = ? WHERE id = ?",
                (full_name, user_id)
            )
        conn.commit()

    session["full_name"] = full_name
    flash("Profile settings updated successfully!", "success")
    return redirect(url_for("dashboard"))

@app.route("/settings/currency", methods=["POST"])
@login_required
def update_currency():
    new_currency = normalize_currency_code(request.form.get("currency", "INR"))
    user_id = session["user_id"]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET currency = ? WHERE id = ?",
            (new_currency, user_id)
        )
        conn.commit()

    session["currency"] = new_currency
    flash(f"Display currency updated to {new_currency} ({get_currency_symbol(new_currency)}). Amounts converted with live exchange rates.", "success")
    return redirect(url_for("dashboard"))

@app.route("/export/csv")
@login_required
def export_csv():
    user_id = session["user_id"]
    active_currency = normalize_currency_code(session.get("currency", "INR"))

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, type, amount, currency, category, description, date, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY date DESC, created_at DESC
            """,
            (user_id,)
        )
        records = cursor.fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Type", f"Amount ({active_currency})", "Original Amount", "Original Currency", "Category", "Description", "Date", "Recorded At"])

    for r in records:
        raw_amt = float(r["amount"])
        raw_curr = normalize_currency_code(r["currency"] if "currency" in r.keys() and r["currency"] else active_currency)
        converted_amt = convert_amount(raw_amt, raw_curr, active_currency)
        writer.writerow([
            r["id"],
            r["type"].capitalize(),
            f"{converted_amt:.2f}",
            f"{raw_amt:.2f}",
            raw_curr,
            r["category"],
            r["description"],
            r["date"],
            r["created_at"]
        ])

    csv_data = output.getvalue()
    filename = f"fintrack_{session.get('username')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.route("/export/json")
@login_required
def export_json():
    user_id = session["user_id"]
    active_currency = normalize_currency_code(session.get("currency", "INR"))

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, type, amount, currency, category, description, date, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY date DESC, created_at DESC
            """,
            (user_id,)
        )
        records = cursor.fetchall()

    data = {
        "app": "FinTrack",
        "exported_at": datetime.now().isoformat(),
        "user": {
            "username": session.get("username"),
            "full_name": session.get("full_name"),
            "display_currency": active_currency
        },
        "transactions": [
            {
                "id": r["id"],
                "type": r["type"],
                "amount_in_display_currency": convert_amount(float(r["amount"]), normalize_currency_code(r["currency"] if "currency" in r.keys() and r["currency"] else active_currency), active_currency),
                "original_amount": float(r["amount"]),
                "original_currency": normalize_currency_code(r["currency"] if "currency" in r.keys() and r["currency"] else active_currency),
                "category": r["category"],
                "description": r["description"],
                "date": r["date"],
                "created_at": r["created_at"]
            }
            for r in records
        ]
    }

    filename = f"fintrack_{session.get('username')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    return Response(
        json.dumps(data, indent=2),
        mimetype="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ----------------- API ENDPOINTS ----------------- #

@app.route("/api/chart-data")
@login_required
def chart_data():
    """API endpoint providing converted chart series for Chart.js."""
    user_id = session["user_id"]
    active_currency = normalize_currency_code(session.get("currency", "INR"))

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT type, amount, currency, category FROM transactions WHERE user_id = ?",
            (user_id,)
        )
        records = cursor.fetchall()

    expense_categories = {}
    for r in records:
        if r["type"] == "expense":
            raw_amt = float(r["amount"])
            raw_curr = normalize_currency_code(r["currency"] if "currency" in r.keys() and r["currency"] else active_currency)
            converted = convert_amount(raw_amt, raw_curr, active_currency)
            cat = r["category"]
            expense_categories[cat] = expense_categories.get(cat, 0.0) + converted

    sorted_categories = [
        {"category": cat, "total": round(amt, 2)}
        for cat, amt in sorted(expense_categories.items(), key=lambda x: x[1], reverse=True)
    ]

    return jsonify({
        "currency": active_currency,
        "symbol": get_currency_symbol(active_currency),
        "expense": sorted_categories
    })

# ----------------- APPLICATION ENTRYPOINT ----------------- #

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n=======================================================")
    print(f" FinTrack Server running at http://127.0.0.1:{port}")
    print(f" Press Ctrl+C to stop the server.")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=False)