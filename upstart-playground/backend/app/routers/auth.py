import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status, APIRouter, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models import Users
from app.database import get_db
from sqlalchemy.orm import Session
import logging
from jwt.exceptions import PyJWTError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30 days

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()  # Convert bytes to string for storage

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # The stored hash is already a string, so we just need to encode it once
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    try:
        user = db.query(Users).filter(Users.username == username).first()
        if not user:
            logger.info(f"User not found: {username}")
            return None
        
        # Verify the password
        if not verify_password(password, user.hashed_password):
            logger.info(f"Invalid password for user: {username}")
            return None
            
        return user
    except Exception as e:
        logger.error(f"Error in authenticate_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error"
        )

def get_user(db: Session, username: str):
    return db.query(Users).filter(Users.username == username).first()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info(f"Validating token: {token[:10]}...")  # Log first 10 chars of token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.error("Token payload missing 'sub' claim")
            raise credentials_exception
        logger.info(f"Token validated for user: {username}")
    except PyJWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception
    
    user = get_user(db, username)
    if user is None:
        logger.error(f"User not found for username: {username}")
        raise credentials_exception
    return user

router = APIRouter()

@router.post("/auth/token")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Attempting login for user: {form_data.username}")
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.username})
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        # Only set refresh token in HTTP-only cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/"
        )
        
        # Return access token in response body
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Successfully logged in"
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.post("/auth/register")
async def register(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Attempting registration for user: {form_data.username}")
        # Check if user already exists
        existing_user = db.query(Users).filter(Users.username == form_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Create new user with hashed password
        hashed_password = hash_password(form_data.password)
        new_user = Users(
            username=form_data.username,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully"}
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/auth/me")
async def read_users_me(current_user: Users = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "id": current_user.id,
        "created_at": current_user.created_at
    }

@router.post("/auth/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user = get_user(db, username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        new_access_token = create_access_token(data={"sub": username})
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        