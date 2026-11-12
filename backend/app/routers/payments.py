from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(tags=["payments"])
LEASE_NOT_FOUND = "Договор не найден"
NOT_FOUND = "Платёж не найден"


@router.get("/leases/{lease_id}/payments", response_model=list[schemas.PaymentOut])
def list_payments(lease_id: int, db: Session = Depends(get_db)):
    lease = db.get(models.Lease, lease_id)
    if lease is None:
        raise HTTPException(404, LEASE_NOT_FOUND)
    return lease.payments


@router.post("/leases/{lease_id}/payments", response_model=schemas.PaymentOut, status_code=201)
def create_payment(lease_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db)):
    lease = db.get(models.Lease, lease_id)
    if lease is None:
        raise HTTPException(404, LEASE_NOT_FOUND)
    return crud.save(db, models.Payment(lease_id=lease.id, **data.model_dump()))


@router.put("/payments/{payment_id}", response_model=schemas.PaymentOut)
def update_payment(payment_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db)):
    payment = db.get(models.Payment, payment_id)
    if payment is None:
        raise HTTPException(404, NOT_FOUND)
    return crud.update(db, payment, data)


@router.delete("/payments/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.get(models.Payment, payment_id)
    if payment is None:
        raise HTTPException(404, NOT_FOUND)
    crud.remove(db, payment)
