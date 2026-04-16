import React, { useState } from 'react';

const Invoices = () => {
  return (
    <div className="page invoices-page">
      <div className="page-header">
        <h1>Invoices & Bills</h1>
        <button className="btn btn-primary">+ New Invoice</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>INV-20240101-000001</td>
              <td>John Doe</td>
              <td>$250.00</td>
              <td>$250.00</td>
              <td><span className="status-badge paid">Paid</span></td>
              <td>
                <button className="btn btn-sm">View</button>
                <button className="btn btn-sm">Print</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
