from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/properties", tags=["properties"])


def owned_property(db: Session, item_id: int, user: models.User) -> models.Property:
    item = db.query(models.Property).filter_by(id=item_id, owner_id=user.id).first()
    if item is None:
        raise HTTPException(404, "Объект не найден")
    return item


@router.get("", response_model=list[schemas.PropertyOut])
def list_properties(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Property).filter_by(owner_id=user.id).order_by(models.Property.id).all()


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return owned_property(db, property_id, user)


@router.post("", response_model=schemas.PropertyOut, status_code=201)
def create_property(data: schemas.PropertyIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "landlord":
        raise HTTPException(403, "Создавать объекты может только арендодатель")
    return crud.save(db, models.Property(owner_id=user.id, **data.model_dump()))


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, data: schemas.PropertyIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return crud.update(db, owned_property(db, property_id, user), data)


@router.delete("/{property_id}", status_code=204)
def delete_property(property_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    crud.remove(db, owned_property(db, property_id, user))
