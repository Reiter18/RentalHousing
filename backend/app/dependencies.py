import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Lease, Property, User

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(401, "Требуется авторизация", headers={"WWW-Authenticate": "Bearer"})
    try:
        data = jwt.decode(credentials.credentials, settings.jwt_secret_key, algorithms=["HS256"])
        if data.get("type") != "access":
            raise InvalidTokenError("Wrong token type")
        user = db.get(User, int(data["sub"]))
    except (InvalidTokenError, KeyError, ValueError):
        user = None
    if user is None:
        raise HTTPException(401, "Недействительный или истёкший access-токен", headers={"WWW-Authenticate": "Bearer"})
    return user


def get_accessible_lease(db: Session, lease_id: int, user: User) -> Lease:
    lease = db.query(Lease).join(Property).filter(
        Lease.id == lease_id,
        or_(Property.owner_id == user.id, func.lower(Lease.tenant_email) == user.email),
    ).first()
    if lease is None:
        raise HTTPException(404, "Договор не найден")
    return lease


def get_accessible_child(db: Session, model, item_id: int, user: User, message: str):
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(404, message)
    get_accessible_lease(db, item.lease_id, user)
    return item
