import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import { useAuth } from './context/AuthContext';

// Import pages
import DashboardHome from './pages/DashboardHome';
import UsersPage from './pages/Users/UsersPage';
import UsersAdmin from './pages/Users/UsersAdmin';
import UsersDoctor from './pages/Users/UsersDoctor';
import UsersPatient from './pages/Users/UsersPatient';
import UsersPharmacy from './pages/Users/UsersPharmacy';
import DoctorsPage from './pages/Doctors/DoctorsPage';
import PharmaciesPage from './pages/Pharmacies/PharmaciesPage';
import OrdersPage from './pages/Orders/OrdersPage';
import VerificationList from './pages/Verification/VerificationList';
import AppointmentList from './pages/Appointments/AppointmentList';
import ContentManager from './pages/Content/ContentManager';
import PharmacyProducts from './pages/Products/PharmacyProducts';
import DoctorsVerified from './pages/Doctors/DoctorsVerified';
import DoctorNewVerification from './pages/Doctors/DoctorNewVerification';
import DoctorStatus from './pages/Doctors/DoctorStatus';
import DoctorAvailability from './pages/Doctors/DoctorAvailability';
import DoctorTodayBooked from './pages/Doctors/DoctorTodayBooked';
import DoctorTop from './pages/Doctors/DoctorTop';
import DoctorRevenue from './pages/Doctors/DoctorRevenue';

import AdminSignIn from './pages/Auth/AdminSignIn';
import SettingsPage from './pages/Settings/SettingsPage';
import SupportPage from './pages/Support/SupportPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin-signin" replace />;
  }
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAuthPage = location.pathname === '/admin-signin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {isAuthenticated && !isAuthPage && <Sidebar />}
      <main style={{ flex: 1, marginLeft: isAuthenticated && !isAuthPage ? '280px' : 0, width: isAuthenticated && !isAuthPage ? 'calc(100% - 280px)' : '100%' }}>
        <Routes>
          <Route path="/admin-signin" element={<AdminSignIn />} />
          <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/users/admin" element={<ProtectedRoute><UsersAdmin /></ProtectedRoute>} />
          <Route path="/users/doctor" element={<ProtectedRoute><UsersDoctor /></ProtectedRoute>} />
          <Route path="/users/patient" element={<ProtectedRoute><UsersPatient /></ProtectedRoute>} />
          <Route path="/users/pharmacy" element={<ProtectedRoute><UsersPharmacy /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
          <Route path="/doctors/verified" element={<ProtectedRoute><DoctorsVerified /></ProtectedRoute>} />
          <Route path="/doctors/new-verification" element={<ProtectedRoute><DoctorNewVerification /></ProtectedRoute>} />
          <Route path="/doctors/status" element={<ProtectedRoute><DoctorStatus /></ProtectedRoute>} />
          <Route path="/doctors/availability" element={<ProtectedRoute><DoctorAvailability /></ProtectedRoute>} />
          <Route path="/doctors/today-booked" element={<ProtectedRoute><DoctorTodayBooked /></ProtectedRoute>} />
          <Route path="/doctors/top" element={<ProtectedRoute><DoctorTop /></ProtectedRoute>} />
          <Route path="/doctors/revenue" element={<ProtectedRoute><DoctorRevenue /></ProtectedRoute>} />
          <Route path="/pharmacies" element={<ProtectedRoute><PharmaciesPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><VerificationList /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute><ContentManager /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><PharmacyProducts /></ProtectedRoute>} />

          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/admin-signin'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
