// Login.js
import React, { useState } from "react";
import "./admin.css";
import Swal from "sweetalert2"; 
import appFirebase from "../firebase/firebase";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
const auth=getAuth(appFirebase);

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Validar la estructura del correo electrónico con una expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, introduce un correo electrónico válido.",
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: 'success',
        title: 'Sucess',
        text: 'Se inicio sesion',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al iniciar sesión. Verifica tus credenciales.',
      });
      console.error('Error de autenticación:', error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Inicio de sesión</h2>
        <label>Correo</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Admin;
