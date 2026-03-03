from fastapi import FastAPI
from src.api.routes import predict, items, report

app = FastAPI(
    title="Inventory Waste Predictor API",
    description="AI-powered inventory waste prediction",
    version="0.1.0",
)

app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(report.router, prefix="/report", tags=["Report"])


@app.get("/health")
def health():
    return {"status": "ok"}
