import React from 'react';

const DataRequirementCard = ({ requirement }) => {
  return (
    <div className="data-requirement-card">
      <h3>{requirement.title}</h3>
      <p>{requirement.description}</p>
      <div className="card-footer">
        <span className="category">{requirement.category}</span>
        <span className="price">${requirement.price}</span>
      </div>
    </div>
  );
};

export default DataRequirementCard;