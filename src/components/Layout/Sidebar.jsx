import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Package,
  Calendar, FileText, ShoppingBag, LogOut, Menu, X, ChevronDown,
  Settings, MessageSquare
} from 'lucide-react';
import './sidebar.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUsersSubmenu, setOpenUsersSubmenu] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState('All');
  const [selectedUserStatus, setSelectedUserStatus] = useState('All');
  const [openDoctorsSubmenu, setOpenDoctorsSubmenu] = useState(false);
  const [selectedDoctorView, setSelectedDoctorView] = useState('Overview');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const displayName = (user?.userName || user?.name || user?.email || 'Admin User').trim();
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Users', path: '/users', hasSubmenu: true },
    { icon: Stethoscope, label: 'Doctors', path: '/doctors', hasSubmenu: true },
    { icon: Package, label: 'Pharmacies', path: '/pharmacies' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: FileText, label: 'Content', path: '/content' },
    { icon: ShoppingBag, label: 'Products', path: '/products' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: MessageSquare, label: 'Support', path: '/support' },
  ];

  const USER_ROLES = ['All', 'Admin', 'Doctor', 'Patient', 'Pharmacy'];
  const ACCOUNT_STATUS = ['All', 'Active', 'Suspended'];
  const DOCTOR_VIEWS = [
    'Overview',
    'Verified',
    'New Verification',
    'Status',
    'Availability',
    'Today Booked',
    'Top Doctors',
    'Revenue',
  ];

  const doctorViewPaths = {
    Overview: '/doctors',
    Verified: '/doctors/verified',
    'New Verification': '/doctors/new-verification',
    Status: '/doctors/status',
    Availability: '/doctors/availability',
    'Today Booked': '/doctors/today-booked',
    'Top Doctors': '/doctors/top',
    Revenue: '/doctors/revenue',
  };
  const userRolePaths = {
    All: '/users',
    Admin: '/users/admin',
    Doctor: '/users/doctor',
    Patient: '/users/patient',
    Pharmacy: '/users/pharmacy'
  };

  const isActive = (path) => location.pathname === path;

  const handleUserFilterSelect = (role, status) => {
    setSelectedUserRole(role);
    setSelectedUserStatus(status);
    const basePath = userRolePaths[role] || '/users';
    const search = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    navigate(`${basePath}${search}`);
    setIsOpen(false);
  };

  const handleDoctorSelect = (view) => {
    setSelectedDoctorView(view);
    navigate(doctorViewPaths[view] || '/doctors');
    setIsOpen(false);
  };

  useEffect(() => {
    const path = location.pathname;
    const matched = Object.entries(doctorViewPaths).find(([, p]) => p === path);
    if (matched) {
      setOpenDoctorsSubmenu(true);
      setSelectedDoctorView(matched[0]);
    }
    const matchedUser = Object.entries(userRolePaths).find(([, p]) => p === path);
    if (matchedUser) {
      setOpenUsersSubmenu(true);
      setSelectedUserRole(matchedUser[0]);
    }
    const statusParam = new URLSearchParams(location.search).get('status');
    if (statusParam && ACCOUNT_STATUS.includes(statusParam)) {
      setSelectedUserStatus(statusParam);
    }
  }, [location.pathname]);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <div className="avatar-badge" aria-label={`Signed in as ${displayName}`}>
              <span className="avatar-initial">{initial}</span>
              <span className="avatar-tooltip">{displayName}</span>
            </div>
            <div className="sidebar-header-text">
              <h2>Admin Panel</h2>
              <p>Healthcare Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.hasSubmenu && item.label === 'Users') {
              return (
                <div key={item.path} className="nav-group">
                  <button
                    type="button"
                    className={`nav-link nav-link-toggle ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => {
                      setOpenUsersSubmenu(!openUsersSubmenu);
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                  >
                    <div className="nav-link-main">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={16} className={`chevron ${openUsersSubmenu ? 'open' : ''}`} />
                  </button>

                  {openUsersSubmenu && (
                    <div className="submenu">
                      <div className="submenu-section">
                        <p className="submenu-title">Role</p>
                        <div className="submenu-list">
                          {USER_ROLES.map((role) => (
                            <button
                              key={role}
                              className={`submenu-item ${selectedUserRole === role ? 'active' : ''}`}
                              onClick={() => handleUserFilterSelect(role, selectedUserStatus)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="submenu-section">
                        <p className="submenu-title">Status</p>
                        <div className="submenu-list">
                          {ACCOUNT_STATUS.map((status) => (
                            <button
                              key={status}
                              className={`submenu-item ${selectedUserStatus === status ? 'active' : ''}`}
                              onClick={() => handleUserFilterSelect(selectedUserRole, status)}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            if (item.hasSubmenu && item.label === 'Doctors') {
              return (
                <div key={item.path} className="nav-group">
                  <button
                    type="button"
                    className={`nav-link nav-link-toggle ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => {
                      setOpenDoctorsSubmenu(!openDoctorsSubmenu);
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                  >
                    <div className="nav-link-main">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={16} className={`chevron ${openDoctorsSubmenu ? 'open' : ''}`} />
                  </button>

                  {openDoctorsSubmenu && (
                    <div className="submenu">
                      <div className="submenu-section">
                        <p className="submenu-title">Doctors</p>
                        <div className="submenu-list doctors-list">
                          {DOCTOR_VIEWS.map((view) => (
                            <button
                              key={view}
                              className={`submenu-item ${selectedDoctorView === view ? 'active' : ''}`}
                              onClick={() => handleDoctorSelect(view)}
                            >
                              {view}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              navigate('/admin-signin', { replace: true });
            }}
          >
            <LogOut size={18} />
            <span>Signout</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;
