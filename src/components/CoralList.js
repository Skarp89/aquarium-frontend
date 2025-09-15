import React from "react";

function CoralList({ corals }) {
  return (
    <div>
      <h2>Corals</h2>
      <ul>
        {corals.map((c, index) => (
          <li key={index}>{c.name} ({c.color})</li>
        ))}
      </ul>
    </div>
  );
}

export default CoralList;
