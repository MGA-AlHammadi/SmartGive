import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchMyProfile } from '../services/authService';

export default function ProtectedAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAdmin(false);
          return;
        }

        const profile = await fetchMyProfile();
        setIsAdmin(profile.user.role === 'admin');
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Lädt...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
