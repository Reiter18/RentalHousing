import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(tags=["documents"])
LEASE_NOT_FOUND = "Договор не найден"
NOT_FOUND = "Документ не найден"

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_SIZE = 5 * 1024 * 1024  # 5 МБ


@router.get("/leases/{lease_id}/documents", response_model=list[schemas.DocumentOut])
def list_documents(lease_id: int, db: Session = Depends(get_db)):
    return crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND).documents


@router.post("/leases/{lease_id}/documents", response_model=schemas.DocumentOut, status_code=201)
def upload_document(lease_id: int, title: str = Form(..., min_length=2), author: str = Form(..., min_length=2),
                    file: UploadFile = File(...), db: Session = Depends(get_db)):
    lease = crud.get_or_404(db, models.Lease, lease_id, LEASE_NOT_FOUND)
    content = file.file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "Файл больше 5 МБ")
    path = UPLOAD_DIR / uuid4().hex  
    path.write_bytes(content)
    doc = models.Document(lease_id=lease.id, title=title, author=author,
                          filename=file.filename or "file", path=str(path))
    return crud.save(db, doc)


@router.get("/documents/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_or_404(db, models.Document, doc_id, NOT_FOUND)
    return FileResponse(doc.path, filename=doc.filename)


@router.delete("/documents/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_or_404(db, models.Document, doc_id, NOT_FOUND)
    if os.path.exists(doc.path):
        os.remove(doc.path)
    crud.remove(db, doc)
