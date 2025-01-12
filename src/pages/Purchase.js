import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import PageLayout from '../components/PageLayout';
import '../styles/loading.css';

function Purchase() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {
        const storeDoc = await getDoc(doc(db, "test-user", storeId));
        if (storeDoc.exists()) {
          setStore({ id: storeDoc.id, ...storeDoc.data() });
        }

        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = [];
        const categorySet = new Set();
        
        querySnapshot.forEach((doc) => {
          const product = { id: doc.id, ...doc.data() };
          productList.push(product);
          categorySet.add(product.kategori);
        });
        
        setProducts(productList);
        setCategories(['all', ...Array.from(categorySet)]);
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

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const filteredProducts = products
    .filter(product => 
      product.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'all' || product.kategori === selectedCategory)
    );

  const cartTotal = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    );
  }
  if (!store) return <div>Toko tidak ditemukan</div>;

  return (
    <PageLayout 
      title={store.namaToko}
      showFab={false}
    >
      <div className="purchase-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-scroll">
          {categories.map(category => (
            <button
              key={category}
              className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Semua' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.nama}</h3>
              <p className="category">{product.kategori}</p>
              <p className="price">{formatPrice(product.harga)}</p>
              <p className="stock">Stok: {product.stok}</p>
            </div>
            <div className="product-actions">
              {cart.find(item => item.id === product.id)?.quantity > 0 && (
                <button 
                  className="quantity-btn remove"
                  onClick={() => removeFromCart(product.id)}
                >
                  -
                </button>
              )}
              <span className="quantity">
                {cart.find(item => item.id === product.id)?.quantity || 0}
              </span>
              <button 
                className="quantity-btn add"
                onClick={() => addToCart(product)}
                disabled={product.stok === 0}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {cartItemCount > 0 && (
        <div className="cart-summary">
          <div className="cart-info">
            <span>{cartItemCount} item</span>
            <span className="cart-total">{formatPrice(cartTotal)}</span>
          </div>
          <button 
            className="checkout-button"
            onClick={() => navigate('/order-summary/' + storeId, { 
              state: { cart, store } 
            })}
          >
            Checkout
          </button>
        </div>
      )}
    </PageLayout>
  );
}

export default Purchase; 