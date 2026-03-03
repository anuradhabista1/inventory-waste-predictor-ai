from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from src.api.routes import predict, items, report, intake, auth, inventory, summary, report_charts

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Inventory Waste Predictor API",
    description="AI-powered inventory waste prediction",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(report.router, prefix="/report", tags=["Report"])
app.include_router(intake.router, prefix="/inventory/intake", tags=["Intake"])
app.include_router(inventory.router, prefix="/inventory/list", tags=["Inventory"])
app.include_router(summary.router, prefix="/inventory/summary", tags=["Summary"])
app.include_router(report_charts.router, prefix="/inventory/report", tags=["Reports"])


@app.get("/health")
def health():
    return {"status": "ok"}
