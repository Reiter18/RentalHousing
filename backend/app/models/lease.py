from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    tenant_name = Column(String, nullable=False)
    tenant_email = Column(String, nullable=False)
    rent = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    property = relationship("Property", back_populates="leases")
    payments = relationship("Payment", cascade="all, delete-orphan")
    bills = relationship("Bill", cascade="all, delete-orphan")
    documents = relationship("Document", cascade="all, delete-orphan")
