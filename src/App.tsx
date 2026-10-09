import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { BackendProvider } from "./context/BackendContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { RegistrationsPage } from "./pages/RegistrationsPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { UsersPage } from "./pages/UsersPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CatalogPage } from "./pages/CatalogPage";
import { RequestsPage } from "./pages/RequestsPage";
import { CatalogConfigPage } from "./pages/CatalogConfigPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AuditPage } from "./pages/AuditPage";

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BackendProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="registrations" element={<RegistrationsPage />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="settings" element={<CatalogConfigPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BackendProvider>
    </LanguageProvider>
  );
};

export default App;
