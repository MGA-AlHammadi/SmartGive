const API_URL = 'http://localhost:5000/api/auth';

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

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login fehlgeschlagen');
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registrierung fehlgeschlagen');
  }
  return data;
};

export const fetchMyProfile = async () => {
  const response = await fetch(`${API_URL}/me`, {
    headers: buildAuthHeaders(),
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Profil konnte nicht geladen werden');
  }
  return data;
};

export const updateMyProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    cache: 'no-store',
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Profil konnte nicht aktualisiert werden');
  }
  return data;
};

export const fetchMyActivities = async (limit = 10) => {
  const response = await fetch(`${API_URL}/me/activities?limit=${limit}`, {
    headers: buildAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Aktivitäten konnten nicht geladen werden');
  }
  return data;
};
