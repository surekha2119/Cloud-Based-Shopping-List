// src/ShareList.js
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function ShareList() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);

  useEffect(() => {
    loadSharedUsers();
  }, []);

  const loadSharedUsers = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const itemsQ = query(
      collection(db, "shoppingItems"),
      where("owners", "array-contains", user.uid)
    );

    const snap = await getDocs(itemsQ);

    const owners = new Set();
    snap.docs.forEach((d) => {
      (d.data().owners || []).forEach((o) => {
        if (o !== user.uid) owners.add(o);
      });
    });

    if (owners.size === 0) return setSharedUsers([]);

    const usersQ = query(
      collection(db, "users"),
      where("uid", "in", Array.from(owners))
    );

    const usersSnap = await getDocs(usersQ);

    setSharedUsers(usersSnap.docs.map((d) => d.data()));
  };

  const shareFullList = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");

    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) return setMessage("User not found.");

    const targetUid = snap.docs[0].data().uid;

    const itemsQ = query(
      collection(db, "shoppingItems"),
      where("owners", "array-contains", user.uid)
    );

    const itemsSnap = await getDocs(itemsQ);

    const updates = itemsSnap.docs.map((d) =>
      updateDoc(doc(db, "shoppingItems", d.id), {
        owners: arrayUnion(targetUid),
      })
    );

    await Promise.all(updates);

    setMessage(`List shared with ${email}`);
    setEmail("");
    loadSharedUsers();
  };

  const unshareUser = async (targetEmail) => {
    const user = auth.currentUser;
    const q = query(collection(db, "users"), where("email", "==", targetEmail));
    const snap = await getDocs(q);

    if (snap.empty) return;

    const targetUid = snap.docs[0].data().uid;

    const itemsQ = query(
      collection(db, "shoppingItems"),
      where("owners", "array-contains", user.uid)
    );

    const itemsSnap = await getDocs(itemsQ);

    const updates = itemsSnap.docs.map((d) =>
      updateDoc(doc(db, "shoppingItems", d.id), {
        owners: arrayRemove(targetUid),
      })
    );

    await Promise.all(updates);

    setMessage(`Removed ${targetEmail} from your list.`);
    loadSharedUsers();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Share Full List</h2>

      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={shareFullList}>Share</button>

      {message && <p style={{ color: "crimson" }}>{message}</p>}

      <h3>Currently Shared With:</h3>
      {sharedUsers.map((u) => (
        <div key={u.uid}>
          {u.email} ({u.displayName})
          <button onClick={() => unshareUser(u.email)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default ShareList;
