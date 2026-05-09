from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class LinkBase(BaseModel):
    original_url: HttpUrl

class LinkCreate(LinkBase):
    expires_at: Optional[datetime] = None
    password: Optional[str] = None
    is_one_time: bool = False

class LinkUpdate(LinkBase):
    pass

class Link(LinkBase):
    id: int
    short_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class LinkResponse(BaseModel):
    original_url: str
    short_url: str
    short_code: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_one_time: bool = False
    is_protected: bool = False
