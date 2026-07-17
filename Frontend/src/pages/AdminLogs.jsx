import { useState, useEffect } from 'react';
import { getAdminLogs } from '../services/adminService';
import '../styles/AdminLogs.css';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminLogs(page, limit);
      setLogs(data.logs);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fehler beim Laden der Logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && logs.length === 0) return <div className="loading">Lädt...</div>;

  const pages = Math.ceil(total / limit);

  const getActionIcon = (action) => {
    switch (action) {
      case 'CHANGE_ROLE': return '👤';
      case 'BAN_USER': return '🚫';
      case 'UNBAN_USER': return '🔓';
      case 'VERIFY_NGO': return '✅';
      case 'REJECT_NGO': return '❌';
      case 'REVIEW_REPORT': return '📋';
      default: return '📝';
    }
  };

  return (
    <div className="admin-logs">
      <h1>📊 Admin Aktivitätslogs</h1>

      {error && <div className="error">Fehler: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Aktion</th>
              <th>Typ</th>
              <th>Beschreibung</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.username}</td>
                <td>
                  <span className="action-badge">
                    {getActionIcon(log.action)} {log.action}
                  </span>
                </td>
                <td>{log.target_type}</td>
                <td>{log.description || '-'}</td>
                <td>{new Date(log.created_at).toLocaleDateString('de-DE')} {new Date(log.created_at).toLocaleTimeString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            className={`page-btn ${page === p ? 'active' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
