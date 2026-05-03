import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "doors.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                username      TEXT    NOT NULL UNIQUE,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS doors (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER REFERENCES users(id),
                memory       TEXT    NOT NULL,
                poem         TEXT    NOT NULL,
                image_path   TEXT    NOT NULL,
                display_name TEXT    DEFAULT NULL,
                created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        # migrate existing DB if columns are missing
        cols = {row[1] for row in conn.execute("PRAGMA table_info(doors)")}
        if "user_id" not in cols:
            conn.execute("ALTER TABLE doors ADD COLUMN user_id INTEGER REFERENCES users(id)")
        if "display_name" not in cols:
            conn.execute("ALTER TABLE doors ADD COLUMN display_name TEXT DEFAULT NULL")


# ── Users ─────────────────────────────────────────────────

def create_user(username: str, email: str, password_hash: str) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash),
        )
        return cur.lastrowid


def get_user_by_email(email: str) -> dict | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, username, email, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    return dict(row) if row else None


# ── Doors ─────────────────────────────────────────────────

def save_door(
    user_id: int,
    memory: str,
    poem: str,
    image_path: str,
    display_name: str | None = None,
) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO doors (user_id, memory, poem, image_path, display_name) VALUES (?, ?, ?, ?, ?)",
            (user_id, memory, poem, image_path, display_name),
        )


def get_all_doors() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, memory, poem, image_path, display_name, created_at FROM doors ORDER BY id DESC"
        ).fetchall()
    return [dict(r) for r in rows]
