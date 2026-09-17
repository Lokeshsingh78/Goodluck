import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { MenuDrawer } from './components/MenuDrawer';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage, ImprintPage, TermsPage, ReturnsPage, ShippingPage } from './pages/PolicyPages';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

const MainContent = () => {
  const { currentView, toastMessage } = useShop();

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <MenuDrawer />
      <CartDrawer />
      <AuthModal />

      {/* View Switcher */}
      <main style={{ flex: 1, paddingTop: currentView === 'home' ? '0px' : '80px' }}>
        {currentView === 'home' && <HomePage />}
        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'search' && <SearchPage />}
        {currentView === 'product' && <ProductDetailPage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'privacy' && <PrivacyPage />}
        {currentView === 'imprint' && <ImprintPage />}
        {currentView === 'terms' && <TermsPage />}
        {currentView === 'returns' && <ReturnsPage />}
        {currentView === 'shipping' && <ShippingPage />}
        {currentView === 'orders' && <OrdersPage />}
        {currentView === 'admin' && <AdminPage />}
        {(currentView === 'login' || currentView === 'wishlist') && <LoginPage />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating WhatsApp Chat Button */}
      <WhatsAppButton />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
