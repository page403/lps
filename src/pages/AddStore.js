import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDocument } from '../firebase/helpers';

function AddStore() {
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState({
    namaToko: '',
    alamat: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDocument("test-user", newItem);
      // Navigate back to home after successful addition
      navigate('/');
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-store-page">
      <div className="add-item-form">
        <div className="form-header">
          <h2>Tambah Toko Baru</h2>
          <button className="close-button" onClick={() => navigate('/')}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="namaToko"
              value={newItem.namaToko}
              onChange={handleChange}
              placeholder="Masukkan nama toko"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="alamat"
              value={newItem.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat toko"
              required
            />
          </div>
          <button type="submit">Tambah Toko</button>
        </form>
      </div>
    </div>
  );
}

export default AddStore; 