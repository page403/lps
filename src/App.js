import './App.css';
import './styles/Login.css';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      username === process.env.REACT_APP_USERNAME && 
      password === process.env.REACT_APP_PASSWORD
    ) {
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

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
