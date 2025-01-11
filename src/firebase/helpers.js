import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

export const addDocument = async (collectionName, data) => {
  // If the data includes a timestamp field, convert it to Firestore Timestamp
  if (data.timestamp) {
    data.timestamp = Timestamp.fromDate(new Date(data.timestamp));
  }
  
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// New function to add sample products
export const addSampleProducts = async () => {
  const sampleProducts = [
    {
      nama: "Indomie Goreng",
      harga: 3500,
      stok: 150,
      kategori: "Mie Instan"
    },
    {
      nama: "Beras Pandan Wangi 5kg",
      harga: 68000,
      stok: 45,
      kategori: "Beras"
    },
    {
      nama: "Minyak Goreng Bimoli 2L",
      harga: 45000,
      stok: 72,
      kategori: "Minyak"
    },
    {
      nama: "Telur Ayam 1kg",
      harga: 28000,
      stok: 100,
      kategori: "Telur"
    },
    {
      nama: "Gula Pasir 1kg",
      harga: 15000,
      stok: 200,
      kategori: "Bahan Pokok"
    }
  ];

  try {
    for (const product of sampleProducts) {
      await addDocument("products", product);
    }
    console.log("Sample products added successfully!");
  } catch (error) {
    console.error("Error adding sample products:", error);
  }
}; 