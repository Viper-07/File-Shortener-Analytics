from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.click_event import ClickEvent
from app.models.link import Link
from app.schemas.analytics import AnalyticsSummary
from typing import List

def get_analytics_for_link(db: Session, short_code: str) -> AnalyticsSummary:
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        return None

    clicks = db.query(ClickEvent).filter(ClickEvent.link_id == link.id).all()
    
    total_clicks = len(clicks)
    
    def get_distribution(attr):
        dist = {}
        for c in clicks:
            val = getattr(c, attr) or "Unknown"
            dist[val] = dist.get(val, 0) + 1
        return dist

    return AnalyticsSummary(
        total_clicks=total_clicks,
        clicks_by_country=get_distribution("country"),
        clicks_by_browser=get_distribution("browser"),
        clicks_by_os=get_distribution("os"),
        clicks_by_device=get_distribution("device"),
        last_10_clicks=[c for c in clicks[-10:]][::-1] # Reverse to get newest first
    )
