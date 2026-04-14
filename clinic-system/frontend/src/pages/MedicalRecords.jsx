import React, { useState } from 'react';

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="page medical-records-page">
      <div className="page-header">
        <h1>Medical Records</h1>
        <button className="btn btn-primary">+ New Record</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by patient name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Visit Date</th>
              <th>Diagnosis</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>REC-20240101-000001</td>
              <td>John Doe</td>
              <td>Dr. Smith</td>
              <td>Jan 1, 2024</td>
              <td>Hypertension</td>
              <td><span className="status-badge active">Active</span></td>
              <td>
                <button className="btn btn-sm">View</button>
                <button className="btn btn-sm">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRecords;
