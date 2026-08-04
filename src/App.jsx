import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import RequireAdmin from './components/admin/RequireAdmin'
import AdminLayout from './components/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import OrdersPage from './pages/admin/OrdersPage'
import ProductsPage from './pages/admin/ProductsPage'
import AdminPlaceholder from './pages/admin/AdminPlaceholder'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import HelpPage from './pages/admin/HelpPage'
import HelpArticlePage from './pages/admin/HelpArticlePage'
import ChatsPage from './pages/admin/ChatsPage'
import IntegrationPage from './pages/admin/IntegrationPage'
import SettingsPage from './pages/admin/SettingsPage'
import ProductFormPage from './pages/admin/ProductFormPage'
import AdminOrderDetailPage from './pages/admin/OrderDetailPage'
import InvoicePage from './pages/admin/InvoicePage'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <ChatProvider>
            <CartProvider>
              <Routes>
                <Route path="/store" element={<Navigate to="/" replace />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/lacak" element={<TrackOrderPage />} />
                <Route path="/pesanan/:id" element={<OrderDetailPage />} />
                <Route path="/akun" element={<AccountPage />} />

                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="orders/:id/invoice" element={<InvoicePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/new" element={<ProductFormPage />} />
                  <Route path="products/:id" element={<ProductFormPage />} />
                  <Route path="chats" element={<ChatsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="integration" element={<IntegrationPage />} />
                  <Route path="help" element={<HelpPage />} />
                  <Route path="help/:slug" element={<HelpArticlePage />} />
                </Route>
              </Routes>
            </CartProvider>
          </ChatProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
