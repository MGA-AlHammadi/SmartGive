const API_URL = 'http://localhost:5000/api/admin';

const buildAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Bitte melden Sie sich erneut an');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Dashboard-Statistiken abrufen
export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der Statistiken');
  }
  return data;
};

// Benutzerverwaltung
export const listAllUsers = async (page = 1, limit = 10, search = '', role = '', isBanned = '') => {
  const params = new URLSearchParams({ page, limit, search, role, isBanned });
  const response = await fetch(`${API_URL}/users?${params}`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der Benutzer');
  }
  return data;
};

export const updateUserRole = async (userId, role) => {
  const response = await fetch(`${API_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Aktualisieren der Rolle');
  }
  return data;
};

export const banUser = async (userId, reason) => {
  const response = await fetch(`${API_URL}/users/${userId}/ban`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Sperren des Benutzers');
  }
  return data;
};

export const unbanUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/unban`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Entsperren des Benutzers');
  }
  return data;
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Löschen des Benutzers');
  }
  return data;
};

// NGO-Verifizierung
export const listPendingNgos = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({ page, limit, search });
  const response = await fetch(`${API_URL}/ngos/pending?${params}`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der NGOs');
  }
  return data;
};

export const getVerifiedNgos = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({ page, limit, search });
  const response = await fetch(`${API_URL}/ngos/verified?${params}`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der verifizierten NGOs');
  }
  return data;
};

export const verifyNgo = async (ngoId) => {
  const response = await fetch(`${API_URL}/ngos/${ngoId}/verify`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler bei der Verifizierung');
  }
  return data;
};

export const rejectNgo = async (ngoId, reason) => {
  const response = await fetch(`${API_URL}/ngos/${ngoId}/reject`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Ablehnen');
  }
  return data;
};

// Inhaltsmoderation
export const listReports = async (page = 1, limit = 10, status = 'pending') => {
  const params = new URLSearchParams({ page, limit, status });
  const response = await fetch(`${API_URL}/reports?${params}`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der Berichte');
  }
  return data;
};

export const reviewReport = async (reportId, decision, notes) => {
  const response = await fetch(`${API_URL}/reports/${reportId}/review`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ decision, notes }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Überprüfen des Berichts');
  }
  return data;
};

// Admin-Protokolle (Logs)
export const getAdminLogs = async (page = 1, limit = 20, adminId = '') => {
  const params = new URLSearchParams({ page, limit, adminId });
  const response = await fetch(`${API_URL}/logs?${params}`, {
    headers: buildAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Fehler beim Abrufen der Logs');
  }
  return data;
};
