# FinTrack Render Deployment - Session Notes

## Current Status (2026-10-08)

### Latest Commit
- `d312059` - Update session notes with final state

### Problem
Render deployment fails with `cargo metadata` / `maturin` error:
```
Error running maturin: Command '['maturin', 'pep517', 'write-dist-info', ...] returned non-zero exit status 1
Read-only file system (os error 30)
```

### Root Cause
`pydantic-core` (dependency of `pydantic`) is written in Rust and needs `maturin`/`cargo` to build from source. Render's builder has a read-only filesystem where cargo cache can't be written. Python 3.14 may not have pre-compiled wheels for all packages.

### Fix Applied
- Pinned `pydantic==2.10.0` in requirements.txt (should have pre-compiled wheels for Python 3.14)
- Kept `psycopg2-binary==2.9.9` (has pre-compiled wheels)

### Current requirements.txt
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
psycopg2-binary==2.9.9
pydantic==2.10.0
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
```

### If Still Failing
The issue might be with `python-jose[cryptography]` which also has Rust dependencies. Try removing the `[cryptography]` extra:
```
python-jose==3.3.0
```
Or try pinning specific versions that have pre-compiled wheels for Python 3.14.

### Files Modified
- finance-tracker-web/backend/requirements.txt
- finance-tracker-web/backend/app/core/config.py
- finance-tracker-web/backend/app/core/database.py
- finance-tracker-web/backend/app/core/security.py
- finance-tracker-web/backend/app/models/user.py
- finance-tracker-web/backend/app/models/transaction.py
- finance-tracker-web/backend/app/routers/auth.py
- finance-tracker-web/backend/app/routers/transactions.py
- finance-tracker-web/backend/app/schemas/user.py
- finance-tracker-web/backend/app/schemas/transaction.py
- finance-tracker-web/backend/main.py
- finance-tracker-web/backend/.gitignore
