import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPW from './Pages/ForgotPW';
import Otp from './Pages/Otp';
import NavBar from './Pages/NavBar';
import Footer from './Pages/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPW />} />
          <Route path="/otp" element={<Otp />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
