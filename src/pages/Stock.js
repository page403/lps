import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PageLayout from '../components/PageLayout';
import '../styles/Stock.css';
import '../styles/loading.css';

function Stock() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    stok: '',
    kategori: '',
    smallUnit: '',
    middleUnit: '',
    unitPerCarton: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().nama,
          stock: doc.data().stok,
          smallUnit: doc.data().smallUnit,
          middleUnit: doc.data().middleUnit,
          unitPerCarton: doc.data().unitPerCarton,
          date: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A',
          category: doc.data().kategori
        }));
        setStocks(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Search and sort function
  const filteredAndSortedStocks = stocks
    .filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      nama: product.name,
      harga: product.price,
      stok: product.stock,
      kategori: product.category,
      smallUnit: product.smallUnit,
      middleUnit: product.middleUnit,
      unitPerCarton: product.unitPerCarton,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    try {
      const productData = {
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        unitPerCarton: Number(formData.unitPerCarton),
      };

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }
      
      // Refresh the products list
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().nama,
        price: doc.data().harga,
        stock: doc.data().stok,
        smallUnit: doc.data().smallUnit,
        middleUnit: doc.data().middleUnit,
        unitPerCarton: doc.data().unitPerCarton,
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A',
        category: doc.data().kategori
      }));
      setStocks(productsData);

      // Reset form and close modal
      setFormData({
        nama: '',
        harga: '',
        stok: '',
        kategori: '',
        smallUnit: '',
        middleUnit: '',
        unitPerCarton: '',
      });
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError('Failed to save product. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading stocks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <PageLayout 
      title="Stock Management"
      showFab={true}
      onFabClick={() => {
        setEditingProduct(null);
        setFormData({
          nama: '',
          harga: '',
          stok: '',
          kategori: '',
          smallUnit: '',
          middleUnit: '',
          unitPerCarton: '',
        });
        setIsModalOpen(true);
      }}
    >
      <div className="stock-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="stock-list">
        {filteredAndSortedStocks.length === 0 ? (
          <div className="no-results">
            <p>No products found</p>
          </div>
        ) : (
          filteredAndSortedStocks.map(item => (
            <div 
              key={item.id} 
              className="stock-item"
              onClick={() => handleEditClick(item)}
            >
              <div className="stock-item-header">
                <h3>{item.name}</h3>
                <span className="stock-date">{item.date}</span>
              </div>
              <div className="stock-details">
                <div className="stock-amount">
                  <span className="label">Stock:</span>
                  <span className="value">{item.stock || 0}</span>
                </div>
                <div className="stock-category">
                  <span className="label">Category:</span>
                  <span className="value">{item.category || 'N/A'}</span>
                </div>
                <div className="stock-units">
                  <div className="unit-item">
                    <span className="label">Small Unit:</span>
                    <span className="value">{item.smallUnit || 'N/A'}</span>
                  </div>
                  <div className="unit-item">
                    <span className="label">Middle Unit:</span>
                    <span className="value">{item.middleUnit || 'N/A'}</span>
                  </div>
                  <div className="unit-item">
                    <span className="label">Per Carton:</span>
                    <span className="value">{item.unitPerCarton || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {submitError && <div className="error-message">{submitError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  placeholder="Product name"
                />
              </div>

              <div className="form-group">
                <label>Price Per Carton</label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  required
                  placeholder="Product price per carton"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  required
                  placeholder="Stock amount"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  required
                  placeholder="Product category"
                />
              </div>

              <div className="form-group">
                <label>Small Unit</label>
                <input
                  type="text"
                  name="smallUnit"
                  value={formData.smallUnit}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., pcs"
                />
              </div>

              <div className="form-group">
                <label>Middle Unit</label>
                <input
                  type="text"
                  name="middleUnit"
                  value={formData.middleUnit}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., pack"
                />
              </div>

              <div className="form-group">
                <label>PCS Units per Carton</label>
                <input
                  type="number"
                  name="unitPerCarton"
                  value={formData.unitPerCarton}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 24"
                  min="1"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Stock; 