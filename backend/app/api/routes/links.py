from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.link import LinkCreate, LinkResponse
from app.services import link_service
from app.config.settings import settings

from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
def shorten_link(
    link_in: LinkCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Shorten a new URL for the current user.
    """
    db_link = link_service.create_link(db, link_in, owner_id=current_user.id)
    
    return LinkResponse(
        original_url=db_link.original_url,
        short_url=f"{settings.BASE_URL}/{db_link.short_code}",
        short_code=db_link.short_code,
        created_at=db_link.created_at
    )

@router.get("/", response_model=List[LinkResponse])
def list_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all shortened links for the current user.
    """
    links = db.query(Link).filter(Link.owner_id == current_user.id).order_by(Link.created_at.desc()).all()
    return [
        LinkResponse(
            original_url=link.original_url,
            short_url=f"{settings.BASE_URL}/{link.short_code}",
            short_code=link.short_code,
            created_at=link.created_at
        ) for link in links
    ]

@router.get("/{short_code}", response_model=LinkResponse)
def get_link_info(short_code: str, db: Session = Depends(get_db)):
    """
    Get info about a shortened link.
    """
    db_link = link_service.get_link_by_short_code(db, short_code)
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    return LinkResponse(
        original_url=db_link.original_url,
        short_url=f"{settings.BASE_URL}/{db_link.short_code}",
        short_code=db_link.short_code,
        created_at=db_link.created_at
    )
