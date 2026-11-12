from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_accessible_lease, get_current_user

router = APIRouter(prefix="/leases", tags=["leases"])


@router.get("", response_model=list[schemas.LeaseOut])
def list_leases(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Lease).join(models.Property).filter(
        or_(models.Property.owner_id == user.id, func.lower(models.Lease.tenant_email) == user.email)
    ).order_by(models.Lease.id).all()


@router.get("/{lease_id}", response_model=schemas.LeaseOut)
def get_lease(lease_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return get_accessible_lease(db, lease_id, user)


@router.post("", response_model=schemas.LeaseOut, status_code=201)
def create_lease(data: schemas.LeaseIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    prop = db.query(models.Property).filter_by(id=data.property_id, owner_id=user.id).first()
    if user.role != "landlord":
        raise HTTPException(403, "Создавать договор может только арендодатель")
    if prop is None:
        raise HTTPException(404, "Объект не найден")
    crud.check_lease(db, data)
    return crud.save(db, models.Lease(**data.model_dump()))


@router.put("/{lease_id}", response_model=schemas.LeaseOut)
def update_lease(lease_id: int, data: schemas.LeaseIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    lease = get_accessible_lease(db, lease_id, user)
    if lease.property.owner_id != user.id:
        raise HTTPException(403, "Изменять договор может только владелец объекта")
    if db.query(models.Property).filter_by(id=data.property_id, owner_id=user.id).first() is None:
        raise HTTPException(404, "Объект не найден")
    crud.check_lease(db, data)
    return crud.update(db, lease, data)


@router.delete("/{lease_id}", status_code=204)
def delete_lease(lease_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    lease = get_accessible_lease(db, lease_id, user)
    if lease.property.owner_id != user.id:
        raise HTTPException(403, "Удалять договор может только владелец объекта")
    crud.remove(db, lease)
