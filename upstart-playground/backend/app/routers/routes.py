from typing import Any, Dict
from fastapi import HTTPException, Depends, status, APIRouter
from app.models import Users
from app.models import Boards
from app.models import Lists
from app.models import Cards
from app.database import get_db
from sqlalchemy.orm import Session
from app.routers import auth
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/board")
async def get_board(db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    boards = db.query(Boards).filter(Boards.username == current_user.username).all()
    return [
        {
            "id": board.id,
            "title": board.title,
            "created_at": board.created_at,
            "updated_at": board.updated_at
        }
        for board in boards
    ]
@router.post("/board")
async def create_board(board: Dict[str, Any], db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    db_board = Boards(title=board["title"], username=current_user.username)

    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return {
        "id": db_board.id,
        "title": db_board.title,
    }

@router.get("/board/{board_id}")
async def get_board_by_id(board_id: int, db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    board = db.query(Boards).filter(Boards.id == board_id, Boards.username == current_user.username).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return {
        "id": board.id,
        "title": board.title,
        "lists": [
            {
                "id": list.id,
                "title": list.title,
                "position": list.position
            }
            for list in board.lists
        ]
    }

@router.post("/board/{board_id}/list")
async def create_list(board_id: int, list: Dict[str, Any], db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    board = db.query(Boards).filter(Boards.id == board_id, Boards.username == current_user.username).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_list = Lists(title=list["title"], board_id=board_id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return {
        "id": db_list.id,
        "title": db_list.title,
    }

@router.post("/board/{board_id}/list/{list_id}/card")
async def create_card(board_id: int, list_id: int, card: Dict[str, Any], db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    logger.info(f"Creating card: {card}")
    board = db.query(Boards).filter(Boards.id == board_id, Boards.username == current_user.username).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    list = db.query(Lists).filter(Lists.id == list_id, Lists.board_id == board_id).first()
    if not list:
        raise HTTPException(status_code=404, detail="List not found")
    db_card = Cards(title=card["title"], list_id=list_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return {
        "id": db_card.id,
        "title": db_card.title,
    }

@router.get("/board/{board_id}/list/{list_id}/card")
async def get_card(board_id: int, list_id: int, db: Session = Depends(get_db), current_user: Users = Depends(auth.get_current_user)):
    board = db.query(Boards).filter(Boards.id == board_id, Boards.username == current_user.username).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    list = db.query(Lists).filter(Lists.id == list_id, Lists.board_id == board_id).first()
    if not list:
        raise HTTPException(status_code=404, detail="List not found")
    cards = db.query(Cards).filter(Cards.list_id == list_id).all()
    if not cards:
        raise HTTPException(status_code=404, detail="Card not found")
    return [
            {
            "id": card.id,
            "title": card.title,
            } for card in cards
        ]
    

