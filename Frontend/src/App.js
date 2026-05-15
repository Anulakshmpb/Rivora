import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Cart from './Pages/User/Cart';
import Checkout from './Pages/User/Checkout';
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
import Orders from './Pages/User/Orders';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './Toast/ToastContext';
import BadRequest400, { NotFound404, InternalServer500 } from './Pages/User/Errors';
import SiteManagement, { Coupons, Reviews } from './Pages/Admin/SiteManagement';
import UserManagement from './Pages/Admin/UserManagement';
import HomeCategory from './Pages/Admin/HomeCategory';
import OrderSuccess from './Pages/User/OrderSuccess';
import PaymentFailed from './Pages/User/PaymentFailed';
import WalletPayment from './Pages/User/WalletPayment';
import Order from './Pages/Admin/Order';


function AppContent() {
  const location = useLocation();

  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password', '/admin/login', '/admin/dashboard', '/admin/users', '/admin/products', '/admin/add-product', '/admin/site', '/admin/site/home-category', '/admin/site/coupons', '/admin/site/reviews', '/admin/orders'];
  const hideLayout = authRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* users  */}
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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wallet-payment" element={<WalletPayment />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
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
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <SiteManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site/home-category"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <HomeCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site/coupons"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <Coupons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site/reviews"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
              <AddProduct />
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
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/400" element={<BadRequest400 />} />
        <Route path="/500" element={<InternalServer500 />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>


      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
