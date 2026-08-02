import { useState, useEffect } from 'react';
import { listPendingNgos, getVerifiedNgos, verifyNgo, rejectNgo } from '../services/adminService';
import '../styles/AdminNgos.css';

export default function AdminNgos() {
  const [activeTab, setActiveTab] = useState('pending');
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const limit = 10;

  useEffect(() => {
    loadNgos();
  }, [activeTab, page, search]);

  const loadNgos = async () => {
    try {
      setLoading(true);
      const data = activeTab === 'pending'
        ? await listPendingNgos(page, limit, search)
        : await getVerifiedNgos(page, limit, search);
      setNgos(data.ngos);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fehler beim Laden der NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ngoId) => {
    try {
      await verifyNgo(ngoId);
      loadNgos();
      alert('NGO verifiziert');
    } catch (err) {
      alert('Fehler: ' + err.message);
    }
  };

  const handleReject = async (ngoId) => {
    if (!rejectionReason.trim()) {
      alert('Bitte geben Sie einen Grund an');
      return;
    }
    try {
      await rejectNgo(ngoId, rejectionReason);
      setSelectedNgo(null);
      setRejectionReason('');
      loadNgos();
      alert('NGO abgelehnt');
    } catch (err) {
      alert('Fehler: ' + err.message);
    }
  };

  if (loading && ngos.length === 0) return <div className="loading">Lädt...</div>;

  const pages = Math.ceil(total / limit);

  return (
    <div className="admin-ngos">
      <h1>🏢 NGO Verwaltung</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pending'); setPage(1); }}
        >
          ⏳ Ausstehend ({total})
        </button>
        <button
          className={`tab ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => { setActiveTab('verified'); setPage(1); }}
        >
          ✅ Verifiziert ({total})
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="NGO suchen..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>

      {error && <div className="error">Fehler: {error}</div>}

      <div className="ngos-grid">
        {ngos.map(ngo => (
          <div key={ngo.id} className="ngo-card">
            {ngo.profile_picture && (
              <img 
                src={`http://localhost:5000${ngo.profile_picture}`} 
                alt={ngo.company_name} 
                className="ngo-image" 
              />
            )}
            <div className="ngo-content">
              <h3>{ngo.company_name}</h3>
              <p className="contact">👤 {ngo.first_name} {ngo.last_name}</p>
              <p className="email">📧 {ngo.email}</p>
              <p className="location">📍 {ngo.company_city}, {ngo.company_country}</p>
              {ngo.profile_description && (
                <p className="description">{ngo.profile_description}</p>
              )}
              <p className="created">Erstellt: {new Date(ngo.created_at).toLocaleDateString('de-DE')}</p>

              {activeTab === 'pending' ? (
                <div className="actions">
                  <button
                    className="btn-verify"
                    onClick={() => handleVerify(ngo.id)}
                  >
                    ✅ Verifizieren
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => setSelectedNgo(ngo.id)}
                  >
                    ❌ Ablehnen
                  </button>
                </div>
              ) : (
                <div className="verified-badge">✅ Verifiziert</div>
              )}
            </div>
          </div>
        ))}
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

      {selectedNgo && (
        <div className="modal-overlay" onClick={() => setSelectedNgo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>NGO ablehnen</h2>
            <textarea
              placeholder="Grund für Ablehnung..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="modal-buttons">
              <button className="btn-danger" onClick={() => handleReject(selectedNgo)}>
                Ablehnen
              </button>
              <button className="btn-secondary" onClick={() => setSelectedNgo(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
