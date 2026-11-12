from pydantic import Field

from app.schemas.common import Out


class BillIn(Out):
    kind: str = Field(min_length=2)
    amount: float = Field(gt=0)
    period: str
    is_paid: bool = False


class BillOut(BillIn):
    id: int
    lease_id: int
