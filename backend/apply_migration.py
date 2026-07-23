import os
import sys

# Automatically add the virtual environment's site-packages path to sys.path
# to support running the script with the global Python interpreter.
venv_site_packages = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'Lib', 'site-packages'))
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

import ssl
# pyrefly: ignore [missing-import]
import pg8000.dbapi
from dotenv import load_dotenv


# Load env variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD')

if not DB_PASSWORD:
    print("Error: SUPABASE_DB_PASSWORD environment variable not set in backend/.env.")
    print("Please add SUPABASE_DB_PASSWORD=your_password to backend/.env and re-run.")
    sys.exit(1)

SQL_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'supabase', 'shambapoint_setup.sql'))

if not os.path.exists(SQL_FILE):
    print(f"Error: Migration file not found at {SQL_FILE}")
    sys.exit(1)

print("Reading migration SQL script...")
with open(SQL_FILE, 'r', encoding='utf-8') as f:
    sql_script = f.read()

print("Connecting to Supabase PostgreSQL database...")
try:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    conn = pg8000.dbapi.connect(
        host="aws-0-eu-central-1.pooler.supabase.com",
        port=5432,
        database="postgres",
        user="postgres.hwhebeixeflsdshmgowc",
        password=DB_PASSWORD,
        ssl_context=ssl_context
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Applying migration script...")
    # Executing the full combined script
    cursor.execute(sql_script)
    
    print("Successfully applied ShambaPoint schema, RLS, triggers, indexes and grants!")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Database error during migration: {e}")
    sys.exit(1)
