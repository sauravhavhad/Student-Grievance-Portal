import React from 'react';

const priorityClassMap = {
  Low: 'badge badge-low',
  Medium: 'badge badge-medium',
  High: 'badge badge-high',
};

const PriorityBadge = ({ priority }) => (
  <span className={priorityClassMap[priority] || 'badge'}>{priority}</span>
);

export default PriorityBadge;
