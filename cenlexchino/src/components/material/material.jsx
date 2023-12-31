import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import appFirebase from '../firebase/firebase';
import './material.css';

const Material = () => {
  const [planes, setPlanes] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');

  useEffect(() => {
    const fetchPlanes = async () => {
      const db = getFirestore(appFirebase);
      const planesSnapshot = await getDocs(collection(db, 'Plan'));
      const planesData = planesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlanes(planesData);
    };

    fetchPlanes();
  }, []);

  useEffect(() => {
    // Consultar niveles asociados al plan seleccionado
    const fetchNiveles = async () => {
      if (selectedPlan) {
        const db = getFirestore(appFirebase);
        const nivelesQuery = query(collection(db, 'Nivel'), where('Plan', '==', selectedPlan));
        const nivelesSnapshot = await getDocs(nivelesQuery);
        const nivelesData = nivelesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNiveles(nivelesData);
      } else {
        // Si no hay un plan seleccionado, establecer niveles como vacío
        setNiveles([]);
      }
    };

    fetchNiveles();
  }, [selectedPlan]);

  useEffect(() => {
    // Consultar documentos asociados al nivel y plan seleccionados
    const fetchDocumentos = async () => {
      if (selectedNivel) {
        const db = getFirestore(appFirebase);
        const documentosQuery = query(collection(db, 'Material'), where('PlanId', '==', selectedPlan), where('NivelId', '==', selectedNivel));
        const documentosSnapshot = await getDocs(documentosQuery);
        const documentosData = documentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocumentos(documentosData);
        console.log(documentosSnapshot);
      } else {
        // Si no hay un nivel seleccionado, establecer documentos como vacío
        setDocumentos([]);
      }
    };

    fetchDocumentos();
  }, [selectedNivel, selectedPlan]);

  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleNivelChange = (e) => {
    setSelectedNivel(e.target.value);
  };

  return (
    <div className='material' id='material'>
      <p className='material__title'>Material</p>
      <div className="selects-derecha">
        <select value={selectedPlan} onChange={handlePlanChange}>
          <option value="0">Selecciona un plan</option>
          {planes.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.Name}
            </option>
          ))}
        </select>

        <select value={selectedNivel} onChange={handleNivelChange}>
          <option value="0">Selecciona un nivel</option>
          {niveles.map((nivel) => (
            <option key={nivel.id} value={nivel.id}>
              {nivel.Name}
            </option>
          ))}
        </select>
      </div>

      {documentos.length > 0 && (
        <div className="tarjetas-documentos">
          {documentos.map((documento) => (
            <div key={documento.id} className="tarjeta-documento">
              <h3>{documento.Nombre}</h3>
              {/* Agrega otros detalles del documento según tu modelo de datos */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Material;
