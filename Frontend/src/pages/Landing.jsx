import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNeeds } from '../services/marketplaceService';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('needs');
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const IMAGE_BASE_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';

  useEffect(() => {
    const loadNeeds = async () => {
      setLoading(true);
      try {
        const data = await fetchNeeds({ status: 'active' });
        setNeeds(data.needs || []);
      } catch (error) {
        console.error('Fehler beim Laden der Bedarfe:', error);
        setNeeds([]);
      } finally {
        setLoading(false);
      }
    };

    loadNeeds();
  }, []);

  const cards = useMemo(() => needs.slice(0, 9), [needs]);

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

  const getNeedCardMeta = (need) => {
    const needed = Number(need.quantity_needed || 0);
    const received = Number(need.quantity_received || 0);
    const urgent = needed > 0 && received / needed < 0.35;

    return {
      badgeText: urgent ? 'Dringend' : 'Normal',
      badgeClass: urgent ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white',
    };
  };

  const sectionTitle = activeTab === 'needs' ? 'Aktuelle NGO-Bedarfe' : 'Aktuelle Spender-Angebote';
  const sectionSubtitle =
    activeTab === 'needs'
      ? 'Hilf lokalen NGOs genau die Kleidung zu finden, die gerade dringend benötigt wird.'
      : 'Melde dich an, um passende Angebote von Spendern zu sehen und direkt zu koordinieren.';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-[#173d2f] leading-tight">
          SmartGive Marketplace
        </h1>
        <p className="text-[#5e6d65] max-w-3xl text-base sm:text-lg">
          Transparente Kleiderspenden zwischen Spendern und NGOs. Alles in klaren, strukturierten Karten statt unübersichtlicher Listen.
        </p>
      </section>

      <section className="bg-[#f8faf8] border border-[#d9e4dd] rounded-2xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('needs')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'needs'
                ? 'bg-[#145539] text-white'
                : 'bg-white border border-[#d2dfd8] text-[#315244] hover:bg-[#eef5f1]'
            }`}
          >
            NGO Bedarf
          </button>
          <button
            id="spender-angebote"
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'offers'
                ? 'bg-[#145539] text-white'
                : 'bg-white border border-[#d2dfd8] text-[#315244] hover:bg-[#eef5f1]'
            }`}
          >
            Spender Angebote
          </button>
        </div>

        <div id="ngo-bedarf" className="space-y-1">
          <h2 className="text-2xl font-bold text-[#173d2f]">{sectionTitle}</h2>
          <p className="text-[#607168] text-sm sm:text-base">{sectionSubtitle}</p>
        </div>

        {loading && <p className="text-[#607168]">Daten werden geladen...</p>}

        {!loading && cards.length === 0 && (
          <p className="text-[#607168]">Noch keine Einträge vorhanden.</p>
        )}

        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {cards.map((need) => {
              const images = normalizeImageUrls(need.image_urls);
              const coverImage = images[0] ? toAbsoluteImageUrl(images[0]) : '';
              const { badgeText, badgeClass } = getNeedCardMeta(need);

              return (
                <article
                  key={need.id}
                  className="bg-white border border-[#dce5df] rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className="relative">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt="Bedarf"
                        className="h-40 sm:h-44 w-full rounded-xl object-cover border border-[#d7e2da]"
                      />
                    ) : (
                      <div className="h-40 sm:h-44 rounded-xl bg-gradient-to-br from-[#dce7df] via-[#e9efe9] to-[#d6e4dd] border border-[#d7e2da]" />
                    )}
                    <span className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  <div className="px-1 flex-1 flex flex-col gap-2">
                    <h3 className="text-2xl font-semibold text-[#173d2f] leading-tight">{need.title}</h3>
                    <p className="text-sm text-[#5f6e66]">{need.category || 'Kategorie offen'}</p>

                    <div className="flex items-center justify-between text-sm text-[#344f43] border-t border-b border-[#e4ebe7] py-2">
                      <span>Größe: {need.size || '-'}</span>
                      <span>{need.quantity_needed || 0} Stück benötigt</span>
                    </div>

                    <p className="text-sm text-[#5f6e66]">
                      {need.ngo_name || 'NGO'} • {need.city}, {need.country}
                    </p>
                  </div>

                  <div className="px-1">
                    <Link
                      to="/login"
                      className="w-full inline-flex justify-center text-sm px-4 py-2.5 rounded-lg bg-[#145539] hover:bg-[#1d6a49] text-white font-semibold transition-colors"
                    >
                      Jetzt spenden
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div id="impact" className="bg-white border border-[#dce5df] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#5e6d65]">
            Für vollständigen Zugriff auf Bedarfserstellung, Angebotsverwaltung und Status-Updates bitte anmelden.
          </p>
          <div className="flex gap-2">
            <Link to="/register" className="px-4 py-2 rounded-full text-sm font-semibold border border-[#d2dfd8] text-[#315244] hover:bg-[#eef5f1]">
              Jetzt registrieren
            </Link>
            <Link to="/login" className="px-4 py-2 rounded-full text-sm font-semibold bg-[#145539] text-white hover:bg-[#1d6a49]">
              Anmelden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
