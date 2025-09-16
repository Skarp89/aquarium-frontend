import React from 'react';

const Card = ({ title, content }) => {
  return (
    <div className="bg-blue-500 text-white rounded-xl shadow-lg p-6 m-4 max-w-sm">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-base">{content}</p>
    </div>
  );
};

export default Card;
