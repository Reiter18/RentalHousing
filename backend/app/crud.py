from fastapi import HTTPException

from app import models


def save(db, obj):
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db, obj, data):
    for key, value in data.model_dump().items():
        setattr(obj, key, value)
    return save(db, obj)


def remove(db, obj):
    db.delete(obj)
    db.commit()


def check_lease(db, data):
    if db.get(models.Property, data.property_id) is None:
        raise HTTPException(404, "Объект не найден")
    if data.end_date <= data.start_date:
        raise HTTPException(400, "Дата окончания должна быть позже даты начала")
