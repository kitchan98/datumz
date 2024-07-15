import React, { useState, useEffect } from 'react';
import { getDataRequirements } from '../services/api';
import DataRequirementCard from './DataRequirementCard';

const DataRequirementList = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const data = await getDataRequirements();
        setRequirements(data);
        setLoading(false);
      } catch (error) {
        // Handle error
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="data-requirement-list">
      {requirements.map((requirement) => (
        <DataRequirementCard key={requirement.id} requirement={requirement} />
      ))}
    </div>
  );
};

export default DataRequirementList;