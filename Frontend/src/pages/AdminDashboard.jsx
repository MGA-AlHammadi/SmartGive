import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/adminService';
import '../styles/AdminDashboard.css';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fehler beim Laden der Statistiken:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Lädt...</div>;
  if (error) return <div className="error">Fehler: {error}</div>;
  if (!stats) return null;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Plattformübersicht und Verwaltung</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Gesamte Benutzer"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="NGOs"
          value={stats.totalNgos}
          icon="🏢"
          color="green"
        />
        <StatCard
          title="Verifizierte NGOs"
          value={stats.verifiedNgos}
          icon="✅"
          color="emerald"
        />
        <StatCard
          title="Ausstehende Verifizierungen"
          value={stats.pendingNgoVerifications}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Gesperrte Benutzer"
          value={stats.bannedUsers}
          icon="🚫"
          color="red"
        />
        <StatCard
          title="Offene Berichte"
          value={stats.pendingReports}
          icon="📋"
          color="purple"
        />
        <StatCard
          title="Spenden"
          value={stats.totalDonations}
          icon="💝"
          color="pink"
        />
        <StatCard
          title="Gesamter Spendenbetrag"
          value={`€${parseFloat(stats.totalDonationAmount).toFixed(2)}`}
          icon="💰"
          color="gold"
        />
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h2>ℹ️ Schnelle Aktion</h2>
          <p>Nutze die Navigation links um folgende Funktionen zu verwalten:</p>
          <ul>
            <li><strong>Benutzer:</strong> Verwalte alle Benutzer, ändere Rollen und sperrte Accounts</li>
            <li><strong>NGOs:</strong> Verifiziere neue NGOs oder lehne sie ab</li>
            <li><strong>Moderation:</strong> Überprüfe gemeldete Inhalte</li>
            <li><strong>Logs:</strong> Verfolge alle Admin-Aktionen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
