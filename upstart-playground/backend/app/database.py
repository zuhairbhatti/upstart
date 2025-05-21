from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

# SQLite connection string - this creates a file named 'app.db' in your current directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# Create the SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # This connect_args parameter is needed only for SQLite
    connect_args={"check_same_thread": False}
)

# Create a SessionLocal class that will serve as a factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class that will be inherited by all your database models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db  # The session is active for the duration of a single request
    finally:
        db.close()  # Always close the session when the request is complete
        