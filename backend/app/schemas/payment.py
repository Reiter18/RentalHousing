from datetime import date

from pydantic import Field

from app.schemas.common import Out


class PaymentIn(Out):
    amount: float = Field(gt=0)
    paid_date: date
    comment: str = ""


class PaymentOut(PaymentIn):
    id: int
    lease_id: int
