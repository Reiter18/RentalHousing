import app.models  # загрузить модели до создания таблиц
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.routers import auth, bills, documents, leases, payments, properties

Base.metadata.create_all(bind=engine)
with engine.begin() as connection:
    connection.execute(text("ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id)"))

app = FastAPI(title="Аренда жилья")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (auth, properties, leases, payments, bills, documents):
    app.include_router(module.router)
