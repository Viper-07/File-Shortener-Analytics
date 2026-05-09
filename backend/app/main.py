from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from sqlalchemy.orm import Session
from app.api.routes import links, analytics, auth
from app.database.connection import engine, Base, get_db
from app.models.link import Link
from app.models.click_event import ClickEvent
from app.services import link_service
from app.config.settings import settings

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
    
    # Log click event asynchronously (ideally via a background task)
    await link_service.log_click(db, link.id, request)
    
    return RedirectResponse(url=link.original_url)

@app.get("/")
async def root():
    return {"message": "Welcome to Link Shortener API", "docs": "/docs"}
