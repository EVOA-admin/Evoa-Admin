import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiSaveLine, RiArrowLeftLine, RiArrowDownSLine, RiArrowUpSLine,
  RiImageAddLine, RiMagicLine, RiSeoLine, RiInformationLine, RiMapPinLine, RiTicketLine,
  RiUserStarLine, RiAddLine, RiDeleteBinLine, RiCloseLine, RiCheckLine
} from 'react-icons/ri';

const DEFAULT_ROLE_PRICING = {
  startup: { price: 999, originalPrice: 4497, badgeText: 'POPULAR PASS', isActive: true },
  investor: { price: 0, originalPrice: 1999, badgeText: 'FREE VIP PASS', isActive: true },
  incubator: { price: 499, originalPrice: 2499, badgeText: 'ECOSYSTEM PASS', isActive: true },
  viewer: { price: 0, originalPrice: 999, badgeText: 'FREE ACCESS', isActive: true },
};

const DEFAULT_ROLE_BENEFITS = {
  startup: [
    { title: 'Live Startup Pitch', desc: 'Pitch 1-on-1 to active VCs & Angel Investors.' },
    { title: '1 Month EVOA Premium', desc: 'Unlock pitch boosts & verified badge.' },
    { title: 'Investor Networking', desc: 'Direct access to investor directory.' },
  ],
  investor: [
    { title: 'Access to Startup Pitches', desc: 'Evaluate curated 3-minute pitch reels.' },
    { title: 'Founder Networking', desc: 'Schedule 1-on-1 meetings with founders.' },
    { title: 'Investor Lounge', desc: 'Exclusive investor networking channel.' },
  ],
  incubator: [
    { title: 'Startup Discovery', desc: 'Discover high-potential seed startups.' },
    { title: 'Partnership Opportunities', desc: 'Co-incubate and mentor cohort founders.' },
    { title: 'Incubator Branding', desc: 'Featured logo placement in event hub.' },
  ],
  viewer: [
    { title: 'Event Access', desc: 'Watch live pitch streams in real time.' },
    { title: 'Startup Showcase', desc: 'Browse top performing startup reels.' },
    { title: 'Community Access', desc: 'Participate in live Q&A & polls.' },
  ],
};

const ROLES = [
  { key: 'startup', label: 'Startup' },
  { key: 'investor', label: 'Investor' },
  { key: 'incubator', label: 'Incubator' },
  { key: 'viewer', label: 'Viewer' },
];

export default function EventForm({ initialData = {}, onSubmit, saving, errorMsg, successMsg, isEdit = false }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');

  // Banner Image handling (Upload vs URL)
  const initialBanner = initialData.banner_url || initialData.bannerUrl || initialData.poster_url || initialData.posterUrl || '';
  const isInitialUpload = initialBanner.startsWith('data:') || initialBanner.startsWith('blob:');
  const [uploadedImage, setUploadedImage] = useState(isInitialUpload ? initialBanner : '');
  const [fileName, setFileName] = useState(isInitialUpload ? 'Uploaded banner image' : '');
  const [imageUrlInput, setImageUrlInput] = useState(!isInitialUpload ? initialBanner : '');

  const hasUpload = Boolean(uploadedImage);
  const hasUrl = Boolean(imageUrlInput.trim());

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setFileName(file.name);
      setImageUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleClearUploadedImage = () => {
    setUploadedImage('');
    setFileName('');
  };

  const handleImageUrlChange = (e) => {
    const val = e.target.value;
    setImageUrlInput(val);
    if (val.trim()) {
      setUploadedImage('');
      setFileName('');
    }
  };

  const handleClearImageUrl = () => {
    setImageUrlInput('');
  };

  const [organizer, setOrganizer] = useState(initialData.organizer || '');
  const [venueType, setVenueType] = useState(initialData.venue_type || initialData.venueType || 'hybrid');
  const [eventType, setEventType] = useState(initialData.event_type || initialData.eventType || 'event_with_subscription');

  // Schedule & Location
  const [startDate, setStartDate] = useState(initialData.start_date || initialData.startDate || '');
  const [startTime, setStartTime] = useState(initialData.start_time || initialData.startTime || '');
  const [endDate, setEndDate] = useState(initialData.end_date || initialData.endDate || '');
  const [endTime, setEndTime] = useState(initialData.end_time || initialData.endTime || '');
  const [venueName, setVenueName] = useState(initialData.venue_name || initialData.venueName || initialData.meeting_url || initialData.meetingUrl || '');
  const [city, setCity] = useState(initialData.city || '');

  // Registration & General Seat Limit
  const initialTickets = initialData.tickets || [];
  const primaryTicket = initialTickets[0] || {};
  const isInitiallyPaid = (primaryTicket.price && parseFloat(primaryTicket.price) > 0) || false;

  const [registrationType, setRegistrationType] = useState(isInitiallyPaid ? 'paid' : 'free');
  const [maxAttendees, setMaxAttendees] = useState(initialData.max_attendees ?? initialData.maxAttendees ?? primaryTicket.seatCount ?? '');
  const [ticketPrice, setTicketPrice] = useState(primaryTicket.price ? parseFloat(primaryTicket.price) : 999);
  const [totalSeats, setTotalSeats] = useState(primaryTicket.seatCount || 50);

  // Role-Wise Pricing & Benefits State
  const [rolePricing, setRolePricing] = useState(() => {
    const raw = initialData.role_pricing || initialData.rolePricing;
    return raw ? { ...DEFAULT_ROLE_PRICING, ...raw } : DEFAULT_ROLE_PRICING;
  });

  const [roleBenefits, setRoleBenefits] = useState(() => {
    const raw = initialData.role_benefits || initialData.roleBenefits;
    return raw ? { ...DEFAULT_ROLE_BENEFITS, ...raw } : DEFAULT_ROLE_BENEFITS;
  });

  const [activeRoleTab, setActiveRoleTab] = useState('startup');

  // Highlights (Single Textarea — one per line)
  const initialHighlightsStr = Array.isArray(initialData.highlights)
    ? initialData.highlights.map(h => typeof h === 'string' ? h : (h.label || h.value || '')).filter(Boolean).join('\n')
    : '';
  const [highlightsText, setHighlightsText] = useState(initialHighlightsStr);

  // Status & Featured
  const [isFeatured, setIsFeatured] = useState(initialData.is_featured ?? initialData.isFeatured ?? false);
  const [status, setStatus] = useState(initialData.status || 'published');

  // Advanced SEO Settings (Collapsible Accordion)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [metaTitle, setMetaTitle] = useState(initialData.meta_title || initialData.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData.meta_description || initialData.metaDescription || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialData.og_image_url || initialData.ogImageUrl || '');

  // Role Pricing & Benefit Handlers
  const handleRolePricingChange = (role, field, val) => {
    setRolePricing(prev => ({
      ...prev,
      [role]: {
        ...(prev[role] || {}),
        [field]: val,
      },
    }));
  };

  const handleAddRoleBenefit = (role) => {
    setRoleBenefits(prev => ({
      ...prev,
      [role]: [...(prev[role] || []), { title: '', desc: '' }],
    }));
  };

  const handleRoleBenefitChange = (role, idx, field, val) => {
    setRoleBenefits(prev => {
      const list = [...(prev[role] || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, [role]: list };
    });
  };

  const handleRemoveRoleBenefit = (role, idx) => {
    setRoleBenefits(prev => ({
      ...prev,
      [role]: (prev[role] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate Banner Upload / Image URL - must provide only one
    const bannerUrl = uploadedImage || imageUrlInput.trim();
    if (!bannerUrl) {
      alert('Please upload a banner image or enter an image URL.');
      return;
    }

    if (uploadedImage && imageUrlInput.trim()) {
      alert('Please provide either an uploaded image or an image URL, not both.');
      return;
    }

    // Convert newline-separated highlights text into clean array
    const parsedHighlights = highlightsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(item => ({ label: item, value: '' }));

    // Prepare tickets array based on Free vs Paid selection
    const priceNum = registrationType === 'paid' ? parseFloat(ticketPrice) || 0 : 0;
    const seatsNum = registrationType === 'paid'
      ? (totalSeats ? parseInt(totalSeats, 10) : 50)
      : (maxAttendees ? parseInt(maxAttendees, 10) : 100);

    const ticketObj = {
      id: primaryTicket.id || undefined,
      name: priceNum > 0 ? `${title} Event Pass` : 'Free Entry Pass',
      description: priceNum > 0 ? `Access Pass for ${title}` : 'Free General Admission',
      price: priceNum,
      originalPrice: priceNum > 0 ? Math.round(priceNum * 1.5) : 0,
      seatCount: seatsNum,
      remainingSeats: seatsNum,
      isActive: true,
      badgeText: priceNum > 0 ? 'OFFICIAL PASS' : 'FREE ENTRY',
    };

    const payload = {
      title,
      description,
      subtitle: description ? description.slice(0, 120) : title,
      bannerUrl,
      posterUrl: bannerUrl,
      organizer: organizer || 'EVOA',
      venueType,
      eventType: (eventType === 'event' || eventType === 'event_only') ? 'event_only' : 'event_with_subscription',
      startDate,
      endDate,
      startTime,
      endTime,
      venueName,
      meetingUrl: venueType !== 'offline' ? venueName : undefined,
      city,
      isRegistrationOpen: true,
      allowBookings: true,
      showRemainingSeats: true,
      maxAttendees: seatsNum,
      highlights: parsedHighlights,
      isFeatured,
      status,
      tickets: [ticketObj],
      rolePricing,
      roleBenefits,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
      ogImageUrl: ogImageUrl || bannerUrl,
    };

    onSubmit(payload);
  };

  const currentRolePricing = rolePricing[activeRoleTab] || { price: 0, originalPrice: 0, badgeText: '', isActive: true };
  const currentRoleBenefits = roleBenefits[activeRoleTab] || [];

  return (
    <form className="blog-form" style={{ maxWidth: 840 }} onSubmit={handleSubmit}>
      {/* Alert Messages */}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ── CARD 1: PRIMARY EVENT DETAILS ── */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
          <RiInformationLine size={18} style={{ color: 'var(--color-primary)' }} /> Event Details
        </h3>

        <div className="form-grid">
          {/* Event Title */}
          <div className="form-group form-full">
            <label className="form-label">Event Title <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. PitchIn 180 Seconds"
            />
          </div>

          {/* Short Description */}
          <div className="form-group form-full">
            <label className="form-label">Short Description <span className="required">*</span></label>
            <textarea
              className="form-textarea"
              rows={3}
              style={{ minHeight: 90 }}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a quick summary of what the event is about…"
            />
          </div>

          {/* Banner Upload / Image URL Field */}
          <div className="form-group form-full">
            <label className="form-label">Banner Upload / Image URL <span className="required">*</span></label>
            <div className="banner-input-container">
              {/* Option 1: Upload Image */}
              <div className={`banner-upload-box ${hasUrl ? 'banner-box-disabled' : ''}`}>
                {!hasUpload ? (
                  <label className={`banner-file-dropzone ${hasUrl ? 'dropzone-disabled' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={hasUrl}
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-content">
                      <RiImageAddLine size={28} className="dropzone-icon" />
                      <div className="dropzone-text-group">
                        <span className="dropzone-title">
                          {hasUrl ? 'Upload disabled (Image URL is active)' : 'Click to Upload Banner Image'}
                        </span>
                        <span className="dropzone-subtitle">
                          {hasUrl ? 'Clear the Image URL field below to upload an image file' : 'PNG, JPG, WEBP, or GIF (Max 5MB)'}
                        </span>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="banner-preview-card">
                    <div className="banner-preview-wrapper">
                      <img src={uploadedImage} alt="Uploaded Banner Preview" className="cover-preview" />
                      <div className="banner-preview-overlay">
                        <span className="banner-file-name">{fileName || 'Uploaded Image'}</span>
                        <button
                          type="button"
                          className="banner-remove-btn"
                          onClick={handleClearUploadedImage}
                          title="Remove uploaded image"
                        >
                          <RiDeleteBinLine size={16} /> Remove Image
                        </button>
                      </div>
                    </div>
                    <div className="banner-status-badge">
                      <RiCheckLine size={14} /> Image Uploaded &amp; Selected
                    </div>
                  </div>
                )}
              </div>

              {/* OR Separator */}
              <div className="banner-or-divider">
                <span className="banner-or-line"></span>
                <span className="banner-or-badge">OR</span>
                <span className="banner-or-line"></span>
              </div>

              {/* Option 2: Image URL Input */}
              <div className={`banner-url-box ${hasUpload ? 'banner-box-disabled' : ''}`}>
                <div className="url-input-wrapper">
                  <input
                    type="url"
                    className="form-input"
                    value={imageUrlInput}
                    onChange={handleImageUrlChange}
                    disabled={hasUpload}
                    placeholder={
                      hasUpload
                        ? "Disabled — Clear uploaded image above to enter an Image URL"
                        : "https://images.unsplash.com/photo-... or Supabase URL"
                    }
                  />
                  {hasUrl && !hasUpload && (
                    <button
                      type="button"
                      className="url-clear-btn"
                      onClick={handleClearImageUrl}
                      title="Clear Image URL"
                    >
                      <RiCloseLine size={18} />
                    </button>
                  )}
                </div>

                {hasUrl && !hasUpload && (
                  <div className="banner-preview-wrapper" style={{ marginTop: 8 }}>
                    <img
                      src={imageUrlInput}
                      alt="Banner URL Preview"
                      className="cover-preview"
                      onError={e => e.target.style.display = 'none'}
                    />
                    <div className="banner-status-badge" style={{ padding: '4px 8px' }}>
                      <RiCheckLine size={14} /> Image URL Active
                    </div>
                  </div>
                )}

                {hasUpload && (
                  <span className="banner-helper-text">
                    Image URL field is disabled because an image file has been uploaded above.
                  </span>
                )}
                {hasUrl && (
                  <span className="banner-helper-text">
                    Upload Image option is disabled because an Image URL is entered above.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="form-group">
            <label className="form-label">Organizer</label>
            <input
              type="text"
              className="form-input"
              value={organizer}
              onChange={e => setOrganizer(e.target.value)}
              placeholder="e.g. EVOA & PitchIn Network"
            />
          </div>

          {/* Venue Mode / Format */}
          <div className="form-group">
            <label className="form-label">Venue Mode / Format</label>
            <select
              className="form-select"
              value={venueType}
              onChange={e => setVenueType(e.target.value)}
            >
              <option value="online">Online (Virtual)</option>
              <option value="offline">Offline (In-Person)</option>
              <option value="hybrid">Hybrid (Offline + Online)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CARD 2: SCHEDULE & LOCATION ── */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
          <RiMapPinLine size={18} style={{ color: 'var(--color-primary)' }} /> Schedule & Location
        </h3>

        <div className="form-grid">
          {/* Start Date & Time */}
          <div className="form-group">
            <label className="form-label">Start Date <span className="required">*</span></label>
            <input
              type="date"
              className="form-input"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Time <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              placeholder="e.g. 16:00 IST"
            />
          </div>

          {/* End Date & Time */}
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              type="text"
              className="form-input"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              placeholder="e.g. 19:00 IST"
            />
          </div>

          {/* Venue / Meeting Link */}
          <div className="form-group">
            <label className="form-label">Venue Name / Meeting Link</label>
            <input
              type="text"
              className="form-input"
              value={venueName}
              onChange={e => setVenueName(e.target.value)}
              placeholder="e.g. Zoom Meeting Link or Main Stage Hall"
            />
          </div>

          {/* City */}
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-input"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Bengaluru"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 3: ROLE-WISE PRICING & BENEFITS (DYNAMIC) ── */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
          <RiUserStarLine size={18} style={{ color: 'var(--color-primary)' }} /> Role-Wise Pricing & Benefits
        </h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          Configure custom pricing, discounts, badge callouts, and benefit bullet points for each user role.
        </p>

        {/* Role Selector Tabs */}
        <div className="radio-group" style={{ marginBottom: 20, gap: 8 }}>
          {ROLES.map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => setActiveRoleTab(r.key)}
              className={`radio-label ${activeRoleTab === r.key ? 'radio-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Selected Role Panel */}
        <div style={{ background: 'var(--color-bg)', padding: 20, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          <div className="panel-header-row" style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-primary)' }}>
              {activeRoleTab} Role Settings
            </h4>
            <label className={`radio-label ${currentRolePricing.isActive ? 'radio-active' : ''}`} style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={currentRolePricing.isActive}
                onChange={e => handleRolePricingChange(activeRoleTab, 'isActive', e.target.checked)}
              />
              Ticket Available for {activeRoleTab}
            </label>
          </div>

          {/* Pricing Grid */}
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Offer Price (₹)</label>
              <input
                type="number"
                className="form-input"
                value={currentRolePricing.price ?? 0}
                onChange={e => handleRolePricingChange(activeRoleTab, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0 for Free"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Original Price (₹)</label>
              <input
                type="number"
                className="form-input"
                value={currentRolePricing.originalPrice ?? 0}
                onChange={e => handleRolePricingChange(activeRoleTab, 'originalPrice', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 1999"
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Badge Callout Text</label>
              <input
                type="text"
                className="form-input"
                value={currentRolePricing.badgeText || ''}
                onChange={e => handleRolePricingChange(activeRoleTab, 'badgeText', e.target.value)}
                placeholder="e.g. POPULAR PASS, FREE VIP PASS"
              />
            </div>
          </div>

          {/* Role Benefits Manager */}
          <div>
            <div className="panel-header-row" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ margin: 0 }}>
                {activeRoleTab.toUpperCase()} BENEFITS LIST
              </label>
              <button
                type="button"
                onClick={() => handleAddRoleBenefit(activeRoleTab)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <RiAddLine size={14} /> Add Benefit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentRoleBenefits.map((b, idx) => (
                <div key={idx} className="form-card" style={{ padding: 14, background: 'var(--color-surface)' }}>
                  <div className="inline-form" style={{ marginBottom: 8, gap: 10 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, fontWeight: 600 }}
                      value={b.title}
                      onChange={e => handleRoleBenefitChange(activeRoleTab, idx, 'title', e.target.value)}
                      placeholder="Benefit Title (e.g. Live Startup Pitch)"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRoleBenefit(activeRoleTab, idx)}
                      className="btn btn-xs btn-danger-outline"
                    >
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={b.desc || ''}
                    onChange={e => handleRoleBenefitChange(activeRoleTab, idx, 'desc', e.target.value)}
                    placeholder="Benefit Description (e.g. Pitch 1-on-1 to active VCs)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: HIGHLIGHTS ── */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
          <RiMagicLine size={18} style={{ color: 'var(--color-primary)' }} /> Highlights
        </h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Enter key event highlights (one per line). These will be displayed as badge callouts on the event page.
        </p>

        <div className="form-group">
          <textarea
            className="form-textarea"
            rows={5}
            style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 13 }}
            value={highlightsText}
            onChange={e => setHighlightsText(e.target.value)}
            placeholder={`Live Pitching\n500+ Investors\nNetworking\nCertificates\nPremium Access`}
          />
        </div>
      </div>

      {/* ── CARD 5: PUBLICATION STATUS & FEATURED ── */}
      <div className="form-card" style={{ marginBottom: 20 }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="radio-group">
              <label className={`radio-label ${status === 'draft' ? 'radio-active' : ''}`}>
                <input
                  type="radio"
                  name="pub_status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={e => setStatus(e.target.value)}
                />
                <span className="radio-dot radio-dot-draft" />
                Draft
              </label>

              <label className={`radio-label ${status === 'published' ? 'radio-active' : ''}`}>
                <input
                  type="radio"
                  name="pub_status"
                  value="published"
                  checked={status === 'published'}
                  onChange={e => setStatus(e.target.value)}
                />
                <span className="radio-dot radio-dot-published" />
                Published
              </label>
            </div>
          </div>

          <div className="form-group" style={{ justifyContent: 'center' }}>
            <label className="form-label">Featured Event</label>
            <label className={`radio-label ${isFeatured ? 'radio-active' : ''}`} style={{ marginTop: 4 }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
              />
              Show as Featured Event on Home Page
            </label>
          </div>
        </div>
      </div>

      {/* ── CARD 6: ADVANCED SETTINGS (COLLAPSIBLE) ── */}
      <div className="form-card" style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 14, fontWeight: 700, color: 'var(--color-text)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RiSeoLine size={18} style={{ color: 'var(--color-primary)' }} /> Advanced Settings (SEO)
          </span>
          {showAdvanced ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
        </button>

        {showAdvanced && (
          <div className="form-grid" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <div className="form-group form-full">
              <label className="form-label">SEO Title</label>
              <input
                type="text"
                className="form-input"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="Meta Title for search engines"
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">SEO Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                style={{ minHeight: 70 }}
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                placeholder="Meta Description for search engine previews"
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Social Share Image (OG Image URL)</label>
              <input
                type="url"
                className="form-input"
                value={ogImageUrl}
                onChange={e => setOgImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Action Footer */}
      <div className="form-actions" style={{ gap: 12 }}>
        <Link to="/events" className="btn btn-secondary">
          <RiArrowLeftLine size={16} /> Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px' }}
        >
          <RiSaveLine size={18} />
          {saving ? 'Publishing Event…' : (isEdit ? 'Save Event' : 'Publish Event')}
        </button>
      </div>
    </form>
  );
}
