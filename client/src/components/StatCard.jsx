import React from 'react';

const StatCard = ({ label, value, tone = 'default' }) => (
  <div className={`stat-card tone-${tone}`}>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

export default StatCard;
