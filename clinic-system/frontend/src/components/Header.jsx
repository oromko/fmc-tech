import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1>Welcome, {user?.profile?.firstName || 'User'}</h1>
      </div>
      <div className="header-right">
        <span className="user-info">{user?.email}</span>
        <span className="role-badge">{user?.role}</span>
      </div>
    </header>
  );
};

export default Header;
