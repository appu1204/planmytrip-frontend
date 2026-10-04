import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import PersonaSelect from "./pages/onboarding/PersonaSelect";
import Home from "./pages/home/Home";
import CreateTrip from "./pages/trips/CreateTrip";
import MyTrips from "./pages/trips/MyTrips";
import TripDetail from "./pages/trips/TripDetail";
import AIPlanner from "./pages/trips/AIPlanner";
import Wishlist from "./pages/wishlist/Wishlist";
import Profile from "./pages/profile/Profile";
import ComingSoon from "./pages/misc/ComingSoon";

function HomeAuthRedirect({ mode }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  searchParams.set("auth", mode);

  return (
    <Navigate
      to={{ pathname: "/home", search: `?${searchParams.toString()}` }}
      state={location.state}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/planner" element={<AIPlanner />} />
          <Route path="/flights" element={<ComingSoon type="flights" />} />
          <Route path="/hotels" element={<ComingSoon type="hotels" />} />
          <Route path="/activities" element={<ComingSoon type="activities" />} />
          <Route path="/transport" element={<ComingSoon type="transport" />} />
          <Route path="/coming-soon" element={<ComingSoon type="flights" />} />

          {/* Legacy auth URLs open the account dialog on Home. */}
          <Route path="/register" element={<HomeAuthRedirect mode="register" />} />
          <Route path="/login" element={<HomeAuthRedirect mode="login" />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes (Require active user authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding/persona" element={<PersonaSelect />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
