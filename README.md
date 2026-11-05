# SignalDesk 🟢
### AI-Powered Support Ticket Intelligence Platform

SignalDesk is a production-grade full-stack machine learning application designed to automate customer support inquiry categorization, priority triage, and workload analytics. It pairs a genuinely trained Scikit-learn NLP classification engine with a modern React + FastAPI + Neon PostgreSQL cloud architecture.

---

## 🌟 Key Features

* **Genuinely Trained ML Engine**: Built with Scikit-learn using TF-IDF n-gram vectorization and class-balanced Logistic Regression. Evaluated on 11,920+ authentic customer support inquiries.
* **Transparent Priority Triage**: Independent, explainable rule engine that flags operational downtime, account security lockouts, and duplicate financial deductions.
* **Decoupled Architecture**: High-concurrency FastAPI backend with Pydantic v2 validation and SQLAlchemy 2.0 ORM.
* **Modern SaaS Design**: React 18, TypeScript, Tailwind CSS, Lucide vector icons, and Recharts charts replicating the warm off-white and botanical green design reference.
* **Persistent PostgreSQL Storage**: Native integration with Neon Serverless PostgreSQL with pooling and historical audit logs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Framer Motion |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy 2.0 |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, NLTK, Joblib |
| **Database** | PostgreSQL / Neon Cloud Serverless |
| **Deployment** | Vercel (Frontend), Render (FastAPI Docker), Neon (Postgres) |

---

## 📁 Project Architecture

```
SignalDesk/
├── frontend/                     # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Layout, Hero, KPI Cards, Recharts
│   │   ├── pages/                # Dashboard, AnalyzeTicket, TicketExplorer, ModelPerformance, About
│   │   ├── services/api.ts       # Axios API client
│   │   └── types/                # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── api/routes/           # tickets.py, analytics.py, models.py, health.py
│   │   ├── core/config.py        # Settings and environment configs
│   │   ├── database/             # SQLAlchemy models, connection pool, repository
│   │   ├── ml/                   # Preprocessing, TF-IDF vectorizer, model loader
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── services/             # Prediction, priority, and analytics services
│   ├── models/                   # Serialized joblib classifier & metadata
│   ├── data/                     # Raw and processed datasets
│   ├── tests/                    # Backend integration test suite
│   ├── Dockerfile                # Render container deployment manifest
│   └── requirements.txt
│
├── PRD.md                        # Product Requirements Document (V2)
└── README.md
```

---

## 🚀 Quickstart & Local Development

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# Start FastAPI Uvicorn Server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation & Swagger UI will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend and install dependencies
cd frontend
npm install

# Start Vite Dev Server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## 🧪 Running Tests

```bash
# Run backend API integration tests
python -m unittest backend/tests/test_api.py

# Build and typecheck frontend
cd frontend
npm run build
```

---

## 🌐 Cloud Deployment Guide

### Database (Neon PostgreSQL)
1. Sign in or create a project on [Neon Console](https://console.neon.tech).
2. Copy your connection URI string (`postgresql+psycopg://user:pass@ep-host.neon.tech/neondb?sslmode=require`).
3. Set the `DATABASE_URL` environment variable in your backend deployment.

### Backend (Render)
1. Link your GitHub repository to Render.
2. Select **Web Service** and choose **Docker** runtime (using `backend/Dockerfile`).
3. Add environment variables:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string.
   * `FRONTEND_URL`: URL of your Vercel deployment.

### Frontend (Vercel)
1. Import repository into Vercel.
2. Set Root Directory to `frontend`.
3. Add environment variable:
   * `VITE_API_BASE_URL`: URL of your Render backend (e.g. `https://signaldesk-api.onrender.com/api`).

