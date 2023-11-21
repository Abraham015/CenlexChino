import React, { useState, useEffect, useRef } from 'react';
import './header.css'; // Asegúrate de tener el nombre correcto del archivo de estilos

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Agrega un manejador de eventos de clic al documento para cerrar el menú
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    }

    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header>
      <div className="back">
        <div className="menu contenedor" ref={menuRef}>
          <a href="#home" className="logo">Chino</a>
          <input type="checkbox" id="menu" checked={menuOpen} onChange={toggleMenu} />
          <label htmlFor="menu">
            <img srcSet={require("../../assets/menu.png")} className="menu-icon" alt=""/>
          </label>
          <nav className={`navbar ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li><a href="#home" onClick={closeMenu}>Inicio</a></li>
              <li><a href="#about" onClick={closeMenu}>Acerca del proyecto</a></li>
              <li><a href="#material" onClick={closeMenu}>Material</a></li>
              <li><a href="#" onClick={closeMenu}>Administrador</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
