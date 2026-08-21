import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/admin/grievances', label: 'Grievances', icon: 'list' },
  { to: '/admin/staff', label: 'Staff', icon: 'users' },
  { to: '/admin/profile', label: 'Profile', icon: 'user' },
];

const Sidebar = () => (
  <aside className="sidebar">
    <p className="sidebar-title">Admin Menu</p>
    <ul className="sidebar-list">
      {links.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </aside>
);

export default Sidebar;
