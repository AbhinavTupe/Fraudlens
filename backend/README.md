# FraudLens

FraudLens is a fraud detection and decision-support platform focused on validating suspicious transactions, enforcing access control, and persisting fraud evaluation outcomes. The project contains a FastAPI backend, a Vite/React frontend, and PostgreSQL-backed persistence for the validated MVP workflow.

## Project Architecture

### Frontend
- React + Vite + TypeScript
- UI-focused presentation layer for the frozen MVP contract
- Uses local mock data and UI-only behavior under the finalized Phase 3.7 contract
- Not treated as a full frontend-backend integration layer for the current MVP

### Backend
- FastAPI application with route-based API structure
- SQLAlchemy session management and PostgreSQL integration
- JWT authentication and role-based authorization
- Transaction creation and retrieval
- Fraud/ML evaluation and persistence workflow

### Database
- PostgreSQL via SQLAlchemy
- Local project configuration is provided through Docker Compose and environment variables
- No schema changes are part of the Phase 3.9 frozen MVP

### Fraud/ML Layer
- ML model loading and inference are handled by the backend service layer
- Fraud evaluation generates predictions and persisted decision state
- Model path and thresholds are configured via environment variables

## Prerequisites

Install the following tools before running the project locally:

- Python 3.12+
- Node.js 18+
- npm
- Docker Desktop or a local PostgreSQL instance
- PostgreSQL client tools are optional, but Docker Compose is the project-supported setup

## Environment Configuration

Create a local `.env` file in the `backend` directory from the template in `backend/.env.example`.

Example values:

```env
DATABASE_URL=postgresql+psycopg2://postgres:your-password@localhost:5432/fraudlens
SECRET_KEY=<your-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

FRONTEND_URL=http://localhost:5173

MODEL_PATH=app/ml/artifacts/fraud_model.joblib
FRAUD_THRESHOLD=0.50

UPLOAD_DIRECTORY=app/uploads
```

Do not commit real secrets. Keep `.env` local and out of source control.

## Database Setup

The project supports PostgreSQL configuration through Docker Compose.

From the `backend` directory:

```bash
docker compose up -d db
```

This starts the local PostgreSQL container for the FraudLens application with the project-configured database configuration.

## Backend Setup

From the `backend` directory:

```bash
python -m venv .venv
```

Activate the environment:

Windows:

```powershell
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend exposes the application at:

```text
http://localhost:8000
```

## Health Check

The project includes a valid health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Frontend Setup

From the `frontend` directory:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend is configured for local development at:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

Optional lint check:

```bash
npm run lint
```

## Local URLs

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Health endpoint: http://localhost:8000/health

## MVP Demonstration Workflow

The validated MVP flow is:

```text
Authentication
↓
Authorization
↓
Transaction creation
↓
Transaction read-back
↓
Fraud/ML evaluation
↓
Evaluation persistence
```

A typical local validated workflow is:

1. Configure `.env` in the backend.
2. Start PostgreSQL with Docker Compose.
3. Start the backend with Uvicorn.
4. Verify `/health` is healthy.
5. Start the frontend with Vite.
6. Use the existing backend authentication flow to obtain a valid token.
7. Create a transaction through the authenticated API.
8. Read back the created transaction by ID.
9. Submit the transaction for fraud evaluation.
10. Confirm the persisted prediction result is recorded.

## Phase 3.7 Frontend Scope

The finalized Phase 3.7 MVP contract is UI-focused / UI-only. The frontend is not expected to provide a fully integrated live-backend implementation for every control. The validated MVP remains centered on the backend capabilities and the frozen Phase 3.9 contract.

## Phase 3.9 Validation

Phase 3.9 is verified and frozen.

Validated capabilities:

- Authentication
- Authorization
- Transaction creation
- Transaction read-back
- Fraud/ML evaluation
- Evaluation persistence
- Phase 3.5 regression
- Phase 3.6 contract

The current scope is intentionally frozen and must not be expanded with new product features during this phase.

## Release Notes

- No dependency lockfile currently exists in the repository.
- This is a reproducibility consideration and is not currently treated as a release blocker.
- The validated MVP is considered release-ready under the current project contract and frozen Phase 3.9 scope.

## Security Notes

- Store local environment values in `backend/.env` and do not commit them.
- Keep JWT secrets and database credentials out of source control.
- Use the project template in `backend/.env.example` for safe local setup.
- Do not expose or print secrets in documentation or runtime output.
