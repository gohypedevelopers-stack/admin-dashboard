import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './SettingsPage.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await apiRequest('/api/admin/settings');
            if (response && response.data) {
                setSettings(response.data);
            }
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (key, value) => {
        setSaving(true);
        setSuccessMsg('');
        setError('');
        try {
            await apiRequest('/api/admin/settings', {
                method: 'PUT',
                body: { key, value },
            });
            setSuccessMsg(`Setting "${key}" updated successfully`);
            // Refresh local state to ensure sync
            const updatedSettings = settings.map(s =>
                s.key === key ? { ...s, value } : s
            );
            setSettings(updatedSettings);
        } catch (err) {
            setError(`Failed to save setting "${key}"`);
        } finally {
            setSaving(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const groupedSettings = settings.reduce((acc, setting) => {
        const category = setting.category || 'general';
        if (!acc[category]) acc[category] = [];
        acc[category].push(setting);
        return acc;
    }, {});

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="settings-container">
            <div className="page-header">
                <div>
                    <h1>System Settings</h1>
                    <p className="text-gray-500">Manage platform configuration and global variables.</p>
                </div>
                <button className="secondary-button" onClick={fetchSettings} disabled={loading}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div className="alert-box alert-error">{error}</div>}
            {successMsg && <div className="alert-box alert-success">{successMsg}</div>}

            <div className="settings-grid-layout">
                {Object.entries(groupedSettings).map(([category, items]) => (
                    <div key={category} className="settings-card">
                        <h3 className="category-title capitalize">{category} Settings</h3>
                        <div className="settings-list">
                            {items.map((setting) => (
                                <div key={setting.key} className="setting-item">
                                    <div className="setting-info">
                                        <label className="setting-label">{setting.key}</label>
                                        <p className="setting-desc">{setting.description}</p>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="text"
                                            defaultValue={setting.value}
                                            className="setting-input"
                                            onBlur={(e) => {
                                                if (e.target.value !== String(setting.value)) {
                                                    handleSave(setting.key, e.target.value);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsPage;
