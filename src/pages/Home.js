import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleStoreClick = (storeId) => {
    navigate(`/purchase/${storeId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <h1>Daftar Toko</h1>

      <div className="data-container">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="data-item store-card"
            onClick={() => handleStoreClick(item.id)}
          >
            <h3>{item.namaToko}</h3>
            <p>{item.alamat}</p>
          </div>
        ))}
      </div>

      <button 
        className="fab"
        onClick={() => navigate('/add')}
      >
        +
      </button>
    </div>
  );
}

export default Home; 