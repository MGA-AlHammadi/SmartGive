import { useState, useEffect } from 'react';
import { listReports, reviewReport } from '../services/adminService';
import '../styles/AdminModeration.css';

export default function AdminModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const limit = 10;

  useEffect(() => {
    loadReports();
  }, [page, status]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await listReports(page, limit, status);
      setReports(data.reports);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fehler beim Laden der Berichte:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId, decision) => {
    try {
      await reviewReport(reportId, decision, reviewNotes);
      setSelectedReport(null);
      setReviewNotes('');
      loadReports();
      alert('Bericht überprüft');
    } catch (err) {
      alert('Fehler: ' + err.message);
    }
  };

  if (loading && reports.length === 0) return <div className="loading">Lädt...</div>;

  const pages = Math.ceil(total / limit);

  return (
    <div className="admin-moderation">
      <h1>📋 Inhaltsmoderation</h1>

      <div className="filters">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="pending">⏳ Ausstehend</option>
          <option value="reviewed">✅ Überprüft</option>
        </select>
      </div>

      {error && <div className="error">Fehler: {error}</div>}

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>Keine Berichte zum Anzeigen</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-item">
              <div className="report-header">
                <h3>{report.reason}</h3>
                <span className="status">{report.status}</span>
              </div>
              <p className="report-details">
                <strong>Gemeldet von:</strong> {report.reporter_name}
              </p>
              <p className="report-details">
                <strong>Typ:</strong> {report.content_type}
              </p>
              <p className="report-details">
                <strong>Beschreibung:</strong> {report.description || 'Keine'}
              </p>
              <p className="report-date">
                {new Date(report.created_at).toLocaleDateString('de-DE')}
              </p>

              {report.status === 'pending' && (
                <button
                  className="btn-review"
                  onClick={() => setSelectedReport(report.id)}
                >
                  Überprüfen
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bericht überprüfen</h2>
            <textarea
              placeholder="Überprüfungsnotizen..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
            />
            <div className="modal-buttons">
              <button
                className="btn-approve"
                onClick={() => handleReview(selectedReport, 'approved')}
              >
                ✅ Genehmigen
              </button>
              <button
                className="btn-reject"
                onClick={() => handleReview(selectedReport, 'rejected')}
              >
                ❌ Ablehnen
              </button>
              <button className="btn-secondary" onClick={() => setSelectedReport(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
