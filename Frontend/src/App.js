import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPW from './Pages/ForgotPW';
import Otp from './Pages/Otp';
import NavBar from './Pages/NavBar';
import Footer from './Pages/Footer';
import Home from './Pages/Home';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import Profile from './Pages/Profile';
import ProtectedRoute from './Components/ProtectedRoute';
import ChangePW from './Pages/ChangePW';

function AppContent() {
  const location = useLocation();
  
  // Define routes where NavBar and Footer should be hidden
  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/admin/login'];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPW />} />
        <Route path="/verify-otp" element={<Otp />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* User Routes */}
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
