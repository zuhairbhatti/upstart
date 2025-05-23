import React from "react";
import { useState, useEffect } from "react";
import { getCards, createCard } from "../api/endpoints";
import Cards from "./Cards";
const Lists = ({ list, index, boardId }) => {
    const [cards, setCards] = useState([]);
    useEffect(() => {
        const fetchCards = async () => {
            const response = await getCards(boardId, list.id);
            setCards(response);
        };
        fetchCards();
    }, [list]);

    const handleAddCard = async (e) => {
        e.preventDefault();
        const response = await createCard(boardId, list.id, e.target.title.value);
        setCards([...cards, response]);
        e.target.title.value = "";
    };
    console.log('list', list);

    return (
        <div className="lists-container flex flex-row gap-4">
            <h2 className="list-title">{list.title}</h2>
            {cards.map((card) => (
                <Cards key={card.id} card={card} />
            ))}
            <form onSubmit={handleAddCard}>
                <input type="text" name="title" placeholder="Add a card" />
                <button type="submit">Add Card</button>
            </form>
        </div>
    );
};

export default Lists;