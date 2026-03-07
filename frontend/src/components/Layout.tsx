import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-name">Portfolio Tools</span>
          <span className="brand-subtitle">Income &amp; Expense Planner</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/income" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            💰 Income
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🏦 Expenses
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            ⚙️ Settings
          </NavLink>
        </nav>
        <div className="header-user">
          <span className="user-greeting">Hi, {user?.username}</span>
          <button className="btn-ghost" onClick={logout}>Sign Out</button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
