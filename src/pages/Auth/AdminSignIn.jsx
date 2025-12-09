import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { buildApiUrl, setAdminToken } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('/api/auth/sign-in'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Sign-in failed');
      }

      if (data?.user?.role && data.user.role !== 'admin') {
        throw new Error('You are not authorized to access the admin dashboard');
      }

      const token = data.token || data.accessToken;
      if (token) {
        setAdminToken(token);
      }

      // Token is already set via setAdminToken(token) above.
      // The AuthContext will pick up the token on next render via initAuth.
      // Navigation will happen automatically via the useEffect that watches isAuthenticated.
      // Force a page reload to trigger AuthContext re-init with the new token
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Admin Sign In</h1>
        <p style={subtitleStyle}>Sign in with your admin credentials to access the dashboard.</p>

        {error && (
          <div style={errorBoxStyle}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? (
              <>
                <Loader2 size={16} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e0f2fe, #e2f6ff, #eff6ff)',
  padding: 20
};

const cardStyle = {
  width: '100%',
  maxWidth: 420,
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 14px 45px rgba(15, 23, 42, 0.15)',
  border: '1px solid #e2e8f0',
  display: 'grid',
  gap: 12
};

const titleStyle = {
  margin: 0,
  fontSize: 26,
  color: '#0f172a'
};

const subtitleStyle = {
  margin: '0 0 4px',
  color: '#475569',
  fontSize: 14
};

const labelStyle = {
  display: 'grid',
  gap: 6,
  color: '#0f172a',
  fontWeight: 600,
  fontSize: 14
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit'
};

const buttonStyle = {
  marginTop: 4,
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  background: '#0ea5e9',
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
  transition: 'transform 0.1s, box-shadow 0.1s',
  opacity: 1
};

const errorBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #fecaca',
  background: '#fee2e2',
  color: '#991b1b',
  fontSize: 14
};

export default AdminSignIn;
