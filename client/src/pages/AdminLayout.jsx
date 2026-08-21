import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => (
  <div className="admin-shell">
    <Sidebar />
    <div className="admin-content">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
