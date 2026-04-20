import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './doctors-page.css';

const createEmptyService = (index = 0) => ({
  serviceKey: `service-${Date.now()}-${index}`,
  title: '',
  shortDescription: '',
  cardImage: '',
  bannerImage: '',
  rating: 0,
  reviewsCount: 0,
  whatsIncludedTitle: "What's Included",
  whatsIncluded: [''],
  fullDetailsTitle: 'Full Service Details',
  fullDetails: '',
  detailsCtaText: 'View Full Service Details',
  availableSpecialistsTitle: 'Available Specialists',
  subCategoriesTitle: 'Service Categories',
  subCategories: [
    {
      title: '',
      description: '',
      image: '',
      doctorFilterValue: '',
      displayOrder: 0,
      isActive: true,
    },
  ],
  doctorFilterValue: '',
  displayOrder: index,
  showOnHome: true,
  showOnServicesPage: true,
  isActive: true,
});

const normalizePayload = (payload) => ({
  homeSectionVisible: Boolean(payload?.homeSectionVisible),
  homeSectionTitle: payload?.homeSectionTitle || 'Doorstep Services',
  homeSectionSubtitle: payload?.homeSectionSubtitle || '',
  servicesPageVisible: payload?.servicesPageVisible !== false,
  servicesPageTitle: payload?.servicesPageTitle || 'Doorstep Services',
  servicesPageSubtitle:
    payload?.servicesPageSubtitle || 'Book trusted medical services at your home',
  services: Array.isArray(payload?.services)
    ? payload.services.map((service, index) => ({
        ...createEmptyService(index),
        ...service,
        whatsIncluded:
          Array.isArray(service?.whatsIncluded) && service.whatsIncluded.length > 0
            ? service.whatsIncluded
            : [''],
        subCategories:
          Array.isArray(service?.subCategories) && service.subCategories.length > 0
            ? service.subCategories.map((item, subIndex) => ({
                title: item?.title || '',
                description: item?.description || '',
                image: item?.image || '',
                doctorFilterValue: item?.doctorFilterValue || '',
                displayOrder: item?.displayOrder ?? subIndex,
                isActive: item?.isActive !== false,
              }))
            : [
                {
                  title: '',
                  description: '',
                  image: '',
                  doctorFilterValue: '',
                  displayOrder: 0,
                  isActive: true,
                },
              ],
      }))
    : [],
});

const DoctorServices = () => {
  const [form, setForm] = useState(normalizePayload());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedServiceIndex, setExpandedServiceIndex] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await apiRequest('/api/admin/doorstep-content');
        setForm(normalizePayload(payload?.data));
      } catch (err) {
        setError(err.message || 'Failed to load doorstep content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const updateTopLevel = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateService = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [field]: value } : service
      ),
    }));
  };

  const updateIncludedItem = (serviceIndex, itemIndex, value) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, currentIndex) => {
        if (currentIndex !== serviceIndex) return service;
        return {
          ...service,
          whatsIncluded: service.whatsIncluded.map((item, currentItemIndex) =>
            currentItemIndex === itemIndex ? value : item
          ),
        };
      }),
    }));
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, createEmptyService(prev.services.length)],
    }));
  };

  const removeService = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, serviceIndex) => serviceIndex !== index),
    }));
  };

  const addIncludedItem = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, serviceIndex) =>
        serviceIndex === index
          ? { ...service, whatsIncluded: [...service.whatsIncluded, ''] }
          : service
      ),
    }));
  };

  const updateSubCategory = (serviceIndex, subIndex, field, value) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, currentIndex) => {
        if (currentIndex !== serviceIndex) return service;
        return {
          ...service,
          subCategories: service.subCategories.map((item, currentSubIndex) =>
            currentSubIndex === subIndex ? { ...item, [field]: value } : item
          ),
        };
      }),
    }));
  };

  const addSubCategory = (serviceIndex) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, currentIndex) =>
        currentIndex === serviceIndex
          ? {
              ...service,
              subCategories: [
                ...service.subCategories,
                {
                  title: '',
                  description: '',
                  image: '',
                  doctorFilterValue: '',
                  displayOrder: service.subCategories.length,
                  isActive: true,
                },
              ],
            }
          : service
      ),
    }));
  };

  const removeSubCategory = (serviceIndex, subIndex) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, currentIndex) => {
        if (currentIndex !== serviceIndex) return service;
        const nextItems = service.subCategories.filter(
          (_, currentSubIndex) => currentSubIndex !== subIndex
        );
        return {
          ...service,
          subCategories:
            nextItems.length > 0
              ? nextItems
              : [
                  {
                    title: '',
                    description: '',
                    image: '',
                    doctorFilterValue: '',
                    displayOrder: 0,
                    isActive: true,
                  },
                ],
        };
      }),
    }));
  };

  const removeIncludedItem = (serviceIndex, itemIndex) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service, currentIndex) => {
        if (currentIndex !== serviceIndex) return service;
        const nextItems = service.whatsIncluded.filter((_, currentItemIndex) => currentItemIndex !== itemIndex);
        return {
          ...service,
          whatsIncluded: nextItems.length > 0 ? nextItems : [''],
        };
      }),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const payload = {
        ...form,
        services: form.services.map((service, index) => ({
          ...service,
          displayOrder: Number(service.displayOrder) || index,
          rating: Number(service.rating) || 0,
          reviewsCount: Number(service.reviewsCount) || 0,
          whatsIncluded: service.whatsIncluded
            .map((item) => item.trim())
            .filter(Boolean),
          subCategories: service.subCategories
            .map((item, subIndex) => ({
              ...item,
              title: item.title.trim(),
              description: item.description.trim(),
              image: item.image.trim(),
              doctorFilterValue: item.doctorFilterValue.trim(),
              displayOrder: Number(item.displayOrder) || subIndex,
            }))
            .filter((item) => item.title),
        })),
      };
      await apiRequest('/api/admin/doorstep-content', {
        method: 'PUT',
        body: payload,
      });
      setSuccess('Doorstep content saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save doorstep content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="doctors-page">
        <div className="loading-state">Loading doorstep content...</div>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doorstep Services Content</h1>
          <p className="page-subtitle">
            Control the home section, services listing, and every service details page from admin.
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={addService} type="button">
            <Plus size={18} />
            Add Service Card
          </button>
          <button className="btn-primary" onClick={handleSave} type="button" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-state" style={{ marginBottom: 16 }}>{error}</div>
      ) : null}
      {success ? (
        <div className="loading-state" style={{ marginBottom: 16, color: '#166534', background: '#dcfce7' }}>
          {success}
        </div>
      ) : null}

      <div className="table-container" style={{ padding: 20, display: 'grid', gap: 18 }}>
        <section style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Section Settings</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                Control the home block and the main services page headings.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 999 }}>
                <input type="checkbox" checked={form.homeSectionVisible} onChange={(e) => updateTopLevel('homeSectionVisible', e.target.checked)} />
                Home visible
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 999 }}>
                <input type="checkbox" checked={form.servicesPageVisible} onChange={(e) => updateTopLevel('servicesPageVisible', e.target.checked)} />
                Services page visible
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Home section title</span>
              <input className="search-input" value={form.homeSectionTitle} onChange={(e) => updateTopLevel('homeSectionTitle', e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Home section subtitle</span>
              <input className="search-input" value={form.homeSectionSubtitle} onChange={(e) => updateTopLevel('homeSectionSubtitle', e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Services page title</span>
              <input className="search-input" value={form.servicesPageTitle} onChange={(e) => updateTopLevel('servicesPageTitle', e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Services page subtitle</span>
              <input className="search-input" value={form.servicesPageSubtitle} onChange={(e) => updateTopLevel('servicesPageSubtitle', e.target.value)} />
            </label>
          </div>
        </section>

        <section style={{ display: 'grid', gap: 14 }}>
          {form.services.map((service, index) => (
            <article
              key={`${service.serviceKey || 'service'}-${index}`}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid var(--border)',
                padding: 16,
                display: 'grid',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>{service.title || `Service ${index + 1}`}</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                      {service.shortDescription || 'No short description yet'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ padding: '5px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>
                      Slug: {service.serviceKey || '-'}
                    </span>
                    <span style={{ padding: '5px 10px', borderRadius: 999, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600 }}>
                      Sub-categories: {service.subCategories.filter((item) => item.title).length}
                    </span>
                    <span style={{ padding: '5px 10px', borderRadius: 999, background: service.isActive ? '#dcfce7' : '#f1f5f9', color: service.isActive ? '#166534' : '#475569', fontSize: 12, fontWeight: 600 }}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => setExpandedServiceIndex(expandedServiceIndex === index ? -1 : index)}
                    title={expandedServiceIndex === index ? 'Collapse' : 'Expand'}
                  >
                    {expandedServiceIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => removeService(index)}
                    title="Remove service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedServiceIndex === index ? (
                <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Service key / slug</span>
                  <input className="search-input" value={service.serviceKey} onChange={(e) => updateService(index, 'serviceKey', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Card title</span>
                  <input className="search-input" value={service.title} onChange={(e) => updateService(index, 'title', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Card / subtitle description</span>
                  <input className="search-input" value={service.shortDescription} onChange={(e) => updateService(index, 'shortDescription', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Doctor filter value</span>
                  <input className="search-input" value={service.doctorFilterValue} onChange={(e) => updateService(index, 'doctorFilterValue', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Card image URL / path</span>
                  <input className="search-input" value={service.cardImage} onChange={(e) => updateService(index, 'cardImage', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Banner image URL / path</span>
                  <input className="search-input" value={service.bannerImage} onChange={(e) => updateService(index, 'bannerImage', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Rating</span>
                  <input className="search-input" type="number" step="0.1" value={service.rating} onChange={(e) => updateService(index, 'rating', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Reviews count</span>
                  <input className="search-input" type="number" value={service.reviewsCount} onChange={(e) => updateService(index, 'reviewsCount', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Display order</span>
                  <input className="search-input" type="number" value={service.displayOrder} onChange={(e) => updateService(index, 'displayOrder', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>What's included heading</span>
                  <input className="search-input" value={service.whatsIncludedTitle} onChange={(e) => updateService(index, 'whatsIncludedTitle', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Full details title</span>
                  <input className="search-input" value={service.fullDetailsTitle} onChange={(e) => updateService(index, 'fullDetailsTitle', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>CTA text</span>
                  <input className="search-input" value={service.detailsCtaText} onChange={(e) => updateService(index, 'detailsCtaText', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Available specialists heading</span>
                  <input className="search-input" value={service.availableSpecialistsTitle} onChange={(e) => updateService(index, 'availableSpecialistsTitle', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Sub-categories heading</span>
                  <input className="search-input" value={service.subCategoriesTitle} onChange={(e) => updateService(index, 'subCategoriesTitle', e.target.value)} />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Full details content</span>
                <textarea
                  className="search-input"
                  style={{ minHeight: 96, resize: 'vertical' }}
                  value={service.fullDetails}
                  onChange={(e) => updateService(index, 'fullDetails', e.target.value)}
                />
              </label>

              <div style={{ display: 'grid', gap: 10, background: '#f8fafc', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>What's Included Items</strong>
                  <button type="button" className="btn-primary" onClick={() => addIncludedItem(index)}>
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                {service.whatsIncluded.map((item, itemIndex) => (
                  <div key={`${service.serviceKey}-included-${itemIndex}`} style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="search-input"
                      value={item}
                      onChange={(e) => updateIncludedItem(index, itemIndex, e.target.value)}
                    />
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => removeIncludedItem(index, itemIndex)}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 10, background: '#f8fafc', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>Sub-categories / detail cards</strong>
                  <button type="button" className="btn-primary" onClick={() => addSubCategory(index)}>
                    <Plus size={16} />
                    Add Sub-category
                  </button>
                </div>
                {service.subCategories.map((item, subIndex) => (
                  <div
                    key={`${service.serviceKey}-subcategory-${subIndex}`}
                    style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 10, background: '#fff' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Title</span>
                        <input className="search-input" value={item.title} onChange={(e) => updateSubCategory(index, subIndex, 'title', e.target.value)} />
                      </label>
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Image URL / path</span>
                        <input className="search-input" value={item.image} onChange={(e) => updateSubCategory(index, subIndex, 'image', e.target.value)} />
                      </label>
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Doctor filter value</span>
                        <input className="search-input" value={item.doctorFilterValue} onChange={(e) => updateSubCategory(index, subIndex, 'doctorFilterValue', e.target.value)} />
                      </label>
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Display order</span>
                        <input className="search-input" type="number" value={item.displayOrder} onChange={(e) => updateSubCategory(index, subIndex, 'displayOrder', e.target.value)} />
                      </label>
                    </div>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Description</span>
                      <textarea
                        className="search-input"
                        style={{ minHeight: 70, resize: 'vertical' }}
                        value={item.description}
                        onChange={(e) => updateSubCategory(index, subIndex, 'description', e.target.value)}
                      />
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="checkbox" checked={item.isActive} onChange={(e) => updateSubCategory(index, subIndex, 'isActive', e.target.checked)} />
                        Active
                      </label>
                      <button type="button" className="action-btn" onClick={() => removeSubCategory(index, subIndex)} title="Remove sub-category">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 999 }}>
                  <input type="checkbox" checked={service.showOnHome} onChange={(e) => updateService(index, 'showOnHome', e.target.checked)} />
                  Show on home section
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 999 }}>
                  <input type="checkbox" checked={service.showOnServicesPage} onChange={(e) => updateService(index, 'showOnServicesPage', e.target.checked)} />
                  Show on services page
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 999 }}>
                  <input type="checkbox" checked={service.isActive} onChange={(e) => updateService(index, 'isActive', e.target.checked)} />
                  Active
                </label>
              </div>
                </>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default DoctorServices;
