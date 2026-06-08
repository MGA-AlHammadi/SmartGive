import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCcw, User, LogOut, Bell, MessageSquare, Search, PlusCircle } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

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
          className={`hidden sm:flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-md ${
            user.isCompany 
            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10" 
            : "bg-brand hover:bg-brand-light shadow-brand-500/10"
          }`}
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
          <button className="p-2 text-gray-500 hover:text-brand hover:bg-gray-50 rounded-full transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Meldungen</span>
          </button>
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
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 border-2 border-white hover:border-brand/20 hover:text-brand transition-all shadow-sm">
              <User size={20} />
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
