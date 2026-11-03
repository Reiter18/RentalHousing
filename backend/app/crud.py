from fastapi import HTTPException

from . import models


def get_or_404(db, model, item_id, message):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(404, message)
    return item


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
    get_or_404(db, models.Property, data.property_id, "Объект не найден")
    if data.end_date <= data.start_date:
        raise HTTPException(400, "Дата окончания должна быть позже даты начала")
