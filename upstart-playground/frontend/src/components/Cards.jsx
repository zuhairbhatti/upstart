import React from "react";

const Cards = ({ card }) => {
    return (
        <div className="card">
            <h2 className="card-title">{card.title}</h2>
        </div>
    );
};

export default Cards;