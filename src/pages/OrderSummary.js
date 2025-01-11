import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDocument } from '../firebase/helpers';

function OrderSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cart: initialCart, store } = state || {};
  const [cart, setCart] = useState(initialCart || []);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  };

  const adjustQuantity = (itemId, change) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const orderData = {
        storeId: store.id,
        storeName: store.namaToko,
        storeAddress: store.alamat,
        items: cart.map(item => ({
          productId: item.id,
          nama: item.nama,
          harga: item.harga,
          quantity: item.quantity,
          subtotal: item.harga * item.quantity
        })),
        totalAmount: calculateTotal(),
        orderDate: new Date().toISOString(),
        timestamp: new Date(),
        status: 'completed'
      };

      await addDocument('orders', orderData);
      alert('Pesanan berhasil disimpan!');
      navigate('/');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Terjadi kesalahan saat menyimpan pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || !store) {
    return <div>Data tidak ditemukan</div>;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="order-summary">
      <div className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="store-info">
          <h1>Ringkasan Pesanan</h1>
        </div>
      </div>

      <div className="store-details">
        <h2>{store.namaToko}</h2>
        <p>{store.alamat}</p>
        <p className="order-date">{currentDate}</p>
      </div>

      <div className="order-items">
        {cart.map((item) => (
          <div key={item.id} className="order-item">
            <div className="item-info">
              <h3>{item.nama}</h3>
              <div className="quantity-controls">
                <button onClick={() => adjustQuantity(item.id, -1)}>-</button>
                <span className="quantity">Jumlah: {item.quantity}</span>
                <button onClick={() => adjustQuantity(item.id, 1)}>+</button>
                <button 
                  className="remove-item"
                  onClick={() => removeItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="item-price">
              {formatPrice(item.harga * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="order-total">
        <h3>Total Pembayaran</h3>
        <p className="total-price">{formatPrice(calculateTotal())}</p>
      </div>

      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={cart.length === 0 || isProcessing}
      >
        {isProcessing ? 'Memproses...' : 'Selesaikan Pesanan'}
      </button>
    </div>
  );
}

export default OrderSummary; 