import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCcw, User, LogOut, Bell, MessageSquare, Search, PlusCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { fetchMyActivities } from '../services/authService';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const Header = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      loadActivities();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadActivities, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadActivities = async () => {
    try {
      const data = await fetchMyActivities(8);
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const getActivityIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('angenommen') || lowerTitle.includes('erfolgreich') || lowerTitle.includes('erstellt')) return <CheckCircle2 size={16} className="text-green-500" />;
    if (lowerTitle.includes('abgelehnt') || lowerTitle.includes('gelöscht') || lowerTitle.includes('fehler')) return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-blue-500" />;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!token) {
    return (
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <RefreshCcw size={22} className="text-white" />
            </div>
            <span className="text-brand font-black text-xl tracking-tight">SmartGive</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#ngo-bedarf" className="hover:text-brand transition-colors">NGO Bedarf</a>
            <a href="#spender-angebote" className="hover:text-brand transition-colors">Spender Angebote</a>
            <a href="#impact" className="hover:text-brand transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Registrieren
            </Link>
            <Link
              to="/login"
              className="px-4 sm:px-5 py-2 rounded-full text-sm font-semibold bg-brand text-white hover:bg-brand-light transition-colors"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      
      {/* Linke Seite - Logo */}
      <Link to="/home" className="flex items-center gap-2 group">
        <div className="bg-brand p-1.5 rounded-lg group-hover:scale-110 transition-transform">
          <RefreshCcw size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-brand font-black text-xl leading-none tracking-tight">SmartGive</span>
        </div>
      </Link>

      {/* Mitte - Suchleiste */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={user.isCompany ? "Spenden oder Spender suchen..." : "NGOs oder Bedarfe suchen..."}
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Rechte Seite - Aktionen & Profil */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Schnell-Aktion: Nur Spender sehen "Spenden", NGOs sehen "Bedarf melden" */}
        <button 
          onClick={() => navigate(user.isCompany ? '/home?create=need' : '/home?create=donation')}
          className="hidden sm:flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-bold bg-brand hover:bg-brand-light transition-colors shadow-md shadow-brand-500/10"
        >
          <PlusCircle size={18} />
          <span>{user.isCompany ? "Bedarf melden" : "Spenden"}</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Nachrichten Icon */}
          <button className="p-2 text-gray-500 hover:text-brand hover:bg-gray-50 rounded-full transition-all relative group">
            <MessageSquare size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border-2 border-white"></span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Nachrichten</span>
          </button>

          {/* Benachrichtigungen Icon */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-all relative group ${
                showNotifications ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:text-brand hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              {activities.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Meldungen</span>
            </button>

            {/* Benachrichtigungs-Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">Benachrichtigungen</h3>
                  <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Neu</span>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors cursor-default">
                        <div className="flex gap-3">
                          <div className="mt-0.5">{getActivityIcon(activity.title)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 leading-snug">{activity.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{activity.details}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: de })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Keine neuen Meldungen</p>
                    </div>
                  )}
                </div>
                
                {activities.length > 0 && (
                  <Link 
                    to={user.isCompany ? "/ngo-profile" : "/spender-profile"} 
                    onClick={() => setShowNotifications(false)}
                    className="block w-full text-center py-2.5 text-xs font-bold text-brand hover:bg-brand/5 border-t border-gray-50 transition-colors"
                  >
                    Alle Aktivitäten ansehen
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 ml-1">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {user.isCompany ? user.companyName : `${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-[10px] text-brand font-bold uppercase tracking-wider mt-1.5 py-0.5 px-2 bg-brand/5 rounded-md inline-block">
              {user.isCompany ? 'NGO Partner' : 'Spender'}
            </p>
          </div>
          
          <div className="group relative">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 border-2 border-white overflow-hidden hover:border-brand/20 hover:text-brand transition-all shadow-sm">
              {user.profilePicture ? (
                <img 
                  src={`http://localhost:5000${user.profilePicture}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={20} />
              )}
            </button>
            
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-400 font-medium">Konto</p>
              </div>
              <Link 
                to={user.isCompany ? "/ngo-profile" : "/spender-profile"} 
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={16} /> Profil bearbeiten
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
