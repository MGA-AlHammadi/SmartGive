import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, RefreshCcw } from 'lucide-react';
import registerImage from '../assets/screen.png';
import { registerUser } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Spender'); // 'Spender' or 'NGO'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Die Passwörter stimmen nicht überein!');
    }

    setLoading(true);

    // Wir teilen den Vollständigen Namen in Vornamen & Nachnamen auf
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.';

    try {
      await registerUser({
        username: formData.email, // Backend zwingt einen username auf, wir nehmen die Email
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        companyName: role === 'NGO' ? formData.fullName : null, // Falls NGO, füllen wir companyName
      });

      alert('Konto erfolgreich erstellt! Du kannst dich jetzt anmelden.');
      navigate('/login'); // Direkt zur Login-Seite weiterleiten
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
        <img src={registerImage} alt="SmartGive 3D Illustration" className="absolute inset-0 w-full h-full object-cover" />
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
            
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">Konto erstellen</h2>
            <p className="text-sm text-gray-500 mb-8">
              Beginnen Sie Ihre Reise zum ethischen Geben.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Rolle Auswählen */}
              <div className="flex bg-[#f4ece3]/50 rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('Spender')}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                    role === 'Spender' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Spender
                </button>
                <button
                  type="button"
                  onClick={() => setRole('NGO')}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                    role === 'NGO' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  NGO
                </button>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Vollständiger Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Alex Müller"
                    className="w-full bg-[#f4ece3]/40 text-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
                    required
                  />
                </div>
              </div>

              {/* E-Mail Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">E-Mail-Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@beispiel.de"
                    className="w-full bg-[#f4ece3]/40 text-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Split */}
              <div className="flex gap-4">
                <div className="flex-1">
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
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-1">Bestätigen</label>
                  <div className="relative">
                    <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-[#f4ece3]/40 text-gray-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-brand text-white font-medium rounded-lg py-3 mt-4 transition-colors shadow-lg shadow-brand/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-light'}`}
              >
                {loading ? 'Läd...' : 'Konto erstellen'}
              </button>


              {/* Anmelden Link */}
              <p className="text-center text-sm text-gray-600 mt-6 font-medium">
                Bereits ein Konto? <Link to="/login" className="text-gray-900 hover:text-brand font-bold">Anmelden</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Register;
