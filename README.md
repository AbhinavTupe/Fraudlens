# FraudLens

FraudLens is a fraud detection and decision-support platform for reviewing suspicious transactions, evaluating risk with machine-learning models, and preserving the reasoning behind each decision. It combines a FastAPI backend, a React/TypeScript frontend, PostgreSQL persistence, and role-based access control.

## Overview

FraudLens supports the investigation workflow from authentication and transaction intake through fraud evaluation, alert management, investigation cases, evidence, and explainable decisions. Evaluation results are stored so analysts can review historical outcomes and understand why a model classified a transaction as fraud or legitimate.

The backend is the authoritative API and persistence layer. The frontend provides the analyst-facing workspace; some dashboard and workflow views currently use local presentation data while backend integration continues to expand.

## Key Features

- JWT authentication and role-based authorization
- Transaction creation, retrieval, status updates, and CSV batch upload
- Machine-learning fraud scoring and persisted predictions
- Fraud alerts and investigation cases
- Evidence and activity tracking
- Evaluation history with pagination
- AI-assisted/model-rule transaction explanations
- Dashboard summaries and model administration endpoints
- PostgreSQL-backed data persistence with Alembic migrations

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, Recharts, Framer Motion, Lucide React
- **Backend:** Python 3.12+, FastAPI, Uvicorn, Pydantic, SQLAlchemy, Alembic
- **Database:** PostgreSQL 16
- **Machine learning:** LightGBM, scikit-learn, pandas, NumPy, joblib
- **Authentication:** JWT with `python-jose` and password hashing with Passlib/bcrypt
- **Infrastructure:** Docker Compose for local PostgreSQL and optional containerized backend execution

## Architecture

```text
React/Vite frontend
        |
        | HTTP/JSON with JWT
        v
FastAPI routers and dependencies
        |
        +--> Services: transactions, fraud detection, alerts, cases, evidence
        |
        +--> SQLAlchemy models and PostgreSQL
        |
        +--> ML model artifacts and inference
```

The API is exposed through route modules under `backend/app/api/routers`. Business logic lives in `backend/app/services`, database entities in `backend/app/models`, and request/response contracts in `backend/app/schemas`.

## Project Structure

```text
backend/
  app/
    api/routers/       FastAPI route modules
    crud/              Database access helpers
    db/                SQLAlchemy engine and sessions
    ml/                Model artifacts and datasets
    models/            SQLAlchemy models and enums
    schemas/           Pydantic API schemas
    services/          Business and fraud-detection logic
  alembic/             Database migrations
  tests/               Automated backend tests
  scripts/             Development and validation utilities
frontend/
  src/
    components/        Reusable UI components
    data/              Frontend presentation data
    lib/               API and shared client utilities
    pages/              Application views
    types/              TypeScript domain types
```

## Backend Setup

Prerequisites:

- Python 3.12 or newer
- Docker Desktop, or a local PostgreSQL instance

From `backend`:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` using the project environment template when available. The required settings include:

```env
DATABASE_URL=postgresql+psycopg2://fraudlens:fraudlens@localhost:5432/fraudlens
SECRET_KEY=replace-with-a-local-secret
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

Do not commit real credentials or secrets.

## Frontend Setup

Prerequisite: Node.js 18 or newer and npm.

From `frontend`:

```powershell
npm install
```

## Running the Application

1. Start PostgreSQL from `backend`:

   ```powershell
   docker compose up -d db
   ```

2. Start the API from `backend` with the virtual environment active:

   ```powershell
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Start the frontend in a second terminal from `frontend`:

   ```powershell
   npm run dev
   ```

Local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

The health check should return:

```json
{"status":"healthy"}
```

## V2.1 - AI-Assisted Fraud Decision Explanation

V2.1 adds an explanation contract for an evaluated transaction. Authorized users can request:

```text
GET /api/transactions/{transaction_id}/explanation
```

The response includes:

- Model version
- Fraud threshold
- Raw model score
- Fraud probability
- Final `fraud` or `legit` decision
- Feature contributions with business-readable reasons

The service uses the loaded model's `explain` method and derives the final decision from the configured threshold. The frontend displays the explanation in the transaction drawer, including the score, threshold, probability, and contributing reasons.

Related implementation areas:

- `backend/app/services/fraud_detection_service.py`
- `backend/app/schemas/explanation.py`
- `backend/app/api/routers/transactions.py`
- `frontend/src/lib/api.ts`
- `frontend/src/components/transactions/TransactionDrawer.tsx`

## Testing

From `backend`, activate the virtual environment and run:

```powershell
pytest
```

The suite covers authentication and authorization, batch uploads, transaction evaluation, regression behavior, and V2.1 explanations. Run the focused V2.1 tests with:

```powershell
pytest tests/test_v21_explanation.py
```

Useful checks from `frontend`:

```powershell
npm run build
npm run lint
```

For a live database-backed check of evaluation history, run:

```powershell
python test_evaluation_history.py
```

## Development Workflow

1. Start PostgreSQL and configure `backend/.env`.
2. Run backend tests before changing API contracts or services.
3. Make database changes through Alembic migrations.
4. Keep API schemas, services, and frontend types aligned when changing responses.
5. Run the focused backend test for the changed behavior.
6. Run `pytest`, `npm run build`, and `npm run lint` before submitting a larger change.
7. Keep secrets, local uploads, model artifacts, and generated files out of commits.

## Security Notes

Use a strong local `SECRET_KEY`, keep database credentials private, and require a valid JWT for protected endpoints. Do not expose `.env` values in logs, tests, screenshots, or documentation.
## Contributing

Contributions to FraudLens are welcome.

Recommended workflow:

1. Create a feature branch from `main`.
2. Make focused changes related to the contribution.
3. Run the relevant tests or build checks.
4. Open a pull request against `main`.
5. Review the changes before merging.
