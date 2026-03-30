import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Admission_Officer', 'Management'] },
    { name: 'Applicants', path: '/applicants', icon: <Users size={20} />, roles: ['Admin', 'Admission_Officer'] },
    { name: 'New Applicant', path: '/applicants/new', icon: <UserPlus size={20} />, roles: ['Admin', 'Admission_Officer'] },
    { name: 'Master Setup', path: '/setup', icon: <Settings size={20} />, roles: ['Admin'] },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--glass-bg)',
        borderRight: '1px solid var(--glass-border)',
        padding: 'var(--space-xl) var(--space-md)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-sm)' }}>
          <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>edumerge</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Admission Platform</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.filter(item => item.roles.includes(user?.role)).map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `btn ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                justifyContent: 'flex-start',
                gap: '12px',
                width: '100%',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{
          marginTop: 'auto',
          padding: 'var(--space-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--bg-tertiary)'
        }}>
          <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user?.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{user?.role.replace('_', ' ')}</p>
          <button 
            onClick={handleLogout}
            className="btn btn-outline" 
            style={{ width: '100%', padding: '0.5rem', gap: '8px', fontSize: '0.85rem' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
