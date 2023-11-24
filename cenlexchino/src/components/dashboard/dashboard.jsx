import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import appFirebase from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import "./dashboard.css";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nombrePlan, setNombrePlan] = useState("");
  const [nombreNivel, setNombreNivel] = useState("");
  const [planes, setPlanes] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formType, setFormType] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!user);
    });

    // Important: Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

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
    // Consultar niveles asociados al plan seleccionado
    const fetchNiveles = async () => {
      if (selectedPlan) {
        const db = getFirestore(appFirebase);
        const nivelesQuery = query(
          collection(db, "Nivel"),
          where("PlanId", "==", selectedPlan)
        );
        const nivelesSnapshot = await getDocs(nivelesQuery);
        const nivelesData = nivelesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNiveles(nivelesData);
      } else {
        // Si no hay un plan seleccionado, establecer niveles como vacío
        setNiveles([]);
      }
    };

    fetchNiveles();
  }, [selectedPlan]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formType === "Crear Plan") {
      await crearPlan(nombrePlan);
    } else if (formType === "Crear Nivel") {
      await crearNivel(nombreNivel, selectedPlan);
    } else if (formType === "Cargar Documentos") {
      await crearDocumento(selectedNivel, selectedPlan);
    } else if (formType === "Editar") {
      // Lógica para editar
    }
  };

  const crearDocumento = async () => {
    const db = getFirestore(appFirebase);
    //if (selectedFile && selectedNivel) {
      try {
        const collectionRef = collection(db, "Material");
        await addDoc(collectionRef, {
          PlanId: selectedPlan,
          NivelId: selectedNivel,
          ArchivoId: archivoUrl,
          ArchivoName: nombreArchivo,
        });
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Documento guardado con éxito.",
        });
        setSelectedPlan("");
        setSelectedNivel("");
        setSelectedFile("");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al guardar el documento.",
        });
        console.error("Error al crear el documento:", error);
      }
    /*} else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Selecciona ambos campos.",
      });
    }*/
  };

  const crearPlan = async (nombre) => {
    const db = getFirestore(appFirebase);

    try {
      await addDoc(collection(db, "Plan"), {
        Name: nombre,
      });
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Plan creado con éxito.",
      });

      setNombrePlan("");
      setFormType("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear un nuevo plan.",
      });
      console.error("Error al crear el documento:", error);
    }
  };

  const crearNivel = async (nombreNivel, selectedPlan) => {
    const db = getFirestore(appFirebase);

    try {
      await addDoc(collection(db, "Nivel"), {
        Name: nombreNivel,
        PlanId: selectedPlan,
      });
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Nivel creado con éxito.",
      });

      setNombreNivel("");
      setFormType("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear un nuevo nivel.",
      });
      console.error("Error al crear el documento:", error);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  const handleNivelChange = (e) => {
    setSelectedNivel(e.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const archivo = e.target.files[0];
    const storageRef = ref(storage, "archivos"); // Asegúrate de que 'storage' esté definido
    const archivoRef = ref(storageRef, file.name); // Utiliza 'ref' en lugar de 'child'
    await uploadBytes(archivoRef, file);

    // Obtener el enlace de descarga del archivo
    const Url = await getDownloadURL(archivoRef);
    setArchivoUrl(Url);
    setNombreArchivo(archivo.name);
    // Convierte el archivo a Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;

      // Actualiza el estado con los datos del archivo
      setSelectedFile(base64Data);
    };

    reader.readAsDataURL(file);
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;

    // Seteamos el plan seleccionado
    setSelectedPlan(selectedPlanId);

    // Consultar niveles asociados al plan seleccionado
    const fetchNiveles = async () => {
      if (selectedPlanId) {
        const db = getFirestore(appFirebase);
        const nivelesQuery = query(
          collection(db, "Nivel"),
          where("PlanId", "==", selectedPlanId)
        );
        const nivelesSnapshot = await getDocs(nivelesQuery);
        const nivelesData = nivelesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNiveles(nivelesData);
      } else {
        // Si no hay un plan seleccionado, establecer niveles como vacío
        setNiveles([]);
      }
    };

    fetchNiveles();
  };

  return (
    <div className="dashboard">
      <div className="buttons">
        <button onClick={() => setFormType("Crear Plan")}>Crear Plan</button>
        <button onClick={() => setFormType("Crear Nivel")}>Crear Nivel</button>
        <button onClick={() => setFormType("Cargar Documentos")}>
          Cargar Documentos
        </button>
        <button onClick={() => setFormType("Editar")}>Editar</button>
      </div>

      {formType && (
        <div className="formulario">
          <h2>{formType}</h2>
          <form onSubmit={handleFormSubmit}>
            {formType === "Crear Plan" && (
              <>
                <label>Nombre del Plan</label>
                <input
                  type="text"
                  value={nombrePlan}
                  onChange={(e) => setNombrePlan(e.target.value)}
                  required
                />
              </>
            )}
            {formType === "Crear Nivel" && (
              <>
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
                  <option value="" disabled>
                    Selecciona un Plan
                  </option>
                  {planes.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.Name}
                    </option>
                  ))}
                </select>
              </>
            )}
            {formType === "Cargar Documentos" && (
              <>
                <label>Selecciona un Plan</label>
                <select value={selectedPlan} onChange={handlePlanChange}>
                  <option value="0">Selecciona un plan</option>
                  {planes.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.Name}
                    </option>
                  ))}
                </select>
                <label>Selecciona un Nivel</label>
                <select value={selectedNivel} onChange={handleNivelChange}>
                  <option value="0">Selecciona un nivel</option>
                  {niveles.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>
                      {nivel.Name}
                    </option>
                  ))}
                </select>
                <label>Selecciona un Archivo</label>
                <input type="file" onChange={handleFileChange} />
              </>
            )}
            {formType === "Editar" && <></>}
            <button type="submit">Guardar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
