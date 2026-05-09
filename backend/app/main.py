from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from sqlalchemy.orm import Session
from app.api.routes import links, analytics, auth
from app.database.connection import engine, Base, get_db
from app.models.link import Link
from app.models.click_event import ClickEvent
from app.services import link_service
from app.config.settings import settings
from datetime import datetime, timezone

# Create database tables (in a real app, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if settings.ENABLE_HTTPS:
    app.add_middleware(HTTPSRedirectMiddleware)

# Include routers
app.include_router(links.router, prefix=f"{settings.API_V1_STR}/links", tags=["links"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

@app.get("/{short_code}")
async def redirect_to_url(short_code: str, request: Request, db: Session = Depends(get_db)):
    """
    Main redirection endpoint.
    Decodes the short code, logs the click event, and redirects to the original URL.
    """
    link = link_service.get_link_by_short_code(db, short_code)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # 1. Check Expiration
    if link.expires_at and link.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This link has expired")
    
    # 2. Check One-time use
    if link.is_one_time and link.is_used:
        raise HTTPException(status_code=410, detail="This one-time link has already been used")
    
    # 3. Check Password Protection
    if link.password_hash:
        # Redirect to frontend password entry page
        # Assuming frontend is at http://localhost:3000
        frontend_url = "http://localhost:3000" # In prod, get from settings
        return RedirectResponse(url=f"{frontend_url}/p/{short_code}")

    # Log click event
    await link_service.log_click(db, link.id, request)
    
    # Mark as used if one-time
    if link.is_one_time:
        link_service.mark_as_used(db, link)
    
    return RedirectResponse(url=link.original_url)

@app.get("/")
async def root():
    return {"message": "Welcome to Link Shortener API", "docs": "/docs"}
