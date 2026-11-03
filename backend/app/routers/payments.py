from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(tags=["payments"])
LEASE_NOT_FOUND = "Договор не найден"
NOT_FOUND = "Платёж не найден"


@router.get("/leases/{lease_id}/payments", response_model=list[schemas.PaymentOut])
def list_payments(lease_id: int, db: Session = Depends(get_db)):
    return crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND).payments


@router.post("/leases/{lease_id}/payments", response_model=schemas.PaymentOut, status_code=201)
def create_payment(lease_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db)):
    lease = crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND)
    return crud.save(db, models.Payment(lease_id=lease.id, **data.model_dump()))


@router.put("/payments/{payment_id}", response_model=schemas.PaymentOut)
def update_payment(payment_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db)):
    payment = crud.get_or_404(db, models.Payment, payment_id, NOT_FOUND)
    return crud.update(db, payment, data)


@router.delete("/payments/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    crud.remove(db, crud.get_or_404(db, models.Payment, payment_id, NOT_FOUND))
