import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDocument } from '../firebase/helpers';
import PageLayout from '../components/PageLayout';

function AddStore() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaToko: '',
    alamat: '',
    noTelp: '',
    kategori: 'retail' // Default value
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDocument("test-user", formData);
      navigate('/');
    } catch (error) {
      console.error("Error adding store:", error);
      // You might want to show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <PageLayout 
      title="Tambah Toko"
      showFab={false}
    >
      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-store-form">
          <div className="form-group">
            <label className="form-label">Nama Toko</label>
            <input
              type="text"
              name="namaToko"
              value={formData.namaToko}
              onChange={handleChange}
              className="form-input"
              placeholder="Masukkan nama toko"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="retail">Retail</option>
              <option value="grosir">Grosir</option>
              <option value="minimarket">Minimarket</option>
              <option value="warung">Warung</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">No. Telepon</label>
            <input
              type="tel"
              name="noTelp"
              value={formData.noTelp}
              onChange={handleChange}
              className="form-input"
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Masukkan alamat lengkap"
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="button-secondary"
              onClick={() => navigate('/')}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

export default AddStore; 