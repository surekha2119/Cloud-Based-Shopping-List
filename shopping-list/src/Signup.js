import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        displayName,
        createdAt: new Date(),
      });

      alert("Signup Successful");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h3>Signup</h3>
      <input placeholder="Name" onChange={(e) => setDisplayName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signup}>Signup</button>
    </div>
  );
}

export default Signup;
