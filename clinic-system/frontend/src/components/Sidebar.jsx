import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🏥 Clinic</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          📅 Appointments
        </NavLink>
        <NavLink to="/medical-records" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          📋 Medical Records
        </NavLink>
        <NavLink to="/lab-requests" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          🧪 Lab Requests
        </NavLink>
        <NavLink to="/invoices" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          💰 Invoices
        </NavLink>
        <NavLink to="/hmis-reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          📈 HMIS Reports
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          👤 Profile
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          ⚙️ Admin
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
