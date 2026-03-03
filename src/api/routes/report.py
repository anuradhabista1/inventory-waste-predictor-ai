from fastapi import APIRouter, Depends
from src.api.dependencies import require_auth

router = APIRouter()


@router.get("/", dependencies=[Depends(require_auth)])
def waste_report():
    # TODO: return aggregated waste risk report
    return {"report": {}}
