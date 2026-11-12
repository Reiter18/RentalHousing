from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import hash_password, issue_tokens, revoke_refresh, rotate_refresh, verify_password
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenPair, status_code=status.HTTP_201_CREATED)
def register(data: schemas.RegisterIn, db: Session = Depends(get_db)):
    email = str(data.email).lower()
    if db.query(models.User).filter_by(email=email).first():
        raise HTTPException(409, "Аккаунт с таким email уже существует")
    user = models.User(full_name=data.full_name.strip(), email=email, role=data.role, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()
    if data.role == "landlord":
        db.query(models.Property).filter(models.Property.owner_id.is_(None)).update({models.Property.owner_id: user.id})
    db.commit()
    db.refresh(user)
    return issue_tokens(db, user)


@router.post("/login", response_model=schemas.TokenPair)
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=str(data.email).lower()).first()
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    return issue_tokens(db, user)


@router.post("/refresh", response_model=schemas.TokenPair)
def refresh(data: schemas.RefreshIn, db: Session = Depends(get_db)):
    return rotate_refresh(db, data.refresh_token)


@router.post("/logout", status_code=204)
def logout(data: schemas.RefreshIn, db: Session = Depends(get_db)):
    revoke_refresh(db, data.refresh_token)


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
