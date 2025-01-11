import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addSampleProducts } from '../firebase/helpers';

function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = [];
      querySnapshot.forEach((doc) => {
        productList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to format price in Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'nama':
        return order * a.nama.localeCompare(b.nama);
      case 'kategori':
        return order * a.kategori.localeCompare(b.kategori);
      case 'stok':
        return order * (a.stok - b.stok);
      default:
        return 0;
    }
  });

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === sortBy) {
      // If clicking the same sort option, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If new sort option, set to ascending
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="stock-container">
      <h1>Stok Produk</h1>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>Belum ada produk</p>
          <button onClick={addSampleProducts} className="add-sample-btn">
            Tambah Data Contoh
          </button>
        </div>
      ) : (
        <>
          {/* Sort Controls */}
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="nama">Urutkan berdasarkan Nama</option>
              <option value="kategori">Urutkan berdasarkan Kategori</option>
              <option value="stok">Urutkan berdasarkan Stok</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="product-list">
            {sortedProducts.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <h3>{product.nama}</h3>
                  <p className="category">{product.kategori}</p>
                  <p className="price">{formatPrice(product.harga)}</p>
                </div>
                <div className="stock-info">
                  <span className={`stock-count ${product.stok < 50 ? 'low-stock' : ''}`}>
                    {product.stok}
                  </span>
                  <span className="stock-label">unit</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Stock; 