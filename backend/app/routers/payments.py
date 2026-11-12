from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_accessible_child, get_accessible_lease, get_current_user

router = APIRouter(tags=["payments"])


@router.get("/leases/{lease_id}/payments", response_model=list[schemas.PaymentOut])
def list_payments(lease_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return get_accessible_lease(db, lease_id, user).payments


@router.post("/leases/{lease_id}/payments", response_model=schemas.PaymentOut, status_code=201)
def create_payment(lease_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    lease = get_accessible_lease(db, lease_id, user)
    return crud.save(db, models.Payment(lease_id=lease.id, **data.model_dump()))


@router.put("/payments/{payment_id}", response_model=schemas.PaymentOut)
def update_payment(payment_id: int, data: schemas.PaymentIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    item = get_accessible_child(db, models.Payment, payment_id, user, "Платёж не найден")
    return crud.update(db, item, data)


@router.delete("/payments/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    item = get_accessible_child(db, models.Payment, payment_id, user, "Платёж не найден")
    crud.remove(db, item)
