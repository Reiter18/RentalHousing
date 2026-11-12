from sqlalchemy import Column, Float, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    area = Column(Float, nullable=False)
    rooms = Column(Integer, nullable=False)
    description = Column(String, default="")
    leases = relationship("Lease", back_populates="property", cascade="all, delete-orphan")
