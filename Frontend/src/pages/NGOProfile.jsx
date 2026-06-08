import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { fetchNeeds } from '../services/marketplaceService';
import { fetchMyActivities, fetchMyProfile } from '../services/authService';

const NGOProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

  const [loading, setLoading] = useState(true);
  const [ngoNeeds, setNgoNeeds] = useState([]);
  const [activities, setActivities] = useState([]);
  const [profile, setProfile] = useState(user);

  const IMAGE_BASE_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadNgoNeeds = async () => {
      setLoading(true);
      try {
        const [profileData, needsData, activitiesData] = await Promise.all([
          fetchMyProfile(),
          fetchNeeds({ status: 'active' }),
          fetchMyActivities(10),
        ]);

        const currentProfile = profileData.user || {};
        setProfile(currentProfile);
        localStorage.setItem('user', JSON.stringify(currentProfile));

        const allNeeds = needsData.needs || [];
        const ownNeeds = allNeeds.filter((need) => Number(need.ngo_user_id) === Number(currentProfile.id));
        setNgoNeeds(ownNeeds);
        setActivities(activitiesData.activities || []);
      } catch (error) {
        console.error('Fehler beim Laden der NGO-Bedarfe:', error);
        setNgoNeeds([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadNgoNeeds();
  }, [navigate, token, user.id]);

  const normalizeImageUrls = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const toAbsoluteImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const profileName = profile.companyName || 'NGO Organisation';
  const profileEmail = profile.email || '';
  const profileLocation = [profile.companyCity, profile.companyCountry].filter(Boolean).join(', ');
  const profilePhone = profile.phone || '';

  const totalNeeded = ngoNeeds.reduce((sum, item) => sum + Number(item.quantity_needed || 0), 0);
  const totalReceived = ngoNeeds.reduce((sum, item) => sum + Number(item.quantity_received || 0), 0);
  const supportRate = totalNeeded > 0 ? Math.round((totalReceived / totalNeeded) * 100) : 0;

  const missionText = profile.profileDescription || '';

  const currentNeeds = ngoNeeds.slice(0, 3);

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dce5df] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-[#145539] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {profileName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#173d2f] leading-tight">{profileName}</h1>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-[#eef5f1] text-[#1f6044]">
                  <ShieldCheck size={14} /> Verifizierte Organisation
                </span>
              </div>
              <p className="text-[#5f6e66] mt-2 text-sm sm:text-base">
                Seit Jahren unterstützen wir bedürftige Menschen mit gezielten Kleider- und Sachspenden.
              </p>
            </div>
          </div>

          <div className="bg-[#f8faf8] border border-[#e1e8e4] rounded-xl p-4">
            <h2 className="text-xl font-semibold text-[#173d2f] mb-2">Unsere Mission</h2>
            {missionText ? (
              <p className="text-[#5f6e66] text-sm sm:text-base leading-relaxed">{missionText}</p>
            ) : (
              <p className="text-[#8a9891] text-sm sm:text-base leading-relaxed">
                Noch keine Beschreibung vorhanden. Du kannst sie unter "Konto bearbeiten" hinzufügen.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-sm text-[#4e5f56]">
            {profileLocation && (
              <p className="inline-flex items-center gap-2"><MapPin size={16} /> {profileLocation}</p>
            )}
            <p className="inline-flex items-center gap-2"><Mail size={16} /> {profileEmail}</p>
            {profilePhone && (
              <p className="inline-flex items-center gap-2"><Phone size={16} /> {profilePhone}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/home?create=need')}
            className="w-full rounded-xl bg-[#145539] hover:bg-[#1d6a49] text-white font-semibold py-3 px-4 transition-colors"
          >
            Jetzt unterstützen
          </button>
          <button
            type="button"
            onClick={() => navigate('/account/edit')}
            className="w-full rounded-xl bg-white border border-[#d7e2da] text-[#315244] font-semibold py-3 px-4 hover:bg-[#f3f8f5] transition-colors"
          >
            Konto bearbeiten
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-white border border-[#d7e2da] text-[#315244] font-semibold py-3 px-4 hover:bg-[#f3f8f5] transition-colors"
          >
            Kontakt aufnehmen
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#dce5df] p-4">
          <p className="text-xs uppercase tracking-wide text-[#6a7b72] font-semibold">Erhaltene Spenden</p>
          <p className="text-4xl font-bold text-[#173d2f] mt-1">{totalReceived}</p>
          <div className="h-1.5 bg-[#e4ebe7] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#145539] rounded-full" style={{ width: `${Math.min(supportRate, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#dce5df] p-4">
          <p className="text-xs uppercase tracking-wide text-[#6a7b72] font-semibold">Aktive Anfragen</p>
          <p className="text-4xl font-bold text-[#173d2f] mt-1">{ngoNeeds.length}</p>
          <div className="h-1.5 bg-[#e4ebe7] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#145539] rounded-full" style={{ width: `${Math.min(ngoNeeds.length * 10, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#dce5df] p-4">
          <p className="text-xs uppercase tracking-wide text-[#6a7b72] font-semibold">Unterstützte Personen</p>
          <p className="text-4xl font-bold text-[#173d2f] mt-1">{totalNeeded}</p>
          <div className="h-1.5 bg-[#e4ebe7] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#145539] rounded-full" style={{ width: `${Math.min(totalNeeded > 0 ? 75 : 0, 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-[#173d2f]">Aktueller Bedarf</h2>
            <Link to="/home" className="text-sm font-semibold text-[#1d6a49] hover:text-[#145539]">
              Alle ansehen
            </Link>
          </div>

          {loading && <p className="text-[#607168]">Bedarfe werden geladen...</p>}

          {!loading && currentNeeds.length === 0 && (
            <div className="bg-white border border-[#dce5df] rounded-xl p-5">
              <p className="text-[#607168]">Noch keine aktiven Bedarfe vorhanden.</p>
            </div>
          )}

          {!loading && currentNeeds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentNeeds.map((need) => {
                const imageUrls = normalizeImageUrls(need.image_urls);
                const coverImage = imageUrls[0] ? toAbsoluteImageUrl(imageUrls[0]) : '';
                const needed = Number(need.quantity_needed || 0);
                const received = Number(need.quantity_received || 0);
                const progress = needed > 0 ? Math.round((received / needed) * 100) : 0;
                const urgent = progress < 35;

                return (
                  <article key={need.id} className="bg-white border border-[#dce5df] rounded-2xl p-3 space-y-3 shadow-sm">
                    <div className="relative">
                      {coverImage ? (
                        <img src={coverImage} alt={need.title} className="h-40 w-full object-cover rounded-xl" />
                      ) : (
                        <div className="h-40 rounded-xl bg-gradient-to-br from-[#dce7df] via-[#e9efe9] to-[#d6e4dd]" />
                      )}

                      {urgent && (
                        <span className="absolute top-2 left-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
                          Dringend
                        </span>
                      )}
                    </div>

                    <div className="px-1 space-y-1">
                      <h3 className="text-2xl font-semibold text-[#173d2f]">{need.title}</h3>
                      <p className="text-sm text-[#5f6e66] line-clamp-2">{need.description || `${need.category} für ${need.city}`}</p>
                    </div>

                    <div className="px-1 pt-1 border-t border-[#e4ebe7] flex items-center justify-between text-sm text-[#315244]">
                      <span>{progress}% gesammelt</span>
                      <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="font-semibold hover:text-[#145539]"
                      >
                        Spenden
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="bg-white border border-[#dce5df] rounded-2xl p-5">
          <h2 className="text-3xl font-bold text-[#173d2f] mb-4">Letzte Aktivitäten</h2>
          {activities.length === 0 ? (
            <p className="text-[#8a9891] text-sm">Noch keine Aktivitäten vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((item, index) => (
                <div key={item.id} className="relative pl-5 pb-4 border-l border-[#d6e4dd] last:border-l-0 last:pb-0">
                  <span className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#145539]' : 'bg-[#97c8ae]'}`} />
                  <p className="font-semibold text-[#173d2f] text-sm">{item.title}</p>
                  {item.details && <p className="text-sm text-[#5f6e66] mt-1">{item.details}</p>}
                  <p className="text-xs text-[#8a9891] mt-1">{formatRelativeTime(item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default NGOProfile;
