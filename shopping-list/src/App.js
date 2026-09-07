// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import AddItem from "./AddItem";
import ItemList from "./ItemList";
import ShareList from "./ShareList";
import "./App.css";
import { auth } from "./firebase";

function App() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Router>
      <nav className="navbar">
        <div className="nav-left">
          <h2>Shopping List</h2>
        </div>

        <div className="nav-right">
          <Link to="/">Home</Link>
          <Link to="/add">Add Item</Link>
          <Link to="/shared">Shared Items</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/shared" element={<ShareList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
