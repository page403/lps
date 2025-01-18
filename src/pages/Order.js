import React, { useState, useEffect } from 'react';
import { collection, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from "react-datepicker";

function Order() {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchData = async (selectedDate) => {
    const startOfToday = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfToday = new Date(selectedDate.setHours(23, 59, 59, 999));

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
    fetchData(selectedDate)
  },[selectedDate])

  const handleDateChange = (selectedDate) => {
    setSelectedDate(selectedDate)
  }

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
      <DatePicker selected={selectedDate} onChange={handleDateChange} />
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
