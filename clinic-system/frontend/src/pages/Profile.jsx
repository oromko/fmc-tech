import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page profile-page">
      <h1>User Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user?.profile?.firstName?.charAt(0)}{user?.profile?.lastName?.charAt(0)}
          </div>
          <h2>{user?.profile?.firstName} {user?.profile?.lastName}</h2>
          <p className="role">{user?.role}</p>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <label>Username:</label>
            <span>{user?.username}</span>
          </div>
          <div className="detail-row">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="detail-row">
            <label>Phone:</label>
            <span>{user?.profile?.phone || 'Not provided'}</span>
          </div>
        </div>

        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
