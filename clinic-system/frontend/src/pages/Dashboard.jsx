import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingLabRequests: 0,
    unpaidInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would have a dashboard endpoint
        const [appointmentsRes] = await Promise.all([
          api.get('/appointments?status=scheduled')
        ]);
        
        setStats({
          totalPatients: 156,
          todayAppointments: appointmentsRes.data.count || 0,
          pendingLabRequests: 12,
          unpaidInvoices: 8
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patients">👥</div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon appointments">📅</div>
          <div className="stat-info">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lab">🧪</div>
          <div className="stat-info">
            <h3>{stats.pendingLabRequests}</h3>
            <p>Pending Lab Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon invoices">💰</div>
          <div className="stat-info">
            <h3>{stats.unpaidInvoices}</h3>
            <p>Unpaid Invoices</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">Today, 9:00 AM</span>
              <span className="activity-text">New patient registered</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">Today, 8:30 AM</span>
              <span className="activity-text">Appointment confirmed</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">Yesterday, 4:00 PM</span>
              <span className="activity-text">Lab report verified</span>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="btn btn-primary">New Appointment</button>
            <button className="btn btn-secondary">New Patient</button>
            <button className="btn btn-secondary">Lab Request</button>
            <button className="btn btn-secondary">Generate Invoice</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
