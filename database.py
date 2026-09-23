"""
FinTrack Database Module
Handles unified database connections for both SQLite (local/disk) and PostgreSQL (Render/cloud).
Provides automatic schema initialization and parameter translation (? -> %s).
"""

import os
import sqlite3

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False

def get_sqlite_path():
    """Determines the SQLite database file path, honoring persistent cloud mount paths."""
    if os.environ.get("DB_PATH"):
        return os.environ.get("DB_PATH")
    # Render persistent disk default mount locations
    if os.path.isdir("/var/data"):
        return "/var/data/finance_tracker.db"
    if os.path.isdir("/data"):
        return "/data/finance_tracker.db"
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "finance_tracker.db")

def is_postgres():
    """Checks whether a valid PostgreSQL connection URL is configured and driver is available."""
    db_url = os.environ.get("DATABASE_URL")
    return bool(db_url and HAS_POSTGRES)

# ----------------- SQLITE WRAPPER ----------------- #

class SQLiteCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, params=None):
        if params is None:
            return self._cursor.execute(query)
        return self._cursor.execute(query, params)

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    @property
    def rowcount(self):
        return self._cursor.rowcount

class SQLiteConnectionWrapper:
    def __init__(self, db_path):
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON;")

    def cursor(self):
        return SQLiteCursorWrapper(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()

# ----------------- POSTGRESQL WRAPPER ----------------- #

class PostgresCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, params=None):
        # Convert SQLite ? placeholders into PostgreSQL %s placeholders
        pg_query = query.replace("?", "%s")
        if params is None:
            return self._cursor.execute(pg_query)
        return self._cursor.execute(pg_query, params)

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    @property
    def rowcount(self):
        return self._cursor.rowcount

class PostgresConnectionWrapper:
    def __init__(self, database_url):
        # Render provides postgres://, psycopg2 prefers postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        self._conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)

    def cursor(self):
        return PostgresCursorWrapper(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()

# ----------------- PUBLIC FACTORY & INITIALIZER ----------------- #

def get_db():
    """Returns a unified database connection context manager."""
    if is_postgres():
        return PostgresConnectionWrapper(os.environ["DATABASE_URL"])
    if os.environ.get("DATABASE_URL") and not HAS_POSTGRES:
        print("[Warning] DATABASE_URL provided but psycopg2 driver not installed. Using SQLite.")
    return SQLiteConnectionWrapper(get_sqlite_path())

def init_db():
    """Initializes schema and ensures all required columns exist across engines."""
    with get_db() as conn:
        cursor = conn.cursor()

        if is_postgres():
            # PostgreSQL Schema
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    password_hash TEXT NOT NULL,
                    currency VARCHAR(10) DEFAULT 'INR',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    type VARCHAR(10) NOT NULL CHECK(type IN ('income', 'expense')),
                    amount NUMERIC(14, 2) NOT NULL,
                    currency VARCHAR(10) DEFAULT 'INR',
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    date VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Postgres Column Migrations
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='transactions';
            """)
            tx_columns = [row["column_name"] for row in cursor.fetchall()]
            if "currency" not in tx_columns:
                cursor.execute("ALTER TABLE transactions ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';")

            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='users';
            """)
            user_columns = [row["column_name"] for row in cursor.fetchall()]
            if "currency" not in user_columns:
                cursor.execute("ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';")
        else:
            # SQLite Schema
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

            # SQLite Column Migrations
            cursor.execute("PRAGMA table_info(transactions);")
            tx_columns = [row["name"] for row in cursor.fetchall()]
            if "currency" not in tx_columns:
                cursor.execute("ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'INR';")

            cursor.execute("PRAGMA table_info(users);")
            user_columns = [row["name"] for row in cursor.fetchall()]
            if "currency" not in user_columns:
                cursor.execute("ALTER TABLE users ADD COLUMN currency TEXT DEFAULT 'INR';")

if __name__ == "__main__":
    init_db()
    backend = "PostgreSQL" if is_postgres() else f"SQLite ({get_sqlite_path()})"
    print(f"Database initialized successfully using {backend}.")
