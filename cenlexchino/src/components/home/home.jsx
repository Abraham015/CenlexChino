import "./home.css";
import "../about/about.css";
import "../material/material.css";
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import appFirebase from "../firebase/firebase";

const Home = () => {
  const [planes, setPlanes] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [section, setSection] = useState([]);

  useEffect(() => {
    const fetchPlanes = async () => {
      const db = getFirestore(appFirebase);
      const planesSnapshot = await getDocs(collection(db, "Plan"));
      const planesData = planesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlanes(planesData);
    };

    fetchPlanes();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const db = getFirestore(appFirebase);
      const planesSnapshot = await getDocs(collection(db, "Secciones"));
      const planesData = planesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSection(planesData);
    };

    fetchSections();
  }, []);

  useEffect(() => {
    // Consultar niveles asociados al plan seleccionado
    const fetchNiveles = async () => {
      if (selectedPlan) {
        console.log("Selected Plan:", selectedPlan); // Agrega este log
        const db = getFirestore(appFirebase);
        const nivelesQuery = query(
          collection(db, "Nivel"),
          where("PlanId", "==", selectedPlan)
        );
        try {
          const nivelesSnapshot = await getDocs(nivelesQuery);
          console.log("Niveles Snapshot:", nivelesSnapshot.docs); // Agrega este log
          const nivelesData = nivelesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Niveles Data:", nivelesData); // Agrega este log
          setNiveles(nivelesData);
        } catch (error) {
          console.error("Error fetching niveles:", error); // Agrega este log
        }
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
        const documentosQuery = query(
          collection(db, "Material"),
          where("PlanId", "==", selectedPlan),
          where("NivelId", "==", selectedNivel)
        );
        // Obtener secciones desde Firestore
        const secSnapshot = await getDocs(collection(db, "Secciones"));
        const secData = secSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSecciones(secData);

        const documentosSnapshot = await getDocs(documentosQuery);
        const documentosData = documentosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Documents Data:", documentosData); // Agrega este log
        setDocumentos(documentosData);
      } else {
        // Si no hay un nivel seleccionado, establecer documentos como vacío
        setDocumentos([]);
      }
    };

    fetchDocumentos();
  }, [selectedNivel, selectedPlan]);

  /*useEffect(() => {
    const obtenerDatosDesdeFirebase = async () => {
      try {
        // Obtener documentos desde Firestore
        const db = getFirestore(appFirebase);
        const docsSnapshot = await getDocs(collection(db, "Material"));
        const docsData = docsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocumentos(docsData);

        // Obtener secciones desde Firestore
        const secSnapshot = await getDocs(collection(db, "Secciones"));
        const secData = secSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSecciones(secData);
      } catch (error) {
        console.error("Error al obtener datos desde Firebase:", error);
      }
    };

    obtenerDatosDesdeFirebase();
  }, []);*/

  const documentosPorSeccion = documentos.reduce((acc, documento) => {
    const seccion = section.find((s) => s.id === documento.SectionId);
    console.log("Documento:", documento);
    console.log("Sección correspondiente:", seccion);
    if (seccion) {
      if (!acc[seccion.id]) {
        acc[seccion.id] = {
          seccion: seccion,
          documentos: [],
        };
      }

      acc[seccion.id].documentos.push(documento);
    }

    return acc;
  }, {});

  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleNivelChange = (e) => {
    setSelectedNivel(e.target.value);
  };

  return (
    <>
      <div className="home" id="home">
        <div className="home__content">
          <h1 className="home__title">BIENVENIDO A TU AULA VIRTUAL</h1>
        </div>
      </div>
      <div className="about" id="about">
        <p className="about__title">Acerca del proyecto</p>
        <br />
        <div className="about__card">
          <div className="about__card-content">
            <p>
              Bienvenido a nuestro portal educativo dedicado al aprendizaje del
              idioma chino. Nuestra página web ofrece una experiencia completa y
              enriquecedora para aquellos que buscan sumergirse en la fascinante
              lengua y cultura china. Aquí encontrarás una amplia gama de
              recursos y material de alta calidad para aprender mandarín de
              manera efectiva y disfrutar del proceso.
            </p>
          </div>
        </div>
      </div>
      <div className="material" id="material">
        <p className="material__title">Material</p>
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
          <div className="materials ">
            {Object.values(documentosPorSeccion).map(
              ({ seccion, documentos }) => (
                <div key={seccion?.id ?? "defaultKey"}>
                  <h2>{seccion?.Name ?? "Nombre no disponible"}</h2>
                  <div className="tarjetas-documentos">
                    {documentos.map((documento) => (
                      <div key={documento.id} className="tarjeta-documento">
                        <h3>{documento.ArchivoName}</h3>
                        <a
                          href={documento.ArchivoId}
                          download={documento.ArchivoName}
                          className="descargar-icono"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
