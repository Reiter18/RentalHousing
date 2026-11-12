from datetime import date

from pydantic import EmailStr, Field

from app.schemas.common import Out
from app.schemas.property import PropertyOut


class LeaseIn(Out):
    property_id: int
    tenant_name: str = Field(min_length=2)
    tenant_email: EmailStr
    rent: float = Field(gt=0)
    start_date: date
    end_date: date


class LeaseOut(Out):
    id: int
    tenant_name: str
    tenant_email: str
    rent: float
    start_date: date
    end_date: date
    property: PropertyOut
