from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/properties", tags=["properties"])
NOT_FOUND = "Объект не найден"


@router.get("", response_model=list[schemas.PropertyOut])
def list_properties(db: Session = Depends(get_db)):
    return db.query(models.Property).order_by(models.Property.id).all()


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    return crud.get_or_404(db, models.Property, property_id, NOT_FOUND)


@router.post("", response_model=schemas.PropertyOut, status_code=201)
def create_property(data: schemas.PropertyIn, db: Session = Depends(get_db)):
    return crud.save(db, models.Property(**data.model_dump()))


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, data: schemas.PropertyIn, db: Session = Depends(get_db)):
    prop = crud.get_or_404(db, models.Property, property_id, NOT_FOUND)
    return crud.update(db, prop, data)


@router.delete("/{property_id}", status_code=204)
def delete_property(property_id: int, db: Session = Depends(get_db)):
    crud.remove(db, crud.get_or_404(db, models.Property, property_id, NOT_FOUND))
