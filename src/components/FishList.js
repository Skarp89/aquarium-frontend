import React from "react";

function FishList({ fish }) {
  return (
    <div>
      <h2>Fish</h2>
      <ul>
        {fish.map((f, index) => (
          <li key={index}>{f.name} ({f.species})</li>
        ))}
      </ul>
    </div>
  );
}

export default FishList;
