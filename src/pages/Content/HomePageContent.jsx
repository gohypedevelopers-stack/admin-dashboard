import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, GripVertical, House } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const defaultAction = (index = 0) => ({
  id: `action-${Date.now()}-${index}`,
  label: '',
  image: '',
  routeKey: '',
  isVisible: true,
  displayOrder: index,
});

const defaultSectionItem = (index = 0) => ({
  title: '',
  description: '',
  image: '',
  routeKey: '',
  isActive: true,
  displayOrder: index,
});

const defaultState = {
  banner: {
    backgroundImage: '',
    videoUrl: '',
    bookServiceLabel: 'Book a Service',
    giveServiceLabel: 'Give a Service',
    supportLabel: 'Support',
    searchPlaceholder: 'Search doctor, drugs, articles...',
  },
  quickActions: [],
  departmentsSection: {
    isVisible: true,
    title: 'Hospital Departments',
    subtitle: '',
    ctaText: 'View All',
    items: [],
  },
  mostBookedSection: {
    isVisible: true,
    title: 'Most Booked Services',
    subtitle: '',
    ctaText: '',
    items: [],
  },
  promoBanner: {
    isVisible: true,
    eyebrow: '',
    title: '',
    description: '',
    image: '',
    buttonText: 'Book Now',
    routeKey: 'services',
    startColor: '#2F49D0',
    endColor: '#18C2A5',
  },
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 20,
  padding: 20,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#334155',
};

const HomePageContent = () => {
  const [form, setForm] = useState(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const payload = await apiRequest('/api/admin/home-content');
        if (!active) return;
        setForm({
          ...defaultState,
          ...payload?.data,
          banner: { ...defaultState.banner, ...(payload?.data?.banner || {}) },
          quickActions: Array.isArray(payload?.data?.quickActions) ? payload.data.quickActions : [],
          departmentsSection: {
            ...defaultState.departmentsSection,
            ...(payload?.data?.departmentsSection || {}),
            items: Array.isArray(payload?.data?.departmentsSection?.items)
              ? payload.data.departmentsSection.items
              : [],
          },
          mostBookedSection: {
            ...defaultState.mostBookedSection,
            ...(payload?.data?.mostBookedSection || {}),
            items: Array.isArray(payload?.data?.mostBookedSection?.items)
              ? payload.data.mostBookedSection.items
              : [],
          },
          promoBanner: { ...defaultState.promoBanner, ...(payload?.data?.promoBanner || {}) },
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Failed to load home content');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const updateRoot = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNested = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateArrayItem = (section, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateSectionItem = (section, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item
        ),
      },
    }));
  };

  const addQuickAction = () => {
    updateRoot('quickActions', [...form.quickActions, defaultAction(form.quickActions.length)]);
  };

  const addSectionItem = (section) => {
    updateNested(section, 'items', [
      ...form[section].items,
      defaultSectionItem(form[section].items.length),
    ]);
  };

  const removeQuickAction = (index) => {
    updateRoot(
      'quickActions',
      form.quickActions.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const removeSectionItem = (section, index) => {
    updateNested(
      section,
      'items',
      form[section].items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = await apiRequest('/api/admin/home-content', {
        method: 'PUT',
        body: form,
      });
      setMessage(payload?.message || 'Home content saved');
    } catch (err) {
      setError(err?.message || 'Failed to save home content');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label, value, onChange, options = {}) => (
    <label>
      <span style={labelStyle}>{label}</span>
      {options.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={options.rows || 3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
        />
      ) : (
        <input
          type={options.type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </label>
  );

  const renderSectionItemEditor = (sectionKey, item, index) => (
    <div
      key={`${sectionKey}-${index}`}
      style={{
        border: '1px solid #dbe4f0',
        borderRadius: 16,
        padding: 16,
        background: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <GripVertical size={18} color="#94a3b8" />
          <strong style={{ color: '#0f172a' }}>{item.title || `Item ${index + 1}`}</strong>
        </div>
        <button
          type="button"
          onClick={() => removeSectionItem(sectionKey, index)}
          style={{
            border: 'none',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 10,
            width: 36,
            height: 36,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {renderInput('Title', item.title, (value) => updateSectionItem(sectionKey, index, 'title', value))}
        {renderInput('Image URL / asset path', item.image, (value) => updateSectionItem(sectionKey, index, 'image', value))}
        {renderInput('Route key', item.routeKey, (value) => updateSectionItem(sectionKey, index, 'routeKey', value))}
        {renderInput('Display order', item.displayOrder, (value) => updateSectionItem(sectionKey, index, 'displayOrder', Number(value)), { type: 'number' })}
        {renderInput('Description', item.description || '', (value) => updateSectionItem(sectionKey, index, 'description', value), { multiline: true, rows: 3 })}
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>
        <input
          type="checkbox"
          checked={item.isActive}
          onChange={(e) => updateSectionItem(sectionKey, index, 'isActive', e.target.checked)}
        />
        Show this item in app
      </label>
    </div>
  );

  if (loading) {
    return <div style={{ padding: 28 }}>Loading home content...</div>;
  }

  return (
    <div style={{ padding: 24, display: 'grid', gap: 20, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#e0e7ff', color: '#3147d3', display: 'grid', placeItems: 'center' }}>
            <House size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: '#0f172a' }}>App Home Content</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              Control the mobile app home page banner, cards, sections, and promo content.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            border: 'none',
            background: '#3147d3',
            color: '#fff',
            borderRadius: 14,
            padding: '12px 18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Home Content'}
        </button>
      </div>

      {(message || error) && (
        <div
          style={{
            ...cardStyle,
            borderColor: error ? '#fecaca' : '#bfdbfe',
            background: error ? '#fff1f2' : '#eff6ff',
            color: error ? '#b91c1c' : '#1d4ed8',
          }}
        >
          {error || message}
        </div>
      )}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Banner</h2>
        <p style={{ marginTop: 6, color: '#64748b' }}>Edit the hero image, button labels, search text, and video URL.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {renderInput('Background image', form.banner.backgroundImage, (value) => updateNested('banner', 'backgroundImage', value))}
          {renderInput('Video URL', form.banner.videoUrl, (value) => updateNested('banner', 'videoUrl', value))}
          {renderInput('Book button label', form.banner.bookServiceLabel, (value) => updateNested('banner', 'bookServiceLabel', value))}
          {renderInput('Give service label', form.banner.giveServiceLabel, (value) => updateNested('banner', 'giveServiceLabel', value))}
          {renderInput('Support label', form.banner.supportLabel, (value) => updateNested('banner', 'supportLabel', value))}
          {renderInput('Search placeholder', form.banner.searchPlaceholder, (value) => updateNested('banner', 'searchPlaceholder', value))}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Quick Actions</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>Top small cards below the banner.</p>
          </div>
          <button type="button" onClick={addQuickAction} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <Plus size={16} />
            Add Action
          </button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {form.quickActions.map((item, index) => (
            <div key={item.id || index} style={{ border: '1px solid #dbe4f0', borderRadius: 16, padding: 16, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <strong>{item.label || `Action ${index + 1}`}</strong>
                <button type="button" onClick={() => removeQuickAction(index)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: 10, width: 36, height: 36, cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {renderInput('ID', item.id, (value) => updateArrayItem('quickActions', index, 'id', value))}
                {renderInput('Label', item.label, (value) => updateArrayItem('quickActions', index, 'label', value))}
                {renderInput('Image URL / asset path', item.image, (value) => updateArrayItem('quickActions', index, 'image', value))}
                {renderInput('Route key', item.routeKey, (value) => updateArrayItem('quickActions', index, 'routeKey', value))}
                {renderInput('Display order', item.displayOrder, (value) => updateArrayItem('quickActions', index, 'displayOrder', Number(value)), { type: 'number' })}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={(e) => updateArrayItem('quickActions', index, 'isVisible', e.target.checked)}
                />
                Show this action in app
              </label>
            </div>
          ))}
        </div>
      </section>

      <SectionEditor
        title="Hospital Departments"
        description="Grid section on the home page."
        section={form.departmentsSection}
        onSectionChange={(key, value) => updateNested('departmentsSection', key, value)}
        onAddItem={() => addSectionItem('departmentsSection')}
      >
        {form.departmentsSection.items.map((item, index) =>
          renderSectionItemEditor('departmentsSection', item, index)
        )}
      </SectionEditor>

      <SectionEditor
        title="Most Booked Services"
        description="Horizontal service cards section."
        section={form.mostBookedSection}
        onSectionChange={(key, value) => updateNested('mostBookedSection', key, value)}
        onAddItem={() => addSectionItem('mostBookedSection')}
      >
        {form.mostBookedSection.items.map((item, index) =>
          renderSectionItemEditor('mostBookedSection', item, index)
        )}
      </SectionEditor>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Promo Banner</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>Bottom gradient card on the home page.</p>
          </div>
          <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#334155' }}>
            <input
              type="checkbox"
              checked={form.promoBanner.isVisible}
              onChange={(e) => updateNested('promoBanner', 'isVisible', e.target.checked)}
            />
            Show section
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {renderInput('Eyebrow text', form.promoBanner.eyebrow, (value) => updateNested('promoBanner', 'eyebrow', value))}
          {renderInput('Title', form.promoBanner.title, (value) => updateNested('promoBanner', 'title', value))}
          {renderInput('Image URL / asset path', form.promoBanner.image, (value) => updateNested('promoBanner', 'image', value))}
          {renderInput('Button text', form.promoBanner.buttonText, (value) => updateNested('promoBanner', 'buttonText', value))}
          {renderInput('Route key', form.promoBanner.routeKey, (value) => updateNested('promoBanner', 'routeKey', value))}
          {renderInput('Start color', form.promoBanner.startColor, (value) => updateNested('promoBanner', 'startColor', value))}
          {renderInput('End color', form.promoBanner.endColor, (value) => updateNested('promoBanner', 'endColor', value))}
          {renderInput('Description', form.promoBanner.description, (value) => updateNested('promoBanner', 'description', value), { multiline: true, rows: 4 })}
        </div>
      </section>
    </div>
  );
};

const SectionEditor = ({ title, description, section, onSectionChange, onAddItem, children }) => (
  <section style={cardStyle}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ margin: '6px 0 0', color: '#64748b' }}>{description}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#334155' }}>
          <input
            type="checkbox"
            checked={section.isVisible}
            onChange={(e) => onSectionChange('isVisible', e.target.checked)}
          />
          Show section
        </label>
        <button type="button" onClick={onAddItem} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
          <Plus size={16} />
          Add Item
        </button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
      <label>
        <span style={labelStyle}>Section title</span>
        <input type="text" value={section.title} onChange={(e) => onSectionChange('title', e.target.value)} style={inputStyle} />
      </label>
      <label>
        <span style={labelStyle}>Section subtitle</span>
        <input type="text" value={section.subtitle} onChange={(e) => onSectionChange('subtitle', e.target.value)} style={inputStyle} />
      </label>
      <label>
        <span style={labelStyle}>CTA text</span>
        <input type="text" value={section.ctaText} onChange={(e) => onSectionChange('ctaText', e.target.value)} style={inputStyle} />
      </label>
    </div>

    <div style={{ display: 'grid', gap: 14 }}>{children}</div>
  </section>
);

export default HomePageContent;
