import React from 'react';

const AdminPanel = () => {
  return (
    <div className="page admin-page">
      <h1>Admin Panel</h1>
      
      <div className="admin-sections">
        <section className="admin-card">
          <h2>User Management</h2>
          <p>Manage system users and roles</p>
          <button className="btn btn-primary">Manage Users</button>
        </section>

        <section className="admin-card">
          <h2>System Settings</h2>
          <p>Configure clinic settings</p>
          <button className="btn btn-primary">Settings</button>
        </section>

        <section className="admin-card">
          <h2>Data Backup</h2>
          <p>Backup and restore database</p>
          <button className="btn btn-primary">Backup Now</button>
        </section>

        <section className="admin-card">
          <h2>Audit Logs</h2>
          <p>View system activity logs</p>
          <button className="btn btn-primary">View Logs</button>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
