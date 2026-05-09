from sqlalchemy.orm import Session
from fastapi import Request
from app.models.link import Link
from app.models.click_event import ClickEvent
from app.schemas.link import LinkCreate
from app.services import shortener
from user_agents import parse
from app.utils.auth import get_password_hash, verify_password
import random

def get_link_by_short_code(db: Session, short_code: str):
    return db.query(Link).filter(Link.short_code == short_code).first()

def create_link(db: Session, link_in: LinkCreate, owner_id: int = None):
    # Check if URL already exists (optional, but good for saving space)
    # db_link = db.query(Link).filter(Link.original_url == str(link_in.original_url)).first()
    # if db_link:
    #     return db_link

    # Create initial link record to get an ID
    db_link = Link(
        original_url=str(link_in.original_url), 
        short_code="temp", 
        owner_id=owner_id,
        expires_at=link_in.expires_at,
        password_hash=get_password_hash(link_in.password) if link_in.password else None,
        is_one_time=1 if link_in.is_one_time else 0
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)

    # Generate short code from the real ID
    # We can add a random offset to make it look less sequential
    offset = 100000 
    s_code = shortener.encode(db_link.id + offset)
    
    db_link.short_code = s_code
    db.commit()
    db.refresh(db_link)
    return db_link

async def log_click(db: Session, link_id: int, request: Request):
    user_agent_str = request.headers.get("user-agent", "")
    ua = parse(user_agent_str)
    
    # In a real app, you'd use a geoip provider here
    # For now, we'll placeholder some of it
    click = ClickEvent(
        link_id=link_id,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=user_agent_str,
        referrer=request.headers.get("referer", "direct"),
        browser=ua.browser.family,
        os=ua.os.family,
        device="Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "PC" if ua.is_pc else "Bot" if ua.is_bot else "Unknown",
        country="Unknown" # Placeholder
    )
    
    db.add(click)
    db.commit()

def verify_link_password(db_link: Link, password: str) -> bool:
    if not db_link.password_hash:
        return True
    return verify_password(password, db_link.password_hash)

def mark_as_used(db: Session, db_link: Link):
    db_link.is_used = 1
    db.commit()
    db.refresh(db_link)
