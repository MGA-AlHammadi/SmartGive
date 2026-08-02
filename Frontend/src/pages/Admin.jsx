import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminNgos from './AdminNgos';
import AdminContent from './AdminContent';
import AdminModeration from './AdminModeration';
import AdminLogs from './AdminLogs';
import '../styles/Admin.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'ngos':
        return <AdminNgos />;
      case 'content':
        return <AdminContent />;
      case 'moderation':
        return <AdminModeration />;
      case 'logs':
        return <AdminLogs />;
      default:
        return <AdminDashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'users', label: '👥 Benutzer', icon: '👥' },
    { id: 'ngos', label: '🏢 NGOs', icon: '🏢' },
    { id: 'content', label: '🧾 Inhalte', icon: '🧾' },
    { id: 'moderation', label: '📋 Moderation', icon: '📋' },
    { id: 'logs', label: '📜 Logs', icon: '📜' },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛡️ Admin Panel</h2>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            Abmelden
          </button>
        </div>
      </div>
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
}
