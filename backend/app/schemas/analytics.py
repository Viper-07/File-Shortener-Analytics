from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional

class ClickBase(BaseModel):
    timestamp: datetime
    ip_address: Optional[str]
    country: str
    city: str
    browser: Optional[str]
    os: Optional[str]
    device: Optional[str]

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_clicks: int
    clicks_by_country: Dict[str, int]
    clicks_by_browser: Dict[str, int]
    clicks_by_os: Dict[str, int]
    clicks_by_device: Dict[str, int]
    last_10_clicks: List[ClickBase]
