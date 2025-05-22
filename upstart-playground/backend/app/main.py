from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.routers import auth_router
from app.database import engine
from app import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Include routers
app.include_router(auth_router, tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Poll API"}