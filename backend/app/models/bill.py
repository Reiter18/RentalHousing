from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String

from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    kind = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    period = Column(String, nullable=False)
    is_paid = Column(Boolean, default=False)
