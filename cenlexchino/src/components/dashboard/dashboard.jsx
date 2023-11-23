import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import appFirebase from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import Swal from "sweetalert2"; 
import "./dashboard.css";

const auth = getAuth(appFirebase);

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFormNew, setShowFormNew] = useState(false);
  const [nombrePlan, setNombrePlan] = useState("");
  const [nombreNivel, setNombreNivel] = useState("");
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!user);
    });

    // Important: Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Obtener planes desde Firestore
    const fetchPlanes = async () => {
      const db = getFirestore(appFirebase);
      const planesSnapshot = await getDocs(collection(db, "Plan"));
      const planesData = planesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlanes(planesData);
    };

    fetchPlanes();
  }, [showFormNew]);

  const handleFormSubmitPlan = async (e) => {
    e.preventDefault();

    // Validar que el nombre del plan no esté vacío
    if (!nombrePlan.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre del plan no puede estar vacío.',
      });
      return;
    }

    // Agregar el nuevo plan a Firestore
    await crearPlan(nombrePlan);
  };

  const crearPlan = async (nombre) => {
    const db = getFirestore(appFirebase);

    try {
      await addDoc(collection(db, "Plan"), {
        Name: nombre,
      });
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Plan creado con éxito.',
      });

      // Limpiar el formulario y ocultar el formulario después de agregar el plan
      setNombrePlan("");
      setShowFormNew(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear un nuevo plan.',
      });
      console.error('Error al crear el documento:', error);
    }
  };

  const handleFormSubmitNivel = async (e) => {
    e.preventDefault();

    // Validar que el nombre del nivel no esté vacío
    if (!nombreNivel.trim() || !selectedPlan) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre del nivel y la selección de plan son obligatorios.',
      });
      return;
    }

    // Buscar el nombre del plan seleccionado
    const selectedPlanObject = planes.find(plan => plan.id === selectedPlan);

    // Agregar el nuevo nivel a Firestore
    await crearNivel(nombreNivel, selectedPlanObject.Name, selectedPlan);
  };

  const crearNivel = async (nombreNivel, nombrePlan, selectedPlan) => {
    const db = getFirestore(appFirebase);

    try {
      await addDoc(collection(db, "Nivel"), {
        Name: nombreNivel,
        Plan: nombrePlan,
        PlanId: selectedPlan,
      });
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Nivel creado con éxito.',
      });

      // Limpiar el formulario y ocultar el formulario después de agregar el nivel
      setNombreNivel("");
      setSelectedPlan("");
      setShowFormNew(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear un nuevo nivel.',
      });
      console.error('Error al crear el documento:', error);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="dashboard">
      <div className="buttons">
        <button onClick={() => setShowFormNew(true)}>Crear Plan</button>
        <button onClick={() => setShowFormNew(false)}>Crear Nivel</button>
      </div>

      {showFormNew ? (
        <div className="formulario">
          <h2>Crear Plan</h2>
          <form onSubmit={handleFormSubmitPlan}>
            <label>Nombre del Plan</label>
            <input
              type="text"
              value={nombrePlan}
              onChange={(e) => setNombrePlan(e.target.value)}
              required
            />
            <button type="submit">Crear</button>
          </form>
        </div>
      ) : (
        <div className="formulario">
          <h2>Crear Nivel</h2>
          <form onSubmit={handleFormSubmitNivel}>
            <label>Nombre del Nivel</label>
            <input
              type="text"
              value={nombreNivel}
              onChange={(e) => setNombreNivel(e.target.value)}
              required
            />
            <label>Selecciona un Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              required
            >
            <option value="" disabled>Selecciona un Plan</option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.Name}
                </option>
              ))}
            </select>
            <button type="submit">Crear</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
