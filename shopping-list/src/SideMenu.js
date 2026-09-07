// src/SideMenu.js
import React from "react";
import "./SideMenu.css";

function SideMenu({ isOpen, onClose }) {

  // ⭐ FIX: Define scroll function INSIDE component
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      onClose(); // close menu
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      ></div>

      {/* Sliding side menu */}
      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <h2 className="menu-title">Menu</h2>

        <ul className="menu-items">

          {/* ⭐ Buttons now call scrollToSection correctly */}
          <li>
            <button onClick={() => scrollToSection("add")}>Add Item</button>
          </li>

          <li>
            <button onClick={() => scrollToSection("list")}>Your Items</button>
          </li>

          <li>
            <button onClick={() => scrollToSection("shared")}>
              Shared With You
            </button>
          </li>

          <li>
            <button onClick={() => scrollToSection("login")}>Login</button>
          </li>

          <li>
            <button onClick={() => scrollToSection("signup")}>Signup</button>
          </li>

        </ul>
      </div>
    </>
  );
}

export default SideMenu;
