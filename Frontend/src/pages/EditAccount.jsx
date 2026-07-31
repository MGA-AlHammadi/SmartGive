import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchMyProfile, updateMyProfile } from '../services/authService';

const EditAccount = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    companyCountry: '',
    companyCity: '',
    phone: '',
    profileDescription: '',
    email: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchMyProfile();
        const user = data.user || {};

        setIsCompany(Boolean(user.isCompany));
        setCurrentProfilePic(user.profilePicture);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          companyName: user.companyName || '',
          companyCountry: user.companyCountry || '',
          companyCity: user.companyCity || '',
          phone: user.phone || '',
          profileDescription: user.profileDescription || '',
          email: user.email || '',
        });
      } catch (error) {
        toast.error(error.message || 'Profil konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('firstName', formData.firstName.trim());
      data.append('lastName', formData.lastName.trim());
      data.append('companyName', formData.companyName.trim());
      data.append('companyCountry', formData.companyCountry.trim());
      data.append('companyCity', formData.companyCity.trim());
      data.append('phone', formData.phone.trim());
      data.append('profileDescription', formData.profileDescription.trim());

      if (selectedFile) {
        data.append('profilePicture', selectedFile);
      }

      const response = await updateMyProfile(data);
      const updatedUser = response.user || {};
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Konto erfolgreich aktualisiert');
      navigate(updatedUser.isCompany ? '/ngo-profile' : '/spender-profile', {
        state: {
          refreshedAt: Date.now(),
          updatedProfile: updatedUser,
        },
      });
    } catch (error) {
      toast.error(error.message || 'Konto konnte nicht aktualisiert werden');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[#607168]">Kontodaten werden geladen...</p>
      </div>
    );
  }

  // Hilfsvariable für die Profilbild-Vorschau
  let profileContent;
  if (previewUrl) {
    profileContent = <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />;
  } else if (currentProfilePic) {
    profileContent = <img src={`http://localhost:5000${currentProfilePic}`} alt="Profile" className="w-full h-full object-cover" />;
  } else {
    profileContent = (
      <div className="text-[#145539] text-3xl font-bold">
        {(formData.firstName?.[0] || formData.companyName?.[0] || '?').toUpperCase()}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-[#dce5df] rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-[#173d2f]">Konto bearbeiten</h1>
        <p className="text-[#5f6e66] mt-2 text-sm sm:text-base">
          Hier kannst du deine Kontodaten aktualisieren. E-Mail bleibt identisch zum Login.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 mb-4 border-b border-[#dce5df]">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#145539] bg-slate-50 flex items-center justify-center">
                {profileContent}
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="profile-upload" className="block text-sm font-semibold text-[#173d2f] mb-2">Profilbild aktualisieren</label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8f3ee] file:text-[#145539] hover:file:bg-[#d1e7dc] transition-colors cursor-pointer"
              />
              <p className="text-xs text-[#5f6e66] mt-2 italic">Nur Bilddateien (JPG, PNG, GIF), max. 5MB</p>
            </div>
          </div>

          {!isCompany && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#315244] mb-1">Vorname</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#315244] mb-1">Nachname</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
                />
              </div>
            </div>
          )}

          {isCompany && (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-[#315244] mb-1">Organisation</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyCountry" className="block text-sm font-medium text-[#315244] mb-1">Land</label>
                  <input
                    id="companyCountry"
                    name="companyCountry"
                    value={formData.companyCountry}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
                  />
                </div>
                <div>
                  <label htmlFor="companyCity" className="block text-sm font-medium text-[#315244] mb-1">Stadt</label>
                  <input
                    id="companyCity"
                    name="companyCity"
                    value={formData.companyCity}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#315244] mb-1">E-Mail (Login)</label>
            <input
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da] bg-[#f6faf8] text-[#5f6e66]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#315244] mb-1">Telefon (optional)</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 ..."
              className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
            />
          </div>

          <div>
            <label htmlFor="profileDescription" className="block text-sm font-medium text-[#315244] mb-1">Beschreibung (optional)</label>
            <textarea
              id="profileDescription"
              name="profileDescription"
              value={formData.profileDescription}
              onChange={handleChange}
              placeholder="Schreibe etwas über deine Organisation..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-[#d7e2da]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#145539] hover:bg-[#1d6a49] text-white font-semibold disabled:opacity-70"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isCompany ? '/ngo-profile' : '/spender-profile')}
              className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;
