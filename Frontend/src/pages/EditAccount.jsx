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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        companyName: formData.companyName.trim(),
        companyCountry: formData.companyCountry.trim(),
        companyCity: formData.companyCity.trim(),
        phone: formData.phone.trim(),
        profileDescription: formData.profileDescription.trim(),
      };

      const response = await updateMyProfile(payload);
      const updatedUser = response.user || {};
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Konto erfolgreich aktualisiert');
      navigate(updatedUser.isCompany ? '/ngo-profile' : '/spender-profile');
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

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-[#dce5df] rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-[#173d2f]">Konto bearbeiten</h1>
        <p className="text-[#5f6e66] mt-2 text-sm sm:text-base">
          Hier kannst du deine Kontodaten aktualisieren. E-Mail bleibt identisch zum Login.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
