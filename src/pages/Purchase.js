import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function Purchase() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {
        const storeDoc = await getDoc(doc(db, "test-user", storeId));
        if (storeDoc.exists()) {
          setStore({ id: storeDoc.id, ...storeDoc.data() });
        }

        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = [];
        querySnapshot.forEach((doc) => {
          productList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [storeId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const goToOrderSummary = () => {
    if (cart.length > 0) {
      navigate(`/order-summary/${storeId}`, { 
        state: { 
          cart,
          store
        }
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!store) return <div>Toko tidak ditemukan</div>;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="purchase-page">
      <div className="store-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ←
        </button>
        <div className="store-info">
          <h1>{store.namaToko}</h1>
          <p>{store.alamat}</p>
        </div>
        <button 
          className="cart-button"
          onClick={goToOrderSummary}
        >
          🛒
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => addToCart(product)}
          >
            <h3>{product.nama}</h3>
            <p className="category">{product.kategori}</p>
            <p className="price">{formatPrice(product.harga)}</p>
            <p className="stock">Stok: {product.stok}</p>
            <div className="cart-quantity">
              {cart.find(item => item.id === product.id)?.quantity || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Purchase; 