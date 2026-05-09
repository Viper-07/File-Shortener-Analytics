from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.link import LinkCreate, LinkResponse
from app.services import link_service
from app.models.link import Link
from app.config.settings import settings
from fastapi.responses import Response, StreamingResponse
import qrcode
import io

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
        created_at=db_link.created_at,
        expires_at=db_link.expires_at,
        is_one_time=bool(db_link.is_one_time),
        is_protected=db_link.password_hash is not None
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
            created_at=link.created_at,
            expires_at=link.expires_at,
            is_one_time=bool(link.is_one_time),
            is_protected=link.password_hash is not None
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
        created_at=db_link.created_at,
        expires_at=db_link.expires_at,
        is_one_time=bool(db_link.is_one_time),
        is_protected=db_link.password_hash is not None
    )

@router.post("/{short_code}/verify")
async def verify_password(
    short_code: str, 
    password_data: dict, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify password for a protected link and return original URL.
    """
    db_link = link_service.get_link_by_short_code(db, short_code)
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    password = password_data.get("password")
    if not link_service.verify_link_password(db_link, password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Log click event manually since we're bypassing the main redirect
    await link_service.log_click(db, db_link.id, request)
    
    # Mark as used if one-time
    if db_link.is_one_time:
        link_service.mark_as_used(db, db_link)
        
    return {"original_url": db_link.original_url}

@router.get("/{short_code}/qr")
def get_link_qr(short_code: str, db: Session = Depends(get_db)):
    """
    Generate a QR code for the shortened link.
    """
    db_link = link_service.get_link_by_short_code(db, short_code)
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    link_url = f"{settings.BASE_URL}/{db_link.short_code}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(link_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
