import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createBoard, getBoards } from "../api/endpoints";
import { logout } from "../api/endpoints";

const CreateBoard = () => {
    const [boards, setBoards] = useState([]);
    const [boardName, setBoardName] = useState('');
    const [boardDescription, setBoardDescription] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBoards = async () => {
            const response = await getBoards();
            setBoards(response);
        };
        fetchBoards();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const newBoard = await createBoard(boardName, boardDescription);
            setBoardName('');
            setBoardDescription('');
            console.log(newBoard);
            navigate(`/board/${newBoard.id}`);
        } catch (error) {
            console.error('Error creating board:', error);
            setError(error.response?.data?.detail || 'Failed to create board');
        }
    };
    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/login');
    };

    return (
        <div className="create-board-container">
            <div className="nav-bar-logout">
                <button className="nav-bar-logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <div className="create-board-card">
                <div>
                    <h2 className="create-board-title">
                        Create New Board
                    </h2>
                </div>
                <form className="create-board-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div>
                            <label htmlFor="boardName" className="form-label">
                                Board Name
                            </label>
                            <input
                                id="boardName"
                                name="boardName"
                                type="text"
                                required
                                className="form-input"
                                placeholder="Enter board name"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="boardDescription" className="form-label">
                                Description
                            </label>
                            <textarea
                                id="boardDescription"
                                name="boardDescription"
                                rows="3"
                                className="form-input"
                                placeholder="Enter board description"
                                value={boardDescription}
                                onChange={(e) => setBoardDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="submit-button"
                        >
                            Create Board
                        </button>
                    </div>
                </form>
            </div>
            <div className="my-boards-container">
                <h2 className="my-boards-title">
                    My Boards
                </h2>
                <div className="my-boards-list">
                    <h3 className="my-boards-list-title">
                        My Boards
                    </h3>
                    <ul className="my-boards-list-items">
                        {boards.map((board) => (
                            <li key={board.id} className="my-boards-list-item">
                                <Link to={`/board/${board.id}`} className="my-boards-list-item-link">
                                    {board.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateBoard;