# app/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime

# Import Base from database.py - THIS IS THE CRITICAL LINE
from .database import Base

# Now define your models using Base
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    # ... rest of your model ...