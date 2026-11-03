from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  
from .database import Base, engine
from .routers import bills, documents, leases, payments, properties

Base.metadata.create_all(bind=engine)  

app = FastAPI(title="Аренда жилья")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])

for module in (properties, leases, payments, bills, documents):
    app.include_router(module.router)
