import React, { useState, useEffect } from 'react';
import { collection, getDocs, where, Timestamp, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from "react-datepicker";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(''); // State for date input

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedDate) return; // Don't fetch if no date is selected

      try {
        const ordersCollection = collection(db, 'orders');

        // Parse the selected date to a Date object
        const selectedDateObj = new Date(selectedDate);

        // Calculate the start and end of the day in milliseconds
        const startOfDay = selectedDateObj.getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1; // End of day

        const q = query(
          ordersCollection,
          where('timestamp', '>=', new Date(startOfDay)),
          where('timestamp', '<=', new Date(endOfDay))
        );

        const querySnapshot = await getDocs(q);
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() });
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  console.log(orders)

  return (
    <div>
      <h1>Orders</h1>
      <label htmlFor="datePicker">Select Date:</label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={handleDateChange}
      />

      {orders.length === 0 ? (
        <p>No orders found for this date.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              {/* Add more table headers as needed */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.nama}</td>
                <td>{order.quantity}</td>
                <td>{order.totalAmount}</td>
                {/* Add more table data cells as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Order;
