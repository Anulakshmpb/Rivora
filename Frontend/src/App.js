import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Cart from './Pages/User/Cart';
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
import ProductManagement from './Pages/Admin/Products/ProductManagement';
import AddProduct from './Pages/Admin/Products/AddProduct';
import ProductListing from './Pages/User/ProductListing';
import ProductDetails from './Pages/User/ProductDetails';
import WishList from './Pages/User/WishList';
import { WishlistProvider } from './context/WishlistContext';

function AppContent() {
  const location = useLocation();

  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password', '/admin/login', '/admin/dashboard', '/products', '/add-product'];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Guest Only Routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute guestOnly={true}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute guestOnly={true}>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPW />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/product-list" element={<ProductListing />} />
        <Route path="/product-list/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<WishList />} />
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* User Protected Routes */}
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
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
