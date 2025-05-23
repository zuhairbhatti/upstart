# app/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func

# Import Base from database.py - THIS IS THE CRITICAL LINE
from .database import Base

# Now define your models using Base
class Users(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # Store as string since SQLite doesn't handle bytes well
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Define relationship with Boards
    boards = relationship("Boards", back_populates="user")
    # ... rest of your model ...

class Boards(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key to Users
    username = Column(String, ForeignKey("users.username"))
    
    # Define relationship with Users
    user = relationship("Users", back_populates="boards")
    # Define relationship with Lists
    lists = relationship("Lists", back_populates="board", cascade="all, delete-orphan", order_by="Lists.position")

class Lists(Base):
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    position = Column(Integer, default=0)
    
    # Foreign key to Boards
    board_id = Column(Integer, ForeignKey("boards.id"))
    
    # Define relationships
    board = relationship("Boards", back_populates="lists")
    cards = relationship("Cards", back_populates="list", cascade="all, delete-orphan")

class Cards(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    
    # Foreign key to Lists
    list_id = Column(Integer, ForeignKey("lists.id"))
    
    # Foreign key to Users (owner)
    owner_username = Column(String, ForeignKey("users.username"))
    
    # Define relationships
    list = relationship("Lists", back_populates="cards")
    owner = relationship("Users")
