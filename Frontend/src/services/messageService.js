const API_URL = 'http://localhost:5000/api/messages';

const getConversations = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/conversations`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Fehler beim Laden der Konversationen');
    return response.json();
};

const getMessageHistory = async (otherUserId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/history/${otherUserId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Fehler beim Laden der Nachrichten');
    return response.json();
};

const sendMessage = async (receiverId, content) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, content })
    });
    if (!response.ok) throw new Error('Fehler beim Senden der Nachricht');
    return response.json();
};

const searchUsers = async (query) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Fehler bei der Nutzersuche');
    return response.json();
};

export default {
    getConversations,
    getMessageHistory,
    sendMessage,
    searchUsers
};