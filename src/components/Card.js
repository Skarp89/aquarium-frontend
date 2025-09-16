import React from "react";

const Card = ({ item, onSelect }) => {
  const placeholderImage = "https://via.placeholder.com/80";

  return (
    <div
      style={{
        background: "#cfe2ff",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "10px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={onSelect} // Trigger edit modal in App.js
    >
      {/* Photo */}
      <img
        src={item.photo || placeholderImage}
        alt={item.name}
        style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
      />

      {/* Info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div><strong>Species:</strong> {item.species || item.name}</div>
        <div><strong>Names:</strong> {item.names && item.names.length > 0 ? item.names.join(", ") : item.name}</div>
        <div><strong>Quantity:</strong> {item.quantity}</div>
      </div>
    </div>
  );
};

export default Card;
