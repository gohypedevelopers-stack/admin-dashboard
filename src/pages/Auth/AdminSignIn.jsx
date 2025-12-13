import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { buildApiUrl, setAdminToken } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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

      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Admin Portal</h1>
            <p style={styles.subtitle}>Welcome back! Please sign in to continue.</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'email' ? '#2563eb' : '#e2e8f0',
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
              }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === 'password' ? '#2563eb' : '#e2e8f0',
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
              }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...styles.input, paddingRight: 40 }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={styles.spinner} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div style={styles.footer}>
          <p>© {new Date().getFullYear()} Doorspital. All rights reserved.</p>
          <div style={styles.links}>
            <a href="#" style={styles.link}>Privacy Policy</a>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <a href="#" style={styles.link}>Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '20px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.5)'
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: '#334155',
    fontWeight: '600',
    fontSize: '14px'
  },
  inputWrapper: {
    position: 'relative',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    background: '#ffffff',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    outline: 'none',
    color: '#1e293b',
    background: 'transparent'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s'
  },
  submitButton: {
    marginTop: '8px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#2563eb', // Brand blue
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#991b1b',
    fontSize: '13px',
    marginBottom: '24px',
    lineHeight: '1.4'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  links: {
    marginTop: '6px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center'
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    transition: 'color 0.2s',
  }
};

// Add global style for spin animation if not present
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

export default AdminSignIn;
