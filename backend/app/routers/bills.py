from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(tags=["bills"])
LEASE_NOT_FOUND = "Договор не найден"
NOT_FOUND = "Счёт не найден"


@router.get("/leases/{lease_id}/bills", response_model=list[schemas.BillOut])
def list_bills(lease_id: int, db: Session = Depends(get_db)):
    return crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND).bills


@router.post("/leases/{lease_id}/bills", response_model=schemas.BillOut, status_code=201)
def create_bill(lease_id: int, data: schemas.BillIn, db: Session = Depends(get_db)):
    lease = crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND)
    return crud.save(db, models.Bill(lease_id=lease.id, **data.model_dump()))


@router.put("/bills/{bill_id}", response_model=schemas.BillOut)
def update_bill(bill_id: int, data: schemas.BillIn, db: Session = Depends(get_db)):
    bill = crud.get_or_404(db, models.Bill, bill_id, NOT_FOUND)
    return crud.update(db, bill, data)


@router.delete("/bills/{bill_id}", status_code=204)
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    crud.remove(db, crud.get_or_404(db, models.Bill, bill_id, NOT_FOUND))
