import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CATALOG_ONLY } from './config/features'
import { StoreProvider } from './store/StoreProvider'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { CartProvider } from './context/CartContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'
import OrderDetailPage from './pages/OrderDetailPage'
import TrackOrderPage from './pages/TrackOrderPage'
import AccountPage from './pages/AccountPage'

// Public storefront app. This module deliberately imports NO admin code — the
// admin dashboard lives in AdminApp.jsx and is built + deployed separately, so
// it can never reach the public bundle. Any /admin* path here is a dead end
// that bounces home; the real admin lives on its own protected deployment.
export default function StorefrontApp() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <ChatProvider>
            <CartProvider>
              <Routes>
                <Route path="/store" element={<Navigate to="/" replace />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />

                {/* Customer auth + commerce + order-tracking flows — hidden
                    during the catalog-only phase; redirect to home while
                    disabled. */}
                {CATALOG_ONLY ? (
                  <>
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                    <Route path="/cart" element={<Navigate to="/" replace />} />
                    <Route path="/checkout" element={<Navigate to="/" replace />} />
                    <Route path="/checkout/success" element={<Navigate to="/" replace />} />
                    <Route path="/akun" element={<Navigate to="/" replace />} />
                    <Route path="/lacak" element={<Navigate to="/" replace />} />
                    <Route path="/pesanan/:id" element={<Navigate to="/" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                    <Route path="/akun" element={<AccountPage />} />
                    <Route path="/lacak" element={<TrackOrderPage />} />
                    <Route path="/pesanan/:id" element={<OrderDetailPage />} />
                  </>
                )}

                {/* Admin doesn't exist on the public deployment. */}
                <Route path="/admin/*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </ChatProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
