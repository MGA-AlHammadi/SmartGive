import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, RefreshCcw } from 'lucide-react';
import loginImage from '../assets/screen.png';
import { loginUser } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(formData.username, formData.password);

      // Token und User-Daten im Browser (Local Storage) speichern
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login erfolgreich!');
      navigate('/home'); // Leitet auf die Homepage weiter (die wir später erstellen)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-row bg-[#F7F6F2]">
      
      {/* Linke Seite - Illustration/Bild & Text */}
      <div className="w-[60%] relative bg-[#2a4d3e] flex flex-col justify-center overflow-hidden">
        {/* Dein 3D Bild aus den Assets */}
        <img src={loginImage} alt="SmartGive 3D Illustration" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f3f33]/90 via-[#1f3f33]/55 to-transparent" />
        
        <div className="relative z-10 p-16 text-white max-w-lg">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/30 rounded-full px-4 py-1 mb-6 text-xs font-semibold tracking-wider text-green-100">
            <RefreshCcw size={14} className="opacity-80" />
            CIRCULAR IMPACT
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Kleidung ein<br />zweites Leben<br />schenken
          </h1>
          <p className="mt-4 text-green-100/80 text-base leading-relaxed mb-12">
            Schließen Sie sich tausenden Spendern und NGOs an, die eine nachhaltige Zukunft 
            durch ethische Textilumverteilung aufbauen.
          </p>

          <div className="flex gap-10">
            <div>
              <div className="text-2xl font-bold">4.2M</div>
              <div className="text-xs text-green-200/60 uppercase tracking-widest mt-1">Recycelte Artikel</div>
            </div>
            <div>
              <div className="text-2xl font-bold">850+</div>
              <div className="text-xs text-green-200/60 uppercase tracking-widest mt-1">NGO-Partner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rechte Seite - Formular */}
      <div className="w-[40%] flex flex-col p-16 relative">
        
        {/* Header Logo links oben */}
        <div className="absolute top-8 left-8 flex items-center gap-2 text-brand font-bold text-xl">
          <RefreshCcw size={24} />
          <span>SmartGive</span>
        </div>

        <div className="flex-1 flex items-center justify-center mt-12">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-12">
            
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">Willkommen zurueck</h2>
            <p className="text-sm text-gray-500 mb-8">
              Melden Sie sich an, um weiterzumachen.
            </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Benutzername Input */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Benutzername</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Dein Benutzername"
                  className="w-full bg-[#f4ece3]/40 text-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
                  required
                />
              </div>
            </div>

            {/* Passwort Input */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#f4ece3]/40 text-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
                  required
                />
              </div>
            </div>

            {/* Optionen (Angemeldet bleiben & Passwort vergessen) */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-brand focus:ring-brand accent-brand" />
                Angemeldet bleiben
              </label>
              <a href="#" className="text-brand font-semibold hover:underline">Passwort vergessen?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-brand text-white font-medium rounded-lg py-3 mt-4 transition-colors shadow-lg shadow-brand/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-light'}`}
            >
              {loading ? 'Läd...' : 'Anmelden'}
            </button>

            {/* Neu Registrieren */}
            <p className="text-center text-sm text-gray-600 mt-6 font-medium">
              Neu hier? <Link to="/register" className="text-gray-900 hover:text-brand font-bold">Konto erstellen</Link>
            </p>

            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
