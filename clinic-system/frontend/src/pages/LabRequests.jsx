import React, { useState } from 'react';

const LabRequests = () => {
  return (
    <div className="page lab-requests-page">
      <div className="page-header">
        <h1>Laboratory Requests</h1>
        <button className="btn btn-primary">+ New Request</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request #</th>
              <th>Patient</th>
              <th>Priority</th>
              <th>Tests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>LAB-20240101-0001</td>
              <td>John Doe</td>
              <td><span className="priority urgent">Urgent</span></td>
              <td>CBC, Lipid Profile</td>
              <td><span className="status-badge pending">Pending</span></td>
              <td>
                <button className="btn btn-sm">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabRequests;
