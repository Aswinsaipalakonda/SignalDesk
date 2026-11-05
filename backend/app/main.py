"""FastAPI Main Entrypoint for SignalDesk Backend.

Configures CORS, registers lifecycle hooks, mounts REST endpoints,
and serves OpenAPI/Swagger documentation at /docs.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.database.connection import init_db
from backend.app.ml.model_loader import ModelLoader
from backend.app.api.routes import health, tickets, analytics, models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler: preloads ML models and initializes database."""
    print("Initializing SignalDesk Backend...")
    try:
        init_db()
        print("Database initialized.")
    except Exception as e:
        print(f"Database init warning: {e}")

    try:
        ModelLoader.load_artifacts()
        print("ML models preloaded.")
    except Exception as e:
        print(f"Model loading warning: {e}")

    yield
    print("Shutting down SignalDesk Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Customer Support Ticket Categorization & Triage Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev and preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(tickets.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to SignalDesk API v2",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
