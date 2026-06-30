import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setCurrentPage('home');
      } else if (path.startsWith('/product/')) {
        const id = path.split('/product/')[1];
        setSelectedProductId(id);
        setCurrentPage('product');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/register') {
        setCurrentPage('register');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/cart') {
        setCurrentPage('cart');
      } else if (path === '/checkout') {
        setCurrentPage('checkout');
      } else if (path === '/orders') {
        setCurrentPage('orders');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
      window.history.pushState({}, '', `/product/${productId}`);
    } else {
      setSelectedProductId(null);
      const routes: Record<string, string> = {
        home: '/',
        login: '/login',
        register: '/register',
        profile: '/profile',
        cart: '/cart',
        checkout: '/checkout',
        orders: '/orders',
        admin: '/admin'
      };
      window.history.pushState({}, '', routes[page] || '/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'product':
        return selectedProductId ? (
          <ProductDetailPage productId={selectedProductId} navigate={navigate} />
        ) : null;
      case 'login':
        return <LoginPage navigate={navigate} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case 'profile':
        return user ? <ProfilePage navigate={navigate} /> : <LoginPage navigate={navigate} />;
      case 'cart':
        return <CartPage navigate={navigate} />;
      case 'checkout':
        return user ? <CheckoutPage navigate={navigate} /> : <LoginPage navigate={navigate} />;
      case 'orders':
        return user ? <OrderHistoryPage navigate={navigate} /> : <LoginPage navigate={navigate} />;
      case 'admin':
        return isAdmin ? <AdminDashboard navigate={navigate} /> : <HomePage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header navigate={navigate} currentPage={currentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

export type NavigateFunction = (page: string, productId?: string) => void;
