// src/AddItem.js
import React, { useState } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function AddItem() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    if (!imageFile) return "";
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "shoppinglist_uploads");
    data.append("cloud_name", "dqrurawst");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dqrurawst/image/upload",
      { method: "POST", body: data }
    );

    const file = await res.json();
    return file.secure_url || "";
  };

  const addItem = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      await addDoc(collection(db, "shoppingItems"), {
        name,
        quantity,
        price,
        category,
        completed: false,
        createdAt: new Date(),
        imageUrl,
        owners: [user.uid],
        sharedBy: user.email,
      });

      alert("Item added!");
      setName("");
      setQuantity("");
      setPrice("");
      setCategory("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Error adding");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add New Item</h2>

      <form onSubmit={addItem}>
        <input
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* CATEGORY DROPDOWN */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option>Snacks</option>
          <option>Dairy</option>
          <option>Fruits</option>
          <option>Vegetables</option>
          <option>Grocery</option>
          <option>Beverages</option>
          <option>Personal Care</option>
          <option>Household</option>
        </select>

        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

        <button type="submit">{loading ? "Adding..." : "Add Item"}</button>
      </form>
    </div>
  );
}

export default AddItem;
