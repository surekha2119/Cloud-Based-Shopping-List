// src/ItemList.js
import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function ItemList() {
  const [myItems, setMyItems] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalSharedUsers, setModalSharedUsers] = useState([]);
  const [modalEmailToAdd, setModalEmailToAdd] = useState("");
  const [message, setMessage] = useState("");

  // Load items
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "shoppingItems"),
      where("owners", "array-contains", user.uid)
    );

    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const mine = arr.filter((i) => i.sharedBy === user.email);
      const shared = arr.filter((i) => i.sharedBy !== user.email);

      setMyItems(mine);
      setSharedItems(shared);
    });
  }, []);

  // Open modal
  const openManageSharing = async (item) => {
    setModalItem(item);
    setModalOpen(true);
    setMessage("");

    try {
      const owners = item.owners || [];
      if (owners.length === 0) return setModalSharedUsers([]);

      const usersQ = query(
        collection(db, "users"),
        where("uid", "in", owners)
      );
      const snap = await getDocs(usersQ);

      setModalSharedUsers(snap.docs.map((d) => d.data()));
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
    setModalEmailToAdd("");
    setMessage("");
  };

  // Add user (share item)
  const addUserToItem = async () => {
    if (!modalEmailToAdd) return setMessage("Enter email");

    try {
      const q = query(collection(db, "users"), where("email", "==", modalEmailToAdd));
      const snap = await getDocs(q);

      if (snap.empty) return setMessage("User not found");

      const targetUid = snap.docs[0].data().uid;

      await updateDoc(doc(db, "shoppingItems", modalItem.id), {
        owners: arrayUnion(targetUid),
      });

      setMessage(`Shared with ${modalEmailToAdd}`);
      setModalEmailToAdd("");
      openManageSharing({ ...modalItem, owners: [...modalItem.owners, targetUid] });
    } catch (err) {
      console.error(err);
      setMessage("Error");
    }
  };

  // Remove user from item
  const removeUserFromItem = async (uid) => {
    try {
      await updateDoc(doc(db, "shoppingItems", modalItem.id), {
        owners: arrayRemove(uid),
      });

      setMessage("Removed user");
      openManageSharing({
        ...modalItem,
        owners: modalItem.owners.filter((o) => o !== uid),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle completed
  const toggle = async (item) => {
    await updateDoc(doc(db, "shoppingItems", item.id), {
      completed: !item.completed,
    });
  };

  // Delete
  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "shoppingItems", id));
  };

  // Edit item
  const editItem = async (item) => {
    const name = prompt("Name", item.name) || item.name;
    const qty = prompt("Quantity", item.quantity) || item.quantity;
    const price = prompt("Price", item.price) || item.price;
    const category = prompt("Category", item.category) || item.category;

    await updateDoc(doc(db, "shoppingItems", item.id), {
      name,
      quantity: qty,
      price,
      category,
    });
  };

  // Search filter
  const filterItems = (list) => {
    const t = search.toLowerCase();
    return list.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(t) ||
        (i.category || "").toLowerCase().includes(t)
    );
  };

  const fMine = filterItems(myItems);
  const fShared = filterItems(sharedItems);

  // Total (deduct completed)
  const total = [...fMine, ...fShared].reduce((sum, item) => {
    if (item.completed) return sum; // don't count completed items
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Shopping List</h2>

      <input
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
        placeholder="Search by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* MY ITEMS */}
      <h3>My Items</h3>
      {fMine.map((item) => (
        <div key={item.id} className="list-item-card">
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggle(item)}
            />

            {/* IMAGE DISPLAY */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            )}

            <div style={{ flex: 1 }}>
              <b className={item.completed ? "completed" : ""}>
                {item.name}
              </b>
              <br />
              Qty: {item.quantity} • Price: ₹{item.price}
              <br />
              Category: {item.category}
            </div>

            <button onClick={() => editItem(item)}>Edit</button>
            <button onClick={() => remove(item.id)}>Delete</button>
            <button onClick={() => openManageSharing(item)}>Manage Sharing</button>
          </div>
        </div>
      ))}

      {/* SHARED ITEMS */}
      <h3>Shared With Me</h3>
      {fShared.map((item) => (
        <div key={item.id} className="list-item-card">
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggle(item)}
            />

            {/* IMAGE DISPLAY */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            )}

            <div style={{ flex: 1 }}>
  <b className={item.completed ? "completed" : ""}>
    {item.name}
  </b>
  <br />
  Qty: {item.quantity} • Price: ₹{item.price}
  <br />
  Category: {item.category}
  <br />

  {/* 🔥 NEW — Show who shared the item */}
  <span style={{ fontSize: "14px", color: "#555" }}>
    Shared by: <b>{item.sharedBy}</b>
  </span>
</div>


            <button onClick={() => editItem(item)}>Edit</button>
            <button onClick={() => remove(item.id)}>Delete</button>
            <button onClick={() => openManageSharing(item)}>Manage Sharing</button>
          </div>
        </div>
      ))}

      {/* TOTAL */}
      <h3>Total: ₹{total}</h3>

      {/* SHARING MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Sharing: {modalItem?.name}</h3>

            <strong>Shared With:</strong>
            <ul>
              {modalSharedUsers.map((u) => (
                <li key={u.uid}>
                  {u.email}{" "}
                  <button onClick={() => removeUserFromItem(u.uid)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <input
              placeholder="Enter email"
              value={modalEmailToAdd}
              onChange={(e) => setModalEmailToAdd(e.target.value)}
            />
            <button onClick={addUserToItem}>Add</button>

            {message && <p style={{ color: "red" }}>{message}</p>}

            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemList;
