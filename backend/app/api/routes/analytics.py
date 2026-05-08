from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.analytics import AnalyticsSummary
from app.services import analytics_service

from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.link import Link

router = APIRouter()

@router.get("/{short_code}", response_model=AnalyticsSummary)
def get_link_analytics(
    short_code: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed analytics for a specific short code.
    Only the owner of the link can see the analytics.
    """
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
        
    if link.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics for this link")

    stats = analytics_service.get_analytics_for_link(db, short_code)
    return stats
