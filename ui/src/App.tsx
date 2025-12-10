import { useEffect } from 'react'
import { Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/landing/LandingPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { useAuthStore } from "@/store/auth.store";
import RequireAuth from "@/router/RequireAuth";
import MainLayout from "@/layouts/MainLayout"

import ThemePreview from "@/pages/theme/ThemePreview"
import ConsumerListPage from "@/pages/consumers/ConsumerListPage";
import ConsumerKYCPage from "@/pages/consumers/ConsumerKYCPage";
import RoutesListPage  from "@/pages/routes/RoutesListPage"

function App() {
  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/theme-preview" element={<ThemePreview />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/consumers/list" element={<ConsumerListPage />} />
          <Route path="/consumers/kyc" element={<ConsumerKYCPage />} />
          <Route path="/routes/" element={<RoutesListPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
