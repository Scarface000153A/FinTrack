"""
FinTrack Database Module
Handles SQLite connection, schema definition, and automatic migrations.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "finance_tracker.db")

def get_db():
    """Creates a database connection with Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes database schema and ensures all required columns exist."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                currency TEXT DEFAULT 'INR',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Transactions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                category TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)

        # 3. Column Migrations (Ensures backward compatibility)
        cursor.execute("PRAGMA table_info(transactions);")
        tx_columns = [row["name"] for row in cursor.fetchall()]
        if "currency" not in tx_columns:
            cursor.execute("ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'INR';")

        cursor.execute("PRAGMA table_info(users);")
        user_columns = [row["name"] for row in cursor.fetchall()]
        if "currency" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN currency TEXT DEFAULT 'INR';")

        conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)