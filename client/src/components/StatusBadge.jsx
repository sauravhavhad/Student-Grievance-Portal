import React from 'react';

const statusClassMap = {
  Pending: 'badge badge-pending',
  'In Progress': 'badge badge-inprogress',
  Resolved: 'badge badge-resolved',
  Rejected: 'badge badge-rejected',
};

const StatusBadge = ({ status }) => (
  <span className={statusClassMap[status] || 'badge'}>{status}</span>
);

export default StatusBadge;
