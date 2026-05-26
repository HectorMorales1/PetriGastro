import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { queryClient } from './services/api'
import Layout from './components/Layout'
import CartDrawer from './components/CartDrawer'
import AuthGuard from './components/AuthGuard'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

const Home = lazy(() => import('./pages/Home'))
const Menu = lazy(() => import('./pages/Menu'))
const Login = lazy(() => import('./pages/Login'))
const VerificarEmail = lazy(() => import('./pages/VerificarEmail'))
const MisPedidos = lazy(() => import('./pages/MisPedidos'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Layout>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route path="/verificar" element={<VerificarEmail />} />
                          <Route element={<AuthGuard />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/mis-pedidos" element={<MisPedidos />} />
                            <Route path="*" element={<NotFound />} />
                          </Route>
                          <Route element={<AuthGuard requiredRole="admin" />}>
                            <Route path="/admin" element={<Admin />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </Layout>
                  <CartDrawer />
                </BrowserRouter>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App