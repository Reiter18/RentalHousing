from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    area = Column(Float, nullable=False)
    rooms = Column(Integer, nullable=False)
    description = Column(String, default="")
    leases = relationship("Lease", back_populates="property", cascade="all, delete-orphan")


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


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    amount = Column(Float, nullable=False)
    paid_date = Column(Date, nullable=False)
    comment = Column(String, default="")


class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    kind = Column(String, nullable=False)    
    amount = Column(Float, nullable=False)
    period = Column(String, nullable=False)  
    is_paid = Column(Boolean, default=False)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False) 
    path = Column(String, nullable=False)     
    author = Column(String, nullable=False)    
    created_at = Column(DateTime, default=utcnow)
