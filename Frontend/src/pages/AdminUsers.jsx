import { useState, useEffect } from 'react';
import { listAllUsers, updateUserRole, deleteUser } from '../services/adminService';
import '../styles/AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const limit = 10;

  useEffect(() => {
    loadUsers();
  }, [page, search, role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listAllUsers(page, limit, search, role, '');
      setUsers(data.users);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fehler beim Laden der Benutzer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
      alert('Rolle aktualisiert');
    } catch (err) {
      alert('Fehler: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    try {
      await deleteUser(userId);
      loadUsers();
      alert('Benutzer gelöscht');
    } catch (err) {
      alert('Fehler: ' + err.message);
    }
  };

  if (loading && users.length === 0) return <div className="loading">Lädt...</div>;

  const pages = Math.ceil(total / limit);

  return (
    <div className="admin-users">
      <h1>👥 Benutzerverwaltung</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Benutzer suchen..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">Alle Rollen</option>
          <option value="user">Benutzer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <div className="error">Fehler: {error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Benutzer</th>
              <th>E-Mail</th>
              <th>Typ</th>
              <th>Rolle</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.first_name} {user.last_name} (@{user.username})</td>
                <td>{user.email}</td>
                <td>{user.is_company ? 'NGO' : 'Spender'}</td>
                <td className="status-active">Aktiv</td>
                <td>
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">Benutzer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>
                    Löschen
                  </button>
                </td>
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
