"""FastAPI entrypoint for the SignalDesk backend.

Configures CORS, loads the trained model artifacts, initialises the ticket
history database, and mounts the REST API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import analytics, health, models, tickets
from backend.app.core.config import settings
from backend.app.database.connection import init_db
from backend.app.ml.model_loader import ModelLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preload model artifacts and initialise the database on startup."""
    print("Initializing SignalDesk backend...")

    try:
        ModelLoader.load_artifacts()
        print("ML artifacts loaded.")
    except Exception as exc:  # pragma: no cover - startup guard
        print(f"Model loading warning: {exc}")

    try:
        init_db()
        print("Database ready.")
    except Exception as exc:  # pragma: no cover - startup guard
        print(f"Database initialization warning: {exc}")

    yield
    print("Shutting down SignalDesk backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent customer support ticket categorization and triage platform",
    lifespan=lifespan,
)

cors_origins = list(dict.fromkeys([*settings.CORS_ORIGINS, settings.FRONTEND_URL]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(tickets.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to the SignalDesk API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
