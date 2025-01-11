import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Stock from './pages/Stock';
import Settings from './pages/Settings';
import AddStore from './pages/AddStore';
import Purchase from './pages/Purchase';
import OrderSummary from './pages/OrderSummary';
import Order from './pages/Order';

function Navigation() {
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  return (
    <nav className="bottom-nav">
      <div 
        className={`nav-item ${pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="nav-icon">🏠</span>
        <span>Home</span>
      </div>
      <div 
        className={`nav-item ${pathname === '/stock' ? 'active' : ''}`}
        onClick={() => navigate('/stock')}
      >
        <span className="nav-icon">📊</span>
        <span>Stock</span>
      </div>
      <div 
        className={`nav-item ${pathname === '/order' ? 'active' : ''}`}
        onClick={() => navigate('/order')}
      >
        <span className="nav-icon">📝</span>
        <span>Order</span>
      </div>
      <div 
        className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
        onClick={() => navigate('/settings')}
      >
        <span className="nav-icon">⚙️</span>
        <span>Setting</span>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/add" element={<AddStore />} />
            <Route path="/purchase/:storeId" element={<Purchase />} />
            <Route path="/order-summary/:storeId" element={<OrderSummary />} />
            <Route path="/order" element={<Order />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
