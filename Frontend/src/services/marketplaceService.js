const API_BASE_URL = 'http://localhost:5000/api';

const buildAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Bitte melden Sie sich erneut an');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const buildJsonAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Bitte melden Sie sich erneut an');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const toFormData = (payload = {}, imageFiles = []) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    formData.append(key, String(value));
  });

  imageFiles.slice(0, 5).forEach((file) => {
    formData.append('images', file);
  });

  return formData;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Anfrage fehlgeschlagen');
  }
  return data;
};

export const fetchNeeds = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}/needs?${query}` : `${API_BASE_URL}/needs`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const createNeed = async (payload, imageFiles = []) => {
  const response = await fetch(`${API_BASE_URL}/needs`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: toFormData(payload, imageFiles),
  });

  return handleResponse(response);
};

export const createDonation = async (payload, imageFiles = []) => {
  const response = await fetch(`${API_BASE_URL}/donations`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: toFormData(payload, imageFiles),
  });

  return handleResponse(response);
};

export const fetchMyDonations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}/donations/mine?${query}` : `${API_BASE_URL}/donations/mine`;
  const response = await fetch(url, {
    headers: buildAuthHeaders(),
  });

  return handleResponse(response);
};

export const fetchReceivedDonations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}/donations/received?${query}` : `${API_BASE_URL}/donations/received`;
  const response = await fetch(url, {
    headers: buildAuthHeaders(),
  });

  return handleResponse(response);
};

export const downloadDonationReport = async (donationId) => {
  const response = await fetch(`${API_BASE_URL}/donations/${donationId}/report`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    // If response is not ok, it might be JSON with error message or just a failure
    try {
      const data = await response.json();
      throw new Error(data.message || 'Download fehlgeschlagen');
    } catch (e) {
      throw new Error('Download fehlgeschlagen (PDF-Bericht)');
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SmartGive_Spende_${donationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const updateDonationDecision = async (donationId, status) => {
  const response = await fetch(`${API_BASE_URL}/donations/${donationId}/status`, {
    method: 'PATCH',
    headers: buildJsonAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse(response);
};

export const updateMyDonation = async (donationId, payload, imageFiles = []) => {
  const response = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: toFormData(payload, imageFiles),
  });

  return handleResponse(response);
};

export const deleteMyDonation = async (donationId) => {
  const response = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
    method: 'DELETE',
    headers: buildJsonAuthHeaders(),
  });

  return handleResponse(response);
};

export const updateMyNeed = async (needId, payload, imageFiles = []) => {
  const response = await fetch(`${API_BASE_URL}/needs/${needId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: toFormData(payload, imageFiles),
  });

  return handleResponse(response);
};

export const deleteMyNeed = async (needId) => {
  const response = await fetch(`${API_BASE_URL}/needs/${needId}`, {
    method: 'DELETE',
    headers: buildJsonAuthHeaders(),
  });

  return handleResponse(response);
};
