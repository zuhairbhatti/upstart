import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBoard, createList } from "../api/endpoints";
import Lists from "../components/Lists";
import { Link } from "react-router-dom";

const Board = () => {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const response = await getBoard(id);
                setBoard(response);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to fetch board');
                setLoading(false);
            }
        };
        fetchBoard();
    }, [id]);

    if (loading || !board) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleAddList = async (e) => {
        e.preventDefault();
        const response = await createList(id, e.target.title.value);
        const newList = {
            id: response.id,
            name: response.title,
            cards: [],
        };
        setBoard({ ...board, lists: [...board.lists, newList] });
    };

    return (
        <div className="board-container">
            <div className="board-header">
                <div className="go-back-button">
                    <Link to="/create-board">Go Back</Link>
                </div>
                <h1 className="board-title">{board.title}</h1>
            </div>
            <div className="board-content">
                <div className="board-columns">
                    {board.lists.map((list) => (
                        <Lists key={list.id} list={list} boardId={id} />
                    ))}
                </div>
            </div>
            <form onSubmit={handleAddList}>
                <input type="text" name="title" placeholder="Add a list" />
                <button type="submit">Add List</button>
            </form>
        </div>
    );
};

export default Board;