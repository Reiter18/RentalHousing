from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/leases", tags=["leases"])
NOT_FOUND = "Договор не найден"


@router.get("", response_model=list[schemas.LeaseOut])
def list_leases(db: Session = Depends(get_db)):
    return db.query(models.Lease).order_by(models.Lease.id).all()


@router.get("/{lease_id}", response_model=schemas.LeaseOut)
def get_lease(lease_id: int, db: Session = Depends(get_db)):
    lease = db.get(models.Lease, lease_id)
    if lease is None:
        raise HTTPException(404, NOT_FOUND)
    return lease


@router.post("", response_model=schemas.LeaseOut, status_code=201)
def create_lease(data: schemas.LeaseIn, db: Session = Depends(get_db)):
    crud.check_lease(db, data)
    return crud.save(db, models.Lease(**data.model_dump()))


@router.put("/{lease_id}", response_model=schemas.LeaseOut)
def update_lease(lease_id: int, data: schemas.LeaseIn, db: Session = Depends(get_db)):
    lease = db.get(models.Lease, lease_id)
    if lease is None:
        raise HTTPException(404, NOT_FOUND)
    crud.check_lease(db, data)
    return crud.update(db, lease, data)


@router.delete("/{lease_id}", status_code=204)
def delete_lease(lease_id: int, db: Session = Depends(get_db)):
    lease = db.get(models.Lease, lease_id)
    if lease is None:
        raise HTTPException(404, NOT_FOUND)
    crud.remove(db, lease)
