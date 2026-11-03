from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Out(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PropertyIn(BaseModel):
    address: str = Field(min_length=3)
    city: str = Field(min_length=2)
    area: float = Field(gt=0)
    rooms: int = Field(ge=1)
    description: str = ""


class PropertyOut(PropertyIn, Out):
    id: int


class LeaseIn(BaseModel):
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


class PaymentIn(BaseModel):
    amount: float = Field(gt=0)
    paid_date: date
    comment: str = ""


class PaymentOut(PaymentIn, Out):
    id: int
    lease_id: int


class BillIn(BaseModel):
    kind: str = Field(min_length=2)
    amount: float = Field(gt=0)
    period: str
    is_paid: bool = False


class BillOut(BillIn, Out):
    id: int
    lease_id: int


class DocumentOut(Out):
    id: int
    lease_id: int
    title: str
    filename: str
    author: str
    created_at: datetime
