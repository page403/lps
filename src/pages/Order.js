import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchOrders = async (date) => {
    setLoading(true);
    try {
      // Create start and end of the selected date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Create Firestore query
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const ordersList = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() });
      });

      // Sort orders by timestamp descending (newest first)
      ordersList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedDate);
  }, [selectedDate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-page">
      <div className="order-header">
        <h1>Daftar Pesanan</h1>
        <div className="date-picker-container">
          <button 
            className="date-picker-button"
            onClick={() => setIsDatePickerOpen(true)}
          >
            📅
          </button>
          <div className={`date-picker-wrapper ${isDatePickerOpen ? 'open' : ''}`}>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setIsDatePickerOpen(false);
              }}
              inline
              onClickOutside={() => setIsDatePickerOpen(false)}
            />
          </div>
        </div>
      </div>

      <div className="selected-date">
        {formatDate(selectedDate)}
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>Tidak ada pesanan pada tanggal ini</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="store-info">
                  <h3>{order.storeName}</h3>
                  <p>{order.storeAddress}</p>
                </div>
                <div className="order-time">
                  {formatTime(order.timestamp)}
                </div>
              </div>

              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="item-details">
                      <span className="item-name">{item.nama}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-subtotal">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span>Total</span>
                <span className="total-amount">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Order; 