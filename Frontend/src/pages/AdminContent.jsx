import { useEffect, useState } from 'react';
import { fetchAdminNeeds, fetchAdminDonations, deleteAdminNeed, updateAdminNeedStatus, deleteAdminDonation, updateAdminDonationStatus } from '../services/adminService';
import '../styles/AdminContent.css';

const initialStatus = '';

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState('needs');
  const [needs, setNeeds] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loadingNeeds, setLoadingNeeds] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [error, setError] = useState('');
  const [needSearch, setNeedSearch] = useState('');
  const [needStatus, setNeedStatus] = useState(initialStatus);
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatus, setDonationStatus] = useState(initialStatus);

  useEffect(() => {
    loadNeeds();
  }, [needSearch, needStatus]);

  useEffect(() => {
    loadDonations();
  }, [donationSearch, donationStatus]);

  const loadNeeds = async () => {
    try {
      setLoadingNeeds(true);
      const data = await fetchAdminNeeds(1, 20, needSearch, needStatus);
      setNeeds(data.needs || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Bedarfe');
    } finally {
      setLoadingNeeds(false);
    }
  };

  const loadDonations = async () => {
    try {
      setLoadingDonations(true);
      const data = await fetchAdminDonations(1, 20, donationSearch, donationStatus);
      setDonations(data.donations || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Fehler beim Laden der Angebote');
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleDeleteNeed = async (needId) => {
    if (!window.confirm('Diesen Bedarf wirklich löschen?')) return;
    try {
      await deleteAdminNeed(needId);
      await loadNeeds();
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen des Bedarfs');
    }
  };

  const handleNeedStatusChange = async (needId, status) => {
    try {
      await updateAdminNeedStatus(needId, status);
      await loadNeeds();
    } catch (err) {
      setError(err.message || 'Fehler beim Aktualisieren des Status');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Dieses Angebot wirklich löschen?')) return;
    try {
      await deleteAdminDonation(donationId);
      await loadDonations();
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen des Angebots');
    }
  };

  const handleDonationStatusChange = async (donationId, status) => {
    try {
      await updateAdminDonationStatus(donationId, status);
      await loadDonations();
    } catch (err) {
      setError(err.message || 'Fehler beim Aktualisieren des Status');
    }
  };

  let needsContent;
  if (loadingNeeds) {
    needsContent = <div className="loading-box">Lädt Bedarfe...</div>;
  } else if (needs.length === 0) {
    needsContent = <div className="empty-box">Keine Bedarfe gefunden.</div>;
  } else {
    needsContent = (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Bedarf</th>
              <th>NGO</th>
              <th>Status</th>
              <th>Menge</th>
              <th>Ort</th>
              <th>Erstellt</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {needs.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.ngo_name || item.ngo_username}</td>
                <td>{item.status}</td>
                <td>{item.quantity_received}/{item.quantity_needed}</td>
                <td>{item.city}, {item.country}</td>
                <td>{new Date(item.created_at).toLocaleDateString('de-DE')}</td>
                <td className="action-cell">
                  <select value={item.status} onChange={(e) => handleNeedStatusChange(item.id, e.target.value)} className="action-select">
                    <option value="active">Aktiv</option>
                    <option value="fulfilled">Erfüllt</option>
                    <option value="closed">Geschlossen</option>
                  </select>
                  <button onClick={() => handleDeleteNeed(item.id)} className="danger-btn">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  let donationsContent;
  if (loadingDonations) {
    donationsContent = <div className="loading-box">Lädt Angebote...</div>;
  } else if (donations.length === 0) {
    donationsContent = <div className="empty-box">Keine Angebote gefunden.</div>;
  } else {
    donationsContent = (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Spende</th>
              <th>Spender</th>
              <th>Empfänger</th>
              <th>Status</th>
              <th>Menge</th>
              <th>Ort</th>
              <th>Erstellt</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((item) => (
              <tr key={item.id}>
                <td>{item.item_name}</td>
                <td>{item.donor_name || item.donor_username}</td>
                <td>{item.recipient_name || item.recipient_username || 'Öffentlich'}</td>
                <td>{item.status}</td>
                <td>{item.quantity}</td>
                <td>{item.city}, {item.country}</td>
                <td>{new Date(item.created_at).toLocaleDateString('de-DE')}</td>
                <td className="action-cell">
                  <select value={item.status} onChange={(e) => handleDonationStatusChange(item.id, e.target.value)} className="action-select">
                    <option value="pending">Ausstehend</option>
                    <option value="accepted">Angenommen</option>
                    <option value="rejected">Abgelehnt</option>
                    <option value="in_transit">Unterwegs</option>
                    <option value="delivered">Geliefert</option>
                    <option value="cancelled">Storniert</option>
                  </select>
                  <button onClick={() => handleDeleteDonation(item.id)} className="danger-btn">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <h1>🧾 Bedarfe & Angebote</h1>
        <p>Der Admin kann hier alle Inhalte des Marktplatzes einsehen.</p>
      </div>

      <div className="section-switcher">
        <button
          className={activeSection === 'needs' ? 'active' : ''}
          onClick={() => setActiveSection('needs')}
        >
          Bedarfe
        </button>
        <button
          className={activeSection === 'donations' ? 'active' : ''}
          onClick={() => setActiveSection('donations')}
        >
          Angebote
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {activeSection === 'needs' ? (
        <div className="content-panel">
          <div className="filters">
            <input
              value={needSearch}
              onChange={(e) => setNeedSearch(e.target.value)}
              placeholder="Nach Bedarf oder NGO suchen..."
            />
            <select value={needStatus} onChange={(e) => setNeedStatus(e.target.value)}>
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="fulfilled">Erfüllt</option>
              <option value="closed">Geschlossen</option>
            </select>
          </div>

          {needsContent}
        </div>
      ) : (
        <div className="content-panel">
          <div className="filters">
            <input
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              placeholder="Nach Spende oder Spender suchen..."
            />
            <select value={donationStatus} onChange={(e) => setDonationStatus(e.target.value)}>
              <option value="">Alle Status</option>
              <option value="pending">Ausstehend</option>
              <option value="accepted">Angenommen</option>
              <option value="rejected">Abgelehnt</option>
              <option value="in_transit">Unterwegs</option>
              <option value="delivered">Geliefert</option>
              <option value="cancelled">Storniert</option>
            </select>
          </div>

          {donationsContent}
        </div>
      )}
    </div>
  );
}
