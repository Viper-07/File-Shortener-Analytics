import sys
import os
from sqlalchemy import text
from app.database.connection import engine

def migrate():
    print("Checking database schema...")
    try:
        with engine.connect() as conn:
            # Check if provider column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='provider'"))
            if not result.fetchone():
                print("Adding OAuth columns to 'users' table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR DEFAULT 'local'"))
                conn.execute(text("ALTER TABLE users ADD COLUMN provider_id VARCHAR"))
                conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
                conn.commit()
                print("Migration successful!")
            else:
                print("Schema is already up to date.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    # Add parent dir to path to find app module
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    migrate()
