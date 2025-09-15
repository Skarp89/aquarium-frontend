import React from "react";

function TankInfo({ info }) {
  return (
    <div>
      <h2>Tank Info</h2>
      <p>Size: {info.size}</p>
      <p>Water Type: {info.waterType}</p>
    </div>
  );
}

export default TankInfo;
