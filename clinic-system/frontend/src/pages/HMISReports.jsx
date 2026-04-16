import React, { useState } from 'react';

const HMISReports = () => {
  return (
    <div className="page hmis-reports-page">
      <h1>HMIS Reports</h1>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>Daily Summary</h3>
          <p>Patient visits, appointments, and revenue</p>
          <button className="btn btn-primary">Generate</button>
        </div>

        <div className="report-card">
          <h3>Monthly Financial</h3>
          <p>Revenue breakdown and payment analysis</p>
          <button className="btn btn-primary">Generate</button>
        </div>

        <div className="report-card">
          <h3>Patient Demographics</h3>
          <p>Age, gender, and geographic distribution</p>
          <button className="btn btn-primary">Generate</button>
        </div>

        <div className="report-card">
          <h3>Disease Surveillance</h3>
          <p>Top diagnoses and disease trends</p>
          <button className="btn btn-primary">Generate</button>
        </div>
      </div>
    </div>
  );
};

export default HMISReports;
