import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.dependencies import get_accessible_child, get_accessible_lease, get_current_user

router = APIRouter(tags=["documents"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_SIZE = 5 * 1024 * 1024


@router.get("/leases/{lease_id}/documents", response_model=list[schemas.DocumentOut])
def list_documents(lease_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return get_accessible_lease(db, lease_id, user).documents


@router.post("/leases/{lease_id}/documents", response_model=schemas.DocumentOut, status_code=201)
def upload_document(lease_id: int, title: str = Form(..., min_length=2), author: str = Form(..., min_length=2),
                    file: UploadFile = File(...), db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    lease = get_accessible_lease(db, lease_id, user)
    content = file.file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "Файл больше 5 МБ")
    path = UPLOAD_DIR / uuid4().hex
    path.write_bytes(content)
    doc = models.Document(lease_id=lease.id, title=title, author=author, filename=file.filename or "file", path=str(path))
    return crud.save(db, doc)


@router.get("/documents/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    doc = get_accessible_child(db, models.Document, doc_id, user, "Документ не найден")
    return FileResponse(doc.path, filename=doc.filename)


@router.delete("/documents/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    doc = get_accessible_child(db, models.Document, doc_id, user, "Документ не найден")
    if os.path.exists(doc.path):
        os.remove(doc.path)
    crud.remove(db, doc)
