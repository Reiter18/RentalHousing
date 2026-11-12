from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import uuid4

import jwt
from fastapi import HTTPException
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.config import settings
from app.models import RefreshSession, User

password_hash = PasswordHash.recommended()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    return password_hash.verify(password, encoded)


def token_hash(token: str) -> str:
    return sha256(token.encode()).hexdigest()


def create_token(user_id: int, kind: str, lifetime: timedelta) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({
        "sub": str(user_id), "type": kind, "jti": str(uuid4()),
        "iat": now, "exp": now + lifetime,
    }, settings.jwt_secret_key, algorithm=ALGORITHM)


def issue_tokens(db: Session, user: User) -> dict:
    access = create_token(user.id, "access", timedelta(minutes=settings.access_token_minutes))
    refresh = create_token(user.id, "refresh", timedelta(days=settings.refresh_token_days))
    expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=settings.refresh_token_days)
    db.add(RefreshSession(user_id=user.id, token_hash=token_hash(refresh), expires_at=expires))
    db.commit()
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


def rotate_refresh(db: Session, token: str) -> dict:
    try:
        data = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
    except InvalidTokenError:
        raise HTTPException(401, "Недействительный refresh-токен")
    if data.get("type") != "refresh":
        raise HTTPException(401, "Нужен refresh-токен")
    session = db.query(RefreshSession).filter_by(token_hash=token_hash(token), revoked=False).first()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not session or session.expires_at <= now:
        raise HTTPException(401, "Refresh-токен истёк или отозван")
    try:
        user_id = int(data.get("sub", ""))
    except (TypeError, ValueError):
        raise HTTPException(401, "Недействительный refresh-токен")
    if session.user_id != user_id:
        raise HTTPException(401, "Недействительный refresh-токен")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(401, "Пользователь не найден")
    session.revoked = True
    db.commit()
    return issue_tokens(db, user)


def revoke_refresh(db: Session, token: str) -> None:
    session = db.query(RefreshSession).filter_by(token_hash=token_hash(token), revoked=False).first()
    if session:
        session.revoked = True
        db.commit()
