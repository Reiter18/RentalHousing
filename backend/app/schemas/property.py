from pydantic import Field

from app.schemas.common import Out


class PropertyIn(Out):
    address: str = Field(min_length=3)
    city: str = Field(min_length=2)
    area: float = Field(gt=0)
    rooms: int = Field(ge=1)
    description: str = ""


class PropertyOut(PropertyIn):
    id: int
