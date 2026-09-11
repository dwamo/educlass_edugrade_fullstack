import logging
import os
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "9f8b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4b3c2d1e0f9a8b",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def create_access_token(data: dict):
    """
    Create a JWT access token with an expiration time.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    """
    Verify a plain password against a hashed password.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        logger.exception("Password verification failed")
        return False

def get_password_hash(password):
    """
    Hash a plain password using Argon2.
    """
    return pwd_context.hash(password)

def decode_access_token(token: str):
    """
    Decode a JWT token and return the payload.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        logger.info("Token decoding failed", exc_info=True)
        return None