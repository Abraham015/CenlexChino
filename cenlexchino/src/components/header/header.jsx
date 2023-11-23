import React, { useState, useEffect, useRef } from "react";
import "./header.css";
import appFirebase from "../firebase/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const auth = getAuth(appFirebase);

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Update login status based on Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!user);
    });

    // Important: Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  // Render menu items based on login status
  useEffect(() => {
    setIsLoggedIn(false);
  }, []);

  const renderMenuItems = () => {
    if (!!isLoggedIn) {
      return (
        <>
          <li>
            <a href="/" onClick={closeMenu}>Inicio</a>
          </li>
          <li>
            <a href="#about" onClick={closeMenu}>Acerca del proyecto</a>
          </li>
          <li>
            <a href="#material" onClick={closeMenu}>Material</a>
          </li>
          <li>
            <a href="/administrador" onClick={closeMenu}>Administrador</a>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li>
            <a href="/" onClick={()=>signOut(auth)}>Cerrar sesión</a>
          </li>
        </>
      );
    }
  };

  return (
    <header>
      <div className="back">
        <div className="menu contenedor" ref={menuRef}>
          <a href="#home" className="logo">
            Chino
          </a>
          <input
            type="checkbox"
            id="menu"
            checked={menuOpen}
            onChange={toggleMenu}
          />
          <label htmlFor="menu">
            <img srcSet={require("../../assets/menu.png")} className="menu-icon" alt="" />
          </label>
          <nav className={`navbar ${menuOpen ? "open" : ""}`}>
            <ul>{renderMenuItems()}</ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
