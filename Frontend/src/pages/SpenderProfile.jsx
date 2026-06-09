import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, CalendarDays, CheckCheck, Handshake, Mail, MapPin, Shirt } from 'lucide-react';
import { fetchMyActivities, fetchMyProfile } from '../services/authService';
import { fetchMyDonations } from '../services/marketplaceService';

const SpenderProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const localUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(localUser);
  const [myDonations, setMyDonations] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const latestProfile = location.state?.updatedProfile;
    if (latestProfile) {
      setProfile(latestProfile);
      localStorage.setItem('user', JSON.stringify(latestProfile));
    }
  }, [location.state]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfilePage = async () => {
      setLoading(true);
      try {
        const [profileRes, donationsRes, activitiesRes] = await Promise.all([
          fetchMyProfile(),
          fetchMyDonations(),
          fetchMyActivities(8),
        ]);

        const currentUser = profileRes.user || {};
        setProfile(currentUser);
        setMyDonations(donationsRes.donations || []);
        setActivities(activitiesRes.activities || []);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Fehler beim Laden des Spender-Profils:', error);
        setMyDonations([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfilePage();
  }, [navigate, token, location.state?.refreshedAt]);

  const formatRelativeTime = (createdAt) => {
    if (!createdAt) return '';

    const now = new Date();
    const date = new Date(createdAt);
    const diffMs = now.getTime() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `Vor ${minutes} Min.`;
    if (hours < 24) return `Vor ${hours} Std.`;
    return `Vor ${days} Tagen`;
  };

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Spender Profil';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('');

  const profileLocation = [profile.companyCity || profile.city, profile.companyCountry || profile.country]
    .filter(Boolean)
    .join(', ');

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : '';

  const donatedItems = myDonations.reduce((sum, donation) => sum + Number(donation.quantity || 0), 0);
  const completedDonations = myDonations.filter((donation) => donation.status === 'delivered').length;
  const uniqueNgoCount = new Set(
    myDonations
      .map((donation) => donation.ngo_user_id || donation.ngo_name)
      .filter(Boolean)
  ).size;

  const textileSavedKg = Number((donatedItems * 0.55).toFixed(1));
  const co2SavedKg = Number((donatedItems * 1.35).toFixed(1));
  const completionRate = myDonations.length > 0
    ? Math.round((completedDonations / myDonations.length) * 100)
    : 0;

  const levelLabel = donatedItems >= 25 ? 'Premium Spender' : 'Aktiver Spender';
  const profileDescription = profile.profileDescription || '';

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[#607168]">Spender-Profil wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-[#d4dfd9] bg-white">
        <div className="h-36 sm:h-44 bg-gradient-to-r from-[#1a3a2f] via-[#1f4c3a] to-[#2b674e]" />

        <div className="p-4 sm:p-6">
          <div className="-mt-16 sm:-mt-20 rounded-2xl border border-[#dce5df] bg-white p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-[#e7f0eb] border-4 border-white shadow-sm text-[#145539] flex items-center justify-center text-2xl font-bold">
              {initials || 'SP'}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#173d2f] leading-tight">{fullName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf5ee] text-[#1f6044] px-3 py-1 text-xs sm:text-sm font-semibold">
                  <BadgeCheck size={14} /> {levelLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#55665d]">
                {profileLocation && <p className="inline-flex items-center gap-1"><MapPin size={14} /> {profileLocation}</p>}
                {memberSince && <p className="inline-flex items-center gap-1"><CalendarDays size={14} /> Mitglied seit: {memberSince}</p>}
                {profile.email && <p className="inline-flex items-center gap-1"><Mail size={14} /> {profile.email}</p>}
              </div>

              {profileDescription ? (
                <p className="text-[#5f6e66] text-sm sm:text-base">"{profileDescription}"</p>
              ) : (
                <p className="text-[#8a9891] text-sm sm:text-base">
                  Noch keine Beschreibung vorhanden. Du kannst sie unter "Profil bearbeiten" hinzufügen.
                </p>
              )}
            </div>

            <div className="lg:w-52">
              <button
                type="button"
                onClick={() => navigate('/account/edit')}
                className="w-full rounded-xl bg-[#145539] hover:bg-[#1d6a49] text-white font-semibold py-3 px-4 transition-colors"
              >
                Profil bearbeiten
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-white border border-[#dce5df] rounded-2xl p-5 space-y-2">
          <div className="h-10 w-10 rounded-lg bg-[#eef5f1] text-[#145539] flex items-center justify-center">
            <Shirt size={18} />
          </div>
          <p className="text-4xl font-bold text-[#173d2f]">{donatedItems}</p>
          <p className="text-xl font-semibold text-[#173d2f]">Kleidungsstücke</p>
          <p className="text-sm text-[#66776e]">Insgesamt gespendet</p>
        </article>

        <article className="bg-white border border-[#dce5df] rounded-2xl p-5 space-y-2">
          <div className="h-10 w-10 rounded-lg bg-[#eef5f1] text-[#145539] flex items-center justify-center">
            <Handshake size={18} />
          </div>
          <p className="text-4xl font-bold text-[#173d2f]">{uniqueNgoCount}</p>
          <p className="text-xl font-semibold text-[#173d2f]">Unterstützte NGOs</p>
          <p className="text-sm text-[#66776e]">Partner Organisationen</p>
        </article>

        <article className="bg-white border border-[#dce5df] rounded-2xl p-5 space-y-2">
          <div className="h-10 w-10 rounded-lg bg-[#eef5f1] text-[#145539] flex items-center justify-center">
            <CheckCheck size={18} />
          </div>
          <p className="text-4xl font-bold text-[#173d2f]">{completedDonations}</p>
          <p className="text-xl font-semibold text-[#173d2f]">Abgeschlossene Spenden</p>
          <p className="text-sm text-[#66776e]">Erfolgreich vermittelt</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <article className="xl:col-span-2 rounded-2xl border border-[#0f4731] bg-gradient-to-br from-[#145539] to-[#0f4731] text-white p-5 space-y-4">
          <h2 className="text-3xl font-bold">Nachhaltigkeits-Impact</h2>
          <p className="text-sm text-[#d6e9df]">
            Dein Beitrag zur Schonung globaler Ressourcen durch Kreislaufwirtschaft.
          </p>

          <div className="rounded-xl border border-[#2d6c51] bg-[#296649] p-4">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span>{textileSavedKg} kg</span>
              <span className="text-[#daf0e3]">Textilabfall gespart</span>
            </div>
            <div className="h-2 rounded-full bg-[#6d9b84] overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${Math.min(completionRate || 10, 100)}%` }} />
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-[#2d6c51] bg-[#296649] px-4 py-2 text-sm font-semibold">
            {co2SavedKg}kg CO2 Ersparnis
          </div>
        </article>

        <article className="xl:col-span-3 rounded-2xl border border-[#dce5df] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-[#173d2f]">Letzte Aktivitäten</h2>
          </div>

          {activities.length === 0 ? (
            <p className="text-[#8a9891] text-sm">Noch keine Aktivitäten vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-1 h-9 w-9 rounded-full flex items-center justify-center ${index === 0 ? 'bg-[#d6f0e2] text-[#145539]' : 'bg-[#edf2ef] text-[#6b7c73]'}`}>
                    <CheckCheck size={16} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#173d2f]">{activity.title}</p>
                    {activity.details && <p className="text-sm text-[#5f6e66]">{activity.details}</p>}
                    <p className="text-xs text-[#8a9891] mt-1">{formatRelativeTime(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default SpenderProfile;
