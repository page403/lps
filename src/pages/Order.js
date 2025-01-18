import { useState, useEffect } from 'react';
import { collection, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/loading.css';

function Order() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [today, setDate] = useState(new Date())

  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"), 
      where('timestamp', '>=', Timestamp.fromDate(startOfToday)), 
      where('timestamp', '<=', Timestamp.fromDate(endOfToday))
    );
      const documents = []
      querySnapshot.forEach((doc) => {
        documents.push({id: doc.id, ...doc.data()})
      })
      setData(documents)
    } catch (error) {
      console.log("Error fetching data: ", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  },[])


  if (loading){
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading...</span>
      </div>
    )
  }

  return (
    <div className="data-container">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="data-item store-card">
            <div className="store-info-container">
              <h3>{item.storeName}</h3>
              <p>{item.storeAddress}</p>
              <p>{item.items.map(i => <ul><li>{i.nama}
                <span> x {i.quantity} = {i.subtotal}</span>
                </li></ul>)}</p>
                <b>{item.totalAmount}</b>
            </div>
          </div>
        ))}
      </div>
  )

}

export default Order; 