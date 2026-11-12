from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_accessible_child, get_accessible_lease, get_current_user

router = APIRouter(tags=["bills"])


@router.get("/leases/{lease_id}/bills", response_model=list[schemas.BillOut])
def list_bills(lease_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return get_accessible_lease(db, lease_id, user).bills


@router.post("/leases/{lease_id}/bills", response_model=schemas.BillOut, status_code=201)
def create_bill(lease_id: int, data: schemas.BillIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    lease = get_accessible_lease(db, lease_id, user)
    return crud.save(db, models.Bill(lease_id=lease.id, **data.model_dump()))


@router.put("/bills/{bill_id}", response_model=schemas.BillOut)
def update_bill(bill_id: int, data: schemas.BillIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    item = get_accessible_child(db, models.Bill, bill_id, user, "Счёт не найден")
    return crud.update(db, item, data)


@router.delete("/bills/{bill_id}", status_code=204)
def delete_bill(bill_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    item = get_accessible_child(db, models.Bill, bill_id, user, "Счёт не найден")
    crud.remove(db, item)
