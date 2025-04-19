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
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import BookingHistory from './components/BookingHistory';
import EditStation from './pages/EditStation';
import StationBookings from './pages/StationBookings';
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import LoadingSpinner from './components/Spinner';
import UserAnalytics from './pages/UserAnalytics';
import ManagerAnalytics from './pages/ManagerAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';

export default function App() {
  const {checkAuth,checkingAuth} = useAuthStore()
  

  useEffect(() =>{
    checkAuth()
  },[checkAuth])

  if (checkingAuth) {
    return (
      <LoadingSpinner text="Checking authentication..." />
    );
  }
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
        <Route 
            path="/booking-history" 
            element={<ProtectedRoute role="user" component={BookingHistory} />} 
        />
        <Route 
          path="/edit-station/:stationId" 
          element={<ProtectedRoute role="manager" component={EditStation} />} 
        />
        <Route 
          path="/station/:stationId/bookings" 
          element={<ProtectedRoute role="manager" component={StationBookings} />} 
        />
        <Route 
          path="/payment-success" 
          element={<PaymentSuccess />}
        />
        <Route 
          path="/payment-failure" 
          element={<PaymentFailure />}
        />
        <Route 
          path="/user/analytics" 
          element={<ProtectedRoute role="user" component={UserAnalytics} />}
        />
        <Route 
          path="/manager/analytics" 
          element={<ProtectedRoute role="manager" component={ManagerAnalytics} />} 
        />

        <Route
          path="/admin/analytics"
          element={<ProtectedRoute role="admin" component={AdminAnalytics} />}
        />



      </Routes>
      
    </Router>
    <Toaster />
    </div>
  );
}
