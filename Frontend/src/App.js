import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Pages/User/Login';
import Register from './Pages/User/Register';
import ForgotPW from './Pages/User/ForgotPW';
import Otp from './Pages/User/Otp';
import ResetPassword from './Pages/User/ResetPassword';
import NavBar from './Pages/User/NavBar';
import Footer from './Pages/User/Footer';
import Home from './Pages/User/Home';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import Profile from './Pages/User/Profile';
import ProtectedRoute from './Components/ProtectedRoute';
import ChangePW from './Pages/User/ChangePW';
import ProfileManagement from './Pages/User/PersonalManagement';
import AddInfo from './Pages/User/AddInfo';
import Address from './Pages/User/Address';

function AppContent() {
  const location = useLocation();

  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password', '/admin/login', '/admin/dashboard'];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPW />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* User */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <ChangePW />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-management"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <ProfileManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addinfo"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <AddInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/address"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Address />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
