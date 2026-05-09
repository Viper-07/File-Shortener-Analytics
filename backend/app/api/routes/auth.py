from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate, Token
from app.utils.auth import get_password_hash, verify_password, create_access_token
from fastapi_sso.sso.google import GoogleSSO
from fastapi_sso.sso.apple import AppleSSO
from app.config.settings import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=Token)
@limiter.limit("5/hour")  # Limit registration attempts
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")  # Limit login attempts
def login(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or user.provider != "local" or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# OAuth Handlers
google_sso = GoogleSSO(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    redirect_uri=f"{settings.BASE_URL}{settings.API_V1_STR}/auth/google/callback"
)

apple_sso = AppleSSO(
    client_id=settings.APPLE_CLIENT_ID,
    client_secret=settings.APPLE_CLIENT_SECRET,
    redirect_uri=f"{settings.BASE_URL}{settings.API_V1_STR}/auth/apple/callback"
)

@router.get("/google/login")
async def google_login():
    with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    with google_sso:
        user_info = await google_sso.verify_and_process(request)

    if not user_info:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    # Check if user exists
    user = db.query(User).filter(User.email == user_info.email).first()
    if not user:
        # Create new user
        user = User(
            email=user_info.email,
            provider="google",
            provider_id=user_info.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/apple/login")
async def apple_login():
    with apple_sso:
        return await apple_sso.get_login_redirect()

@router.get("/apple/callback")
async def apple_callback(request: Request, db: Session = Depends(get_db)):
    with apple_sso:
        user_info = await apple_sso.verify_and_process(request)

    if not user_info:
        raise HTTPException(status_code=400, detail="Apple authentication failed")

    user = db.query(User).filter(User.email == user_info.email).first()
    if not user:
        user = User(
            email=user_info.email,
            provider="apple",
            provider_id=user_info.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}