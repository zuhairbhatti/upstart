from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database and models
from .database import engine
from . import models  # This imports the models module

# Create tables AFTER importing models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Create tables in the database
models.Base.metadata.create_all(bind=engine)

# Create FastAPI instance - this MUST be named 'app'
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # React Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(...)

@app.get("/")
async def root():
    return {"message": "Welcome to the Poll API"}