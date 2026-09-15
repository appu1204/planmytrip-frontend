import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Phase 1 — auth */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Onboarding */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding/persona" element={<PersonaSelect />} />

            {/* Phase 2 — persona-based home */}
            <Route path="/home" element={<Home />} />

            {/* Phase 3 — trips */}
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />

            {/* Phase 4 — AI planning, wishlist, profile */}
            <Route path="/planner" element={<AIPlanner />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />

            {/* Booking Service — not built yet, placeholder keeps nav links honest */}
            <Route path="/flights" element={<ComingSoon type="flights" />} />
            <Route path="/hotels" element={<ComingSoon type="hotels" />} />
            <Route path="/activities" element={<ComingSoon type="activities" />} />
            <Route path="/transport" element={<ComingSoon type="transport" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
