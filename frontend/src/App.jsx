import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BookingSlot from './pages/BookingSlot';

import { Toaster } from 'react-hot-toast';
import ChangePassword from './pages/ChangePassword';
import AddStation from './pages/AddStation';

export default function App() {
  return (
    <div>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/booking-slot" element={<BookingSlot />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='station-details' element={<ProtectedRoute role="manager" component={AddStation} />} />
        <Route
          path="/user-dashboard"
          element={<ProtectedRoute role="user" component={UserDashboard} />}
        />
        <Route
          path="/manager-dashboard"
          element={<ProtectedRoute role="manager" component={ManagerDashboard} />}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute role="admin" component={AdminDashboard} />}
        />
      </Routes>
      
    </Router>
    <Toaster />
    </div>
  );
}
