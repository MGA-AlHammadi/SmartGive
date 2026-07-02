import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Filter, RotateCcw, ChevronDown, MessageSquare } from 'lucide-react';
import {
  createDonation,
  createNeed,
  deleteMyDonation,
  deleteMyNeed,
  fetchReceivedDonations,
  fetchMyDonations,
  fetchNeeds,
  updateDonationDecision,
  updateMyDonation,
  updateMyNeed,
} from '../services/marketplaceService';

const CATEGORIES = ['Oberteil', 'Unterteil', 'Schuhe', 'Zubehör', 'Sonstiges'];
const GENDERS = ['Herren', 'Frauen', 'Kinder', 'Unisex'];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const token = localStorage.getItem('token');

  const [needs, setNeeds] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [receivedDonations, setReceivedDonations] = useState([]);
  const [loadingNeeds, setLoadingNeeds] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [needImages, setNeedImages] = useState([]);
  const [donationImages, setDonationImages] = useState([]);
  const [quickDonationImages, setQuickDonationImages] = useState([]);
  const [editingNeedId, setEditingNeedId] = useState(null);
  const [editingDonationId, setEditingDonationId] = useState(null);
  const [quickDonateNeedId, setQuickDonateNeedId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedListingType, setSelectedListingType] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    location: '',
  });

  const [quickDonationForm, setQuickDonationForm] = useState({
    quantity: '',
    description: '',
  });

  const [needForm, setNeedForm] = useState({
    title: '',
    category: '',
    gender: '',
    size: '',
    quantityNeeded: '',
    country: '',
    city: '',
    description: '',
    neededBy: '',
  });

  const [donationForm, setDonationForm] = useState({
    ngoNeedId: '',
    itemName: '',
    category: '',
    gender: '',
    size: '',
    quantity: '',
    condition: 'good',
    country: '',
    city: '',
    notes: '',
  });

  const isNgo = Boolean(user?.isCompany);
  const [activeBoardTab, setActiveBoardTab] = useState('needs');
  const createMode = searchParams.get('create');
  const selectedNeedIdFromQuery = searchParams.get('needId');
  const IMAGE_BASE_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
  let needSubmitText = 'Bedarf speichern';
  let donationSubmitText = 'Spendenangebot senden';

  if (editingNeedId) {
    needSubmitText = 'Bedarf aktualisieren';
  }

  if (editingDonationId) {
    donationSubmitText = 'Spendenangebot aktualisieren';
  }

  if (submitting) {
    needSubmitText = 'Speichern...';
    donationSubmitText = 'Speichern...';
  }

  const normalizeImageUrls = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

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
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const showNeedForm = isNgo && createMode === 'need';
  const showDonationForm = !isNgo && createMode === 'donation';
  const showCreateSection = showNeedForm || showDonationForm;

  const boardTabs = isNgo
    ? [
        { id: 'needs', label: 'NGO Bedarf' },
        { id: 'incoming-donations', label: 'Spender Angebote' },
      ]
    : [
        { id: 'needs', label: 'NGO Bedarf' },
        { id: 'my-donations', label: 'Meine Angebote' },
      ];

  const needFormTitle = editingNeedId ? 'Bedarf bearbeiten' : 'Neuen Bedarf anlegen';
  const donationFormTitle = editingDonationId ? 'Spende bearbeiten' : 'Neue Spende anlegen';

  const loadNeeds = async () => {
    setLoadingNeeds(true);
    try {
      const data = await fetchNeeds();
      setNeeds(data.needs || []);
    } catch (err) {
      toast.error(err.message || 'Bedarfe konnten nicht geladen werden');
    } finally {
      setLoadingNeeds(false);
    }
  };

  const loadMyDonations = async () => {
    if (isNgo || !token) return;

    try {
      const data = await fetchMyDonations();
      setMyDonations(data.donations || []);
    } catch (err) {
      toast.error(err.message || 'Eigene Spenden konnten nicht geladen werden');
    }
  };

  const loadReceivedDonations = async () => {
    if (!isNgo || !token) return;

    try {
      const data = await fetchReceivedDonations();
      setReceivedDonations(data.donations || []);
    } catch (err) {
      toast.error(err.message || 'Eingegangene Spenden konnten nicht geladen werden');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadNeeds();
    loadMyDonations();
    loadReceivedDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isNgo]);

  useEffect(() => {
    if (!selectedNeedIdFromQuery || isNgo) return;

    setDonationForm((prev) => ({
      ...prev,
      ngoNeedId: selectedNeedIdFromQuery,
    }));
  }, [selectedNeedIdFromQuery, isNgo]);

  const handleNeedChange = (e) => {
    setNeedForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDonationChange = (e) => {
    setDonationForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNeedImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }
    setNeedImages(files);
  };

  const handleDonationImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }
    setDonationImages(files);
  };

  const handleQuickDonationImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }
    setQuickDonationImages(files);
  };

  const handleQuickQuantityChange = (e) => {
    setQuickDonationForm((prev) => ({ ...prev, quantity: e.target.value }));
  };

  const handleQuickDescriptionChange = (e) => {
    setQuickDonationForm((prev) => ({ ...prev, description: e.target.value }));
  };

  const resetNeedForm = () => {
    setNeedForm({
      title: '',
      category: '',
      gender: '',
      size: '',
      quantityNeeded: '',
      country: '',
      city: '',
      description: '',
      neededBy: '',
    });
    setNeedImages([]);
    setEditingNeedId(null);
  };

  const resetDonationForm = () => {
    setDonationForm({
      ngoNeedId: '',
      itemName: '',
      category: '',
      gender: '',
      size: '',
      quantity: '',
      condition: 'good',
      country: '',
      city: '',
      notes: '',
    });
    setDonationImages([]);
    setEditingDonationId(null);
  };

  const handleNeedSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...needForm,
        title: needForm.title.trim(),
        category: needForm.category.trim(),
        gender: needForm.gender.trim() || null,
        size: needForm.size.trim() || null,
        quantityNeeded: Number(needForm.quantityNeeded),
        country: needForm.country.trim(),
        city: needForm.city.trim(),
        description: needForm.description.trim() || null,
        neededBy: needForm.neededBy || null,
      };

      if (editingNeedId) {
        await updateMyNeed(editingNeedId, payload, needImages);
        toast.success('Bedarf erfolgreich aktualisiert');
      } else {
        await createNeed(payload, needImages);
        toast.success('Bedarf erfolgreich erstellt');
      }

      resetNeedForm();
      await loadNeeds();
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Bedarf konnte nicht gespeichert werden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...donationForm,
        ngoNeedId: donationForm.ngoNeedId ? Number(donationForm.ngoNeedId) : null,
        quantity: Number(donationForm.quantity),
      };

      if (editingDonationId) {
        await updateMyDonation(editingDonationId, payload, donationImages);
        toast.success('Spendenangebot erfolgreich aktualisiert');
      } else {
        await createDonation(payload, donationImages);
        toast.success('Spendenangebot erfolgreich erstellt');
      }

      resetDonationForm();
      await loadMyDonations();
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Spendenangebot konnte nicht gespeichert werden');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditNeed = (need) => {
    setEditingNeedId(need.id);
    setNeedForm({
      title: need.title || '',
      category: need.category || '',
      gender: need.gender || '',
      size: need.size || '',
      quantityNeeded: String(need.quantity_needed || ''),
      country: need.country || '',
      city: need.city || '',
      description: need.description || '',
      neededBy: need.needed_by ? String(need.needed_by).slice(0, 10) : '',
    });
    setNeedImages([]);
    navigate('/home?create=need');
  };

  const startEditDonation = (donation) => {
    setEditingDonationId(donation.id);
    setDonationForm({
      ngoNeedId: donation.ngo_need_id ? String(donation.ngo_need_id) : '',
      itemName: donation.item_name || '',
      category: donation.category || '',
      gender: donation.gender || '',
      size: donation.size || '',
      quantity: String(donation.quantity || ''),
      condition: donation.condition || 'good',
      country: donation.country || '',
      city: donation.city || '',
      notes: donation.notes || '',
    });
    setDonationImages([]);
    navigate('/home?create=donation');
  };

  const openDonateForNeed = (need) => {
    if (isNgo) return;

    setQuickDonateNeedId(need.id);
    setQuickDonationForm({ quantity: '', description: '' });
    setQuickDonationImages([]);
  };

  const cancelQuickDonate = () => {
    setQuickDonateNeedId(null);
    setQuickDonationForm({ quantity: '', description: '' });
    setQuickDonationImages([]);
  };

  const handleQuickDonateSubmit = async (e, need) => {
    e.preventDefault();

    if (!quickDonationForm.quantity || Number(quickDonationForm.quantity) <= 0) {
      toast.error('Bitte gültige Menge eingeben');
      return;
    }

    if (!quickDonationForm.description.trim()) {
      toast.error('Bitte Beschreibung eingeben');
      return;
    }

    setSubmitting(true);
    try {
      await createDonation({
        ngoNeedId: need.id,
        itemName: need.title,
        category: need.category,
        gender: need.gender || null,
        size: need.size || null,
        quantity: Number(quickDonationForm.quantity),
        condition: 'good',
        country: need.country,
        city: need.city,
        notes: quickDonationForm.description.trim(),
      }, quickDonationImages);

      toast.success('Spendenangebot für den Bedarf gesendet');
      await loadMyDonations();
      cancelQuickDonate();
    } catch (err) {
      toast.error(err.message || 'Spendenangebot konnte nicht gesendet werden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDonationDecision = async (donationId, status) => {
    try {
      await updateDonationDecision(donationId, status);
      toast.success('Status aktualisiert');
      await loadReceivedDonations();
      await loadNeeds();
    } catch (err) {
      toast.error(err.message || 'Status konnte nicht aktualisiert werden');
    }
  };

  const handleDeleteNeed = async (needId) => {
    const confirmed = globalThis.confirm('Bedarf wirklich löschen?');
    if (!confirmed) return;

    try {
      await deleteMyNeed(needId);
      toast.success('Bedarf gelöscht');
      await loadNeeds();
      if (editingNeedId === needId) {
        resetNeedForm();
        navigate('/home');
      }
    } catch (err) {
      toast.error(err.message || 'Bedarf konnte nicht gelöscht werden');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    const confirmed = globalThis.confirm('Spendenangebot wirklich löschen?');
    if (!confirmed) return;

    try {
      await deleteMyDonation(donationId);
      toast.success('Spendenangebot gelöscht');
      await loadMyDonations();
      if (editingDonationId === donationId) {
        resetDonationForm();
        navigate('/home');
      }
    } catch (err) {
      toast.error(err.message || 'Spendenangebot konnte nicht gelöscht werden');
    }
  };

  const openListingDetails = (type, item) => {
    setSelectedListingType(type);
    setSelectedListing(item);
    setSelectedImageIndex(0);
  };

  const closeListingDetails = () => {
    setSelectedListingType(null);
    setSelectedListing(null);
    setSelectedImageIndex(0);
  };

  const selectedImages = useMemo(() => {
    if (!selectedListing) return [];
    return normalizeImageUrls(selectedListing.image_urls).map(toAbsoluteImageUrl).filter(Boolean);
  }, [selectedListing]);

  const hasSelectedImages = selectedImages.length > 0;
  const selectedCoverImage = hasSelectedImages ? selectedImages[selectedImageIndex] : '';

  const showPreviousImage = () => {
    if (!hasSelectedImages) return;
    setSelectedImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  const showNextImage = () => {
    if (!hasSelectedImages) return;
    setSelectedImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ category: '', size: '', location: '' });
  };

  const currentDataForFilter = useMemo(() => {
    if (activeBoardTab === 'needs') return needs;
    if (activeBoardTab === 'my-donations') return myDonations;
    if (activeBoardTab === 'incoming-donations') return receivedDonations;
    return [];
  }, [activeBoardTab, needs, myDonations, receivedDonations]);

  const getAllLocations = () => {
    const locations = currentDataForFilter.map(item => item.city).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const getAllSizes = () => {
    const sizes = currentDataForFilter.map(item => item.size).filter(Boolean);
    return [...new Set(sizes)].sort();
  };

  const filteredNeeds = useMemo(() => {
    return needs.filter((need) => {
      const matchCategory = !filters.category || need.category === filters.category;
      const matchSize = !filters.size || need.size === filters.size;
      const matchLocation = !filters.location || need.city === filters.location;
      return matchCategory && matchSize && matchLocation;
    });
  }, [needs, filters]);

  const filteredMyDonations = useMemo(() => {
    return myDonations.filter((donation) => {
      const matchCategory = !filters.category || donation.category === filters.category;
      const matchSize = !filters.size || donation.size === filters.size;
      const matchLocation = !filters.location || donation.city === filters.location;
      return matchCategory && matchSize && matchLocation;
    });
  }, [myDonations, filters]);

  const filteredReceivedDonations = useMemo(() => {
    return receivedDonations.filter((donation) => {
      const matchCategory = !filters.category || donation.category === filters.category;
      const matchSize = !filters.size || donation.size === filters.size;
      const matchLocation = !filters.location || donation.city === filters.location;
      return matchCategory && matchSize && matchLocation;
    });
  }, [receivedDonations, filters]);

  const renderNeedsContent = () => {
    if (loadingNeeds) {
      return <p className="text-gray-500">Lade Bedarfe...</p>;
    }

    if (filteredNeeds.length === 0) {
      return (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">Keine passenden Bedarfe für die gewählten Filter gefunden.</p>
          {(filters.category || filters.size || filters.location) && (
            <button onClick={resetFilters} className="mt-2 text-brand font-bold text-sm hover:underline">
              Alle Filter zurücksetzen
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredNeeds.map((need) => {
          const needImagesList = normalizeImageUrls(need.image_urls);
          const coverImage = needImagesList[0] ? toAbsoluteImageUrl(needImagesList[0]) : '';
          const needed = Number(need.quantity_needed || 0);
          const received = Number(need.quantity_received || 0);
          const isUrgent = needed > 0 && received / needed < 0.4;
          const isFulfilled = need.status === 'erledigt' || (needed > 0 && received >= needed);

          let statusLabel = isUrgent ? 'Dringend' : 'Normal';
          let statusColor = isUrgent ? 'bg-red-600' : 'bg-emerald-600';

          if (isFulfilled) {
            statusLabel = 'Erledigt';
            statusColor = 'bg-slate-600';
          }

          return (
            <article
              key={need.id}
              onClick={() => openListingDetails('need', need)}
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="h-40 bg-slate-100 relative">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Bedarf Bild"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50" />
                )}
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full text-white ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{need.title}</p>
                  <p className="text-sm text-gray-600">{need.category} • {need.city}, {need.country}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 border-y border-gray-100 py-2">
                  <p>Größe: {need.size || '-'}</p>
                  <p>Benötigt: {need.quantity_needed || 0}</p>
                  <p>Gender: {need.gender || '-'}</p>
                  <p>Erhalten: {need.quantity_received || 0}</p>
                </div>

                {need.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{need.description}</p>
                )}

                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  {isNgo && Number(need.ngo_user_id) === Number(user.id) && (
                    <>
                      <button onClick={() => startEditNeed(need)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">Bearbeiten</button>
                      <button onClick={() => handleDeleteNeed(need.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors">Löschen</button>
                    </>
                  )}
                  {!isNgo && (
                    <button
                      onClick={() => openDonateForNeed(need)}
                      disabled={isFulfilled}
                      className={`w-full text-sm px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isFulfilled 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-brand hover:bg-brand-light text-white'
                      }`}
                    >
                      {isFulfilled ? 'Bedarf gedeckt' : 'Jetzt spenden'}
                    </button>
                  )}
                </div>

                {!isNgo && quickDonateNeedId === need.id && (
                  <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => handleQuickDonateSubmit(e, need)} className="border border-brand/20 bg-brand/5 rounded-xl p-3 grid grid-cols-1 gap-3">
                    <h4 className="text-sm font-bold text-gray-900">Auf diesen Bedarf spenden</h4>
                    <input
                      type="number"
                      min="1"
                      value={quickDonationForm.quantity}
                      onChange={handleQuickQuantityChange}
                      placeholder="Menge"
                      className="px-3 py-2.5 rounded-lg border border-gray-200"
                      required
                    />
                    <textarea
                      value={quickDonationForm.description}
                      onChange={handleQuickDescriptionChange}
                      placeholder="Beschreibung (was genau du spendest)"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 min-h-20"
                      required
                    />
                    <div>
                      <label htmlFor={`quickDonationImages-${need.id}`} className="block text-sm font-medium text-gray-700 mb-1">Bilder (max. 5)</label>
                      <input
                        id={`quickDonationImages-${need.id}`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleQuickDonationImagesChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white"
                      />
                      {quickDonationImages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{quickDonationImages.length} Bild(er) ausgewählt</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button disabled={submitting} className="bg-brand hover:bg-brand-light disabled:opacity-70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                        {submitting ? 'Senden...' : 'An NGO senden'}
                      </button>
                      <button type="button" onClick={cancelQuickDonate} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        Abbrechen
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderMyDonationsContent = () => {
    if (myDonations.length === 0) {
      return <p className="text-gray-500">Du hast noch keine Spendenangebote gesendet.</p>;
    }

    if (filteredMyDonations.length === 0) {
      return (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">Keine passenden Angebote gefunden.</p>
          <button onClick={resetFilters} className="mt-2 text-brand font-bold text-sm hover:underline">
            Alle Filter zurücksetzen
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMyDonations.map((donation) => {
          const donationImagesList = normalizeImageUrls(donation.image_urls);
          const coverImage = donationImagesList[0] ? toAbsoluteImageUrl(donationImagesList[0]) : '';
          let donationTargetLabel = 'Öffentliches Angebot';

          if (donation.ngo_name) {
            donationTargetLabel = `NGO: ${donation.ngo_name}`;
          } else if (donation.ngo_need_id) {
            donationTargetLabel = 'NGO: Bedarf verknüpft';
          }

          return (
            <article
              key={donation.id}
              onClick={() => openListingDetails('my-donation', donation)}
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="h-40 bg-slate-100">
                {coverImage ? (
                  <img src={coverImage} alt="Spende Bild" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50" />
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{donation.item_name}</p>
                  <p className="text-sm text-gray-600">{donation.category} • {donation.city}, {donation.country}</p>
                </div>

                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{donationTargetLabel}</p>
                {donation.notes && <p className="text-sm text-gray-500 line-clamp-2">{donation.notes}</p>}

                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                    {donation.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => startEditDonation(donation)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">Bearbeiten</button>
                    <button onClick={() => handleDeleteDonation(donation.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors">Löschen</button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderReceivedDonationsContent = () => {
    if (receivedDonations.length === 0) {
      return <p className="text-gray-500">Noch keine eingegangenen Spendenangebote.</p>;
    }

    if (filteredReceivedDonations.length === 0) {
      return (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">Keine passenden Angebote gefunden.</p>
          <button onClick={resetFilters} className="mt-2 text-brand font-bold text-sm hover:underline">
            Alle Filter zurücksetzen
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredReceivedDonations.map((donation) => {
          const donationImagesList = normalizeImageUrls(donation.image_urls);
          const coverImage = donationImagesList[0] ? toAbsoluteImageUrl(donationImagesList[0]) : '';

          return (
            <article
              key={donation.id}
              onClick={() => openListingDetails('received-donation', donation)}
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="h-40 bg-slate-100 relative">
                {coverImage ? (
                  <img src={coverImage} alt="Spende Bild" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50" />
                )}
                <span className="absolute top-3 right-3 text-xs font-bold uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {donation.status}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{donation.item_name}</p>
                  <p className="text-sm text-gray-600">{donation.category} • {donation.city}, {donation.country}</p>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>Von: {donation.donor_first_name} {donation.donor_last_name}</p>
                  <p>Bedarf: {donation.need_title || (donation.is_public_offer ? 'Öffentliches Angebot' : '-')}</p>
                </div>

                <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  {donation.status === 'pending' && donation.is_public_offer && (
                    <button
                      onClick={() => handleDonationDecision(donation.id, 'accepted')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Angebot annehmen
                    </button>
                  )}
                  {donation.status === 'pending' && !donation.is_public_offer && (
                    <>
                      <button
                        onClick={() => handleDonationDecision(donation.id, 'accepted')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        Annehmen
                      </button>
                      <button
                        onClick={() => handleDonationDecision(donation.id, 'rejected')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                      >
                        Ablehnen
                      </button>
                    </>
                  )}
                  {donation.status === 'accepted' && (
                    <button
                      onClick={() => handleDonationDecision(donation.id, 'delivered')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold"
                    >
                      Als geliefert markieren
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderBoardContent = () => {
    if (activeBoardTab === 'needs') {
      return renderNeedsContent();
    }

    if (activeBoardTab === 'my-donations') {
      return renderMyDonationsContent();
    }

    return renderReceivedDonationsContent();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isNgo ? `${user.companyName} Dashboard` : `${user.firstName} Dashboard`}
        </h1>
        <p className="text-gray-600 mt-1">
          {isNgo
            ? 'Erstelle und verwalte Bedarfe für deine Organisation.'
            : 'Wähle einen Bedarf aus und sende gezielte Spendenangebote.'}
        </p>
      </div>

      {showCreateSection && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {showNeedForm ? needFormTitle : donationFormTitle}
          </h2>

          {showNeedForm ? (
            <form onSubmit={handleNeedSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="title" value={needForm.title} onChange={handleNeedChange} placeholder="Titel" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              
              <select name="category" value={needForm.category} onChange={handleNeedChange} className="px-3 py-2.5 rounded-lg border border-gray-200" required>
                <option value="">Kategorie auswählen</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select name="gender" value={needForm.gender} onChange={handleNeedChange} className="px-3 py-2.5 rounded-lg border border-gray-200">
                <option value="">Geschlecht (optional)</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <input name="size" value={needForm.size} onChange={handleNeedChange} placeholder="Größe (optional)" className="px-3 py-2.5 rounded-lg border border-gray-200" />
              <input type="number" min="1" name="quantityNeeded" value={needForm.quantityNeeded} onChange={handleNeedChange} placeholder="Benötigte Menge" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <input type="date" name="neededBy" value={needForm.neededBy} onChange={handleNeedChange} className="px-3 py-2.5 rounded-lg border border-gray-200" />
              <input name="country" value={needForm.country} onChange={handleNeedChange} placeholder="Land" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <input name="city" value={needForm.city} onChange={handleNeedChange} placeholder="Stadt" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <textarea name="description" value={needForm.description} onChange={handleNeedChange} placeholder="Beschreibung" className="md:col-span-2 px-3 py-2.5 rounded-lg border border-gray-200 min-h-24" />
              <div className="md:col-span-2">
                <label htmlFor="needImages" className="block text-sm font-medium text-gray-700 mb-1">Bilder (max. 5)</label>
                <input id="needImages" type="file" accept="image/*" multiple onChange={handleNeedImagesChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white" />
                {needImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{needImages.length} Bild(er) ausgewählt</p>
                )}
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg font-medium">
                  {needSubmitText}
                </button>
                {editingNeedId && (
                  <button type="button" onClick={() => { resetNeedForm(); navigate('/home'); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-medium">
                    Abbrechen
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleDonationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="ngoNeedId" value={donationForm.ngoNeedId} onChange={handleDonationChange} className="md:col-span-2 px-3 py-2.5 rounded-lg border border-gray-200">
                <option value="">Keinem Bedarf zuordnen (öffentliches Angebot)</option>
                {needs.map((need) => (
                  <option key={need.id} value={need.id}>
                    {need.title} - {need.ngo_name || 'NGO'} ({need.city}, {need.country})
                  </option>
                ))}
              </select>
              <p className="md:col-span-2 text-xs text-gray-500 -mt-2">
                Optional: Wenn kein Bedarf ausgewählt ist, sehen alle NGOs dein Angebot.
              </p>
              <input name="itemName" value={donationForm.itemName} onChange={handleDonationChange} placeholder="Artikelname" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              
              <select name="category" value={donationForm.category} onChange={handleDonationChange} className="px-3 py-2.5 rounded-lg border border-gray-200" required>
                <option value="">Kategorie auswählen</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select name="gender" value={donationForm.gender} onChange={handleDonationChange} className="px-3 py-2.5 rounded-lg border border-gray-200">
                <option value="">Geschlecht (optional)</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <input name="size" value={donationForm.size} onChange={handleDonationChange} placeholder="Größe (optional)" className="px-3 py-2.5 rounded-lg border border-gray-200" />
              <input type="number" min="1" name="quantity" value={donationForm.quantity} onChange={handleDonationChange} placeholder="Menge" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <select name="condition" value={donationForm.condition} onChange={handleDonationChange} className="px-3 py-2.5 rounded-lg border border-gray-200">
                <option value="new">Neu</option>
                <option value="like_new">Wie neu</option>
                <option value="good">Gut</option>
                <option value="acceptable">Akzeptabel</option>
              </select>
              <input name="country" value={donationForm.country} onChange={handleDonationChange} placeholder="Land" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <input name="city" value={donationForm.city} onChange={handleDonationChange} placeholder="Stadt" className="px-3 py-2.5 rounded-lg border border-gray-200" required />
              <textarea name="notes" value={donationForm.notes} onChange={handleDonationChange} placeholder="Notizen (optional)" className="md:col-span-2 px-3 py-2.5 rounded-lg border border-gray-200 min-h-24" />
              <div className="md:col-span-2">
                <label htmlFor="donationImages" className="block text-sm font-medium text-gray-700 mb-1">Bilder (max. 5)</label>
                <input id="donationImages" type="file" accept="image/*" multiple onChange={handleDonationImagesChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white" />
                {donationImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{donationImages.length} Bild(er) ausgewählt</p>
                )}
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button disabled={submitting} className="bg-brand hover:bg-brand-light disabled:opacity-70 text-white px-5 py-2.5 rounded-lg font-medium">
                  {donationSubmitText}
                </button>
                {editingDonationId && (
                  <button type="button" onClick={() => { resetDonationForm(); navigate('/home'); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-medium">
                    Abbrechen
                  </button>
                )}
              </div>
            </form>
          )}
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Angebote & Bedarf</h2>
            <p className="text-sm text-gray-500 mt-1">Alle neuen Einträge erscheinen automatisch in dieser Übersicht.</p>
          </div>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            {boardTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBoardTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  activeBoardTab === tab.id
                    ? 'bg-white text-brand shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 py-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-500 mr-2">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtern:</span>
          </div>

            <div className="relative group min-w-[140px]">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer pr-10"
              >
                <option value="">Kategorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group min-w-[140px]">
              <select
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer pr-10"
              >
                <option value="">Größe</option>
                {getAllSizes().map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group min-w-[140px]">
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer pr-10"
              >
                <option value="">Standort</option>
                {getAllLocations().map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={resetFilters}
              className="ml-auto flex items-center gap-2 text-brand font-bold text-sm hover:underline"
            >
              <RotateCcw size={14} />
              Filter zurücksetzen
            </button>
          </div>
        

        {renderBoardContent()}
      </section>

      {selectedListing && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto" onClick={closeListingDetails}>
          <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {selectedListingType === 'need' ? 'Bedarf Details' : 'Spendenangebot Details'}
              </h3>
              <button
                type="button"
                onClick={closeListingDetails}
                className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative bg-slate-100 min-h-72">
                {selectedCoverImage ? (
                  <img src={selectedCoverImage} alt="Detailbild" className="w-full h-full object-cover min-h-72" />
                ) : (
                  <div className="w-full h-full min-h-72 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50" />
                )}

                {selectedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white text-xl"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white text-xl"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedImages.map((_, index) => (
                        <button
                          key={`dot-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`h-2.5 w-2.5 rounded-full ${index === selectedImageIndex ? 'bg-white' : 'bg-white/50'}`}
                          aria-label={`Bild ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedListingType === 'need' ? selectedListing.title : selectedListing.item_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(selectedListing.category || '-')}
                    {' • '}
                    {(selectedListing.city || '-')}, {(selectedListing.country || '-')}
                  </p>
                </div>

                {selectedListingType === 'need' ? (
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p>Benötigt: <span className="font-semibold">{selectedListing.quantity_needed || 0}</span></p>
                    <p>Erhalten: <span className="font-semibold">{selectedListing.quantity_received || 0}</span></p>
                    <p>Größe: <span className="font-semibold">{selectedListing.size || '-'}</span></p>
                    <p>Gender: <span className="font-semibold">{selectedListing.gender || '-'}</span></p>
                    <p className="col-span-2">NGO: <span className="font-semibold">{selectedListing.ngo_name || 'NGO'}</span></p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p>Menge: <span className="font-semibold">{selectedListing.quantity || 0}</span></p>
                    <p>Status: <span className="font-semibold uppercase">{selectedListing.status || '-'}</span></p>
                    <p>Größe: <span className="font-semibold">{selectedListing.size || '-'}</span></p>
                    <p>Zustand: <span className="font-semibold">{selectedListing.condition || '-'}</span></p>
                    {selectedListingType === 'received-donation' && (
                      <p className="col-span-2">Von: <span className="font-semibold">{selectedListing.donor_first_name || ''} {selectedListing.donor_last_name || ''}</span></p>
                    )}
                    <p className="col-span-2">Bedarf: <span className="font-semibold">{selectedListing.need_title || (selectedListing.is_public_offer ? 'Öffentliches Angebot' : '-')}</span></p>
                  </div>
                )}

                {selectedListingType === 'need' && selectedListing.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Beschreibung</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedListing.description}</p>
                  </div>
                )}

                {selectedListingType !== 'need' && selectedListing.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Notizen</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedListing.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
