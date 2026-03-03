from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def waste_report():
    # TODO: return aggregated waste risk report
    return {"report": {}}
