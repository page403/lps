import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import '../styles/loading.css';

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [todayComparison, setTodayComparison] = useState(0);
  const [monthComparison, setMonthComparison] = useState(0);
  const [storeTrends, setStoreTrends] = useState({});
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "test-user"));
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      setData(documents);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // Get dates for today and yesterday
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get dates for this month and last month
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

      // Today's range
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      // Yesterday's range
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      // This month's end
      const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      // Create queries
      const todayQuery = query(
        collection(db, 'orders'),
        where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
        where('timestamp', '<=', Timestamp.fromDate(endOfToday))
      );

      const yesterdayQuery = query(
        collection(db, 'orders'),
        where('timestamp', '>=', Timestamp.fromDate(startOfYesterday)),
        where('timestamp', '<=', Timestamp.fromDate(endOfYesterday))
      );

      const thisMonthQuery = query(
        collection(db, 'orders'),
        where('timestamp', '>=', Timestamp.fromDate(thisMonth)),
        where('timestamp', '<=', Timestamp.fromDate(endOfThisMonth))
      );

      const lastMonthQuery = query(
        collection(db, 'orders'),
        where('timestamp', '>=', Timestamp.fromDate(lastMonth)),
        where('timestamp', '<=', Timestamp.fromDate(lastMonthEnd))
      );

      // Get all data
      const [todaySnapshot, yesterdaySnapshot, thisMonthSnapshot, lastMonthSnapshot] = 
        await Promise.all([
          getDocs(todayQuery),
          getDocs(yesterdayQuery),
          getDocs(thisMonthQuery),
          getDocs(lastMonthQuery)
        ]);

      // Calculate totals
      const todaySum = todaySnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
      const yesterdaySum = yesterdaySnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
      const thisMonthSum = thisMonthSnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
      const lastMonthSum = lastMonthSnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);

      // Calculate percentage changes
      const dayChange = yesterdaySum === 0 ? 100 : ((todaySum - yesterdaySum) / yesterdaySum) * 100;
      const monthChange = lastMonthSum === 0 ? 100 : ((thisMonthSum - lastMonthSum) / lastMonthSum) * 100;

      setTodayTotal(todaySum);
      setMonthTotal(thisMonthSum);
      setTodayComparison(dayChange);
      setMonthComparison(monthChange);
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  };

  const fetchStoreTrends = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      const ordersRef = collection(db, 'orders');
      
      // Get today's and yesterday's orders
      const [todayOrders, yesterdayOrders] = await Promise.all([
        getDocs(query(
          ordersRef,
          where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
          where('timestamp', '<=', Timestamp.fromDate(endOfToday))
        )),
        getDocs(query(
          ordersRef,
          where('timestamp', '>=', Timestamp.fromDate(startOfYesterday)),
          where('timestamp', '<=', Timestamp.fromDate(endOfYesterday))
        ))
      ]);

      // Calculate totals by store
      const todayTotals = {};
      const yesterdayTotals = {};

      todayOrders.forEach(doc => {
        const data = doc.data();
        todayTotals[data.storeId] = (todayTotals[data.storeId] || 0) + data.totalAmount;
      });

      yesterdayOrders.forEach(doc => {
        const data = doc.data();
        yesterdayTotals[data.storeId] = (yesterdayTotals[data.storeId] || 0) + data.totalAmount;
      });

      // Calculate trends
      const trends = {};
      Object.keys({ ...todayTotals, ...yesterdayTotals }).forEach(storeId => {
        const todayAmount = todayTotals[storeId] || 0;
        const yesterdayAmount = yesterdayTotals[storeId] || 0;
        trends[storeId] = {
          trend: todayAmount >= yesterdayAmount ? 'up' : 'down',
          percentage: yesterdayAmount === 0 ? 100 :
            ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100
        };
      });

      setStoreTrends(trends);
    } catch (error) {
      console.error("Error fetching store trends:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOrderStats();
    fetchStoreTrends();
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleStoreClick = (storeId) => {
    navigate(`/purchase/${storeId}`);
  };

  const formatPercentage = (percentage) => {
    const value = Math.abs(percentage).toFixed(1);
    const sign = percentage >= 0 ? '↑' : '↓';
    const color = percentage >= 0 ? 'positive-change' : 'negative-change';
    return { value, sign, color };
  };

  const renderTrendIndicator = (storeId) => {
    const trend = storeTrends[storeId];
    if (!trend) return null;

    return (
      <div className={`trend-indicator ${trend.trend}`}>
        {trend.trend === 'up' ? '↑' : '↓'}
        <span className="trend-percentage">
          {Math.abs(trend.percentage).toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="app-header">
        <h1>Lumbung Pangan Semesta</h1>
        <div className="header-actions">
          <button className="icon-button">
            <span>👤</span>
          </button>
        </div>
      </div>

      <div className="stats-widgets">
        <div className="stat-widget">
          <h3>Penjualan Hari Ini</h3>
          <p className="stat-value">{formatPrice(todayTotal)}</p>
          {todayComparison !== 0 && (
            <p className={`comparison ${formatPercentage(todayComparison).color}`}>
              {formatPercentage(todayComparison).sign} {formatPercentage(todayComparison).value}%
              <span className="comparison-label"> dari kemarin</span>
            </p>
          )}
        </div>
        <div className="stat-widget">
          <h3>Penjualan Bulan Ini</h3>
          <p className="stat-value">{formatPrice(monthTotal)}</p>
          {monthComparison !== 0 && (
            <p className={`comparison ${formatPercentage(monthComparison).color}`}>
              {formatPercentage(monthComparison).sign} {formatPercentage(monthComparison).value}%
              <span className="comparison-label"> dari bulan lalu</span>
            </p>
          )}
        </div>
      </div>

      {/* <div className="section-container">
        <h2 className="section-title">Daftar Toko</h2>
      </div> */}
      <div className="section-container">
        <h2 className="section-title">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
        </h2>
      </div>

      <div className="data-container">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="data-item store-card"
            onClick={() => handleStoreClick(item.id)}
          >
            <div className="store-info-container">
              <h3>{item.namaToko}</h3>
              <p>{item.alamat}</p>
            </div>
            {renderTrendIndicator(item.id)}
          </div>
        ))}
      </div>

      <button 
        className={`fab ${isVisible ? 'fab-visible' : 'fab-hidden'}`}
        onClick={() => navigate('/add')}
      >
        +
      </button>
    </div>
  );
}

export default Home; 