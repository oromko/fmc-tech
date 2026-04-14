import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await api.get('/appointments', { params });
      setAppointments(response.data.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page appointments-page">
      <div className="page-header">
        <h1>Appointments</h1>
        <button className="btn btn-primary">+ New Appointment</button>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.appointmentId}</td>
                  <td>{apt.patient?.firstName} {apt.patient?.lastName}</td>
                  <td>Dr. {apt.doctor?.specialization}</td>
                  <td>{new Date(apt.date).toLocaleDateString()}</td>
                  <td>{apt.timeSlot?.start}</td>
                  <td>{apt.type}</td>
                  <td>
                    <span className={`status-badge ${apt.status}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm">View</button>
                    <button className="btn btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <p className="no-data">No appointments found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
