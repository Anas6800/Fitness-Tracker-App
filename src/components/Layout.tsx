import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  title?: string;
  children: React.ReactNode;
};

function NavItem({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname === to;

  return (
    <Link to={to} className={active ? 'active' : undefined}>
      {label}
    </Link>
  );
}

export default function Layout({ title, children }: Props) {
  const { currentUser } = useAuth();

  return (
    <div>
      <header className="app-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div className="brand">
            <div className="brand-badge" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="brand-title">Fitness Challenge Tracker</div>
              {title ? <div className="brand-sub">{title}</div> : null}
            </div>
          </div>

          <nav className="nav">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/explore" label="Explore" />
            <NavItem to="/leaderboard" label="Global" />
          </nav>

          <div className="user-pill">{currentUser?.email}</div>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}
