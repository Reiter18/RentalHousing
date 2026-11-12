from datetime import datetime

from app.schemas.common import Out


class DocumentOut(Out):
    id: int
    lease_id: int
    title: str
    filename: str
    author: str
    created_at: datetime
