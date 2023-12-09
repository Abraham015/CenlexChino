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
  getDoc,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import Swal from "sweetalert2";
import "./dashboard.css";
import { ref, uploadBytes, getDownloadURL, getStorage, getMetadata } from "firebase/storage";

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nombrePlan, setNombrePlan] = useState("");
  const [nombreNivel, setNombreNivel] = useState("");
  const [planes, setPlanes] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [section, setSection] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formType, setFormType] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(""); // Estado para el plan seleccionado
  const [selectedNivelId, setSelectedNivelId] = useState(""); // Estado para el nivel seleccionado
  const [reloadData, setReloadData] = useState(false);

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

  useEffect(() => {
    const obtenerDatosDesdeFirebase = async () => {
      try {
        // Obtener documentos desde Firestore
        const db = getFirestore(appFirebase);
        const docsSnapshot = await getDocs(collection(db, "Material"));
        const docsData = docsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Obtener información adicional de planes, niveles y secciones
        const planesSnapshot = await getDocs(collection(db, "Plan"));
        const planesData = planesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().Name;
          return acc;
        }, {});

        const nivelesSnapshot = await getDocs(collection(db, "Nivel"));
        const nivelesData = nivelesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().Name;
          return acc;
        }, {});

        const seccionesSnapshot = await getDocs(collection(db, "Secciones"));
        const seccionesData = seccionesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().Name;
          return acc;
        }, {});

        // Actualizar estado con documentos y datos adicionales
        setDocumentos(
          docsData.map((doc) => ({
            ...doc,
            PlanName: planesData[doc.PlanId] || "Nombre no disponible",
            NivelName: nivelesData[doc.NivelId] || "Nombre no disponible",
            SeccionName: seccionesData[doc.SectionId] || "Nombre no disponible",
          }))
        );
      } catch (error) {
        console.error("Error al obtener datos desde Firebase:", error);
      }
    };

    obtenerDatosDesdeFirebase();
  }, []);

  // Se ejecuta solo al montar el componente

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
      }).then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
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
      }).then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
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

  const documentosPorSeccion = documentos.reduce((acc, documento) => {
    const seccion = documento.SectionId; // Ajusta según la estructura de tus documentos

    if (!acc[seccion]) {
      acc[seccion] = {
        seccion: seccion,
        documentos: [],
      };
    }

    acc[seccion].documentos.push(documento);

    return acc;
  }, {});

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  const handleNivelChange = (e) => {
    setSelectedNivel(e.target.value);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
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
        SectionId: selectedSection,
      });
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Documento agregado con éxito.",
      }).then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      });
      setSelectedPlan("");
      setSelectedNivel("");
      setSelectedFile(null);
      setSelectedSection("");
      setArchivoUrl("");
      setNombreArchivo("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al guardar el documento.",
      });
      console.error("Error al crear el documento:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const archivo = e.target.files[0];
    setSelectedFile(archivo);
  
    const storageRef = ref(storage, "archivos");
    const archivoRef = ref(storageRef, file.name);
  
    // Verificar si el archivo ya existe
    try {
      await getMetadata(archivoRef);
      // El archivo ya existe, obtén el enlace de descarga y actualiza el estado
      const Url = await getDownloadURL(archivoRef);
      setArchivoUrl(Url);
      setNombreArchivo(file.name);
    } catch (error) {
      // El archivo no existe, procede a subirlo
      await uploadBytes(archivoRef, file);
  
      // Obtener el enlace de descarga del archivo
      const Url = await getDownloadURL(archivoRef);
      setArchivoUrl(Url);
      setNombreArchivo(file.name);
    }
  
    // Convierte el archivo a Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
  
      // Actualiza el estado con los datos del archivo
      setSelectedFile(base64Data);
    };
  
    reader.readAsDataURL(file);
    setSelectedFile(null);
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

  const handleEditar = async (documento) => {
    setFormType("Editar");
    setSelectedDocumento(documento);
    const db = getFirestore(appFirebase);
    const nivelSnapshot = await getDocs(collection(db, "Nivel"));
    const nivelData = nivelSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Niveles recuperados:", nivelData);
    setNiveles(nivelData);
  };

  const handleEliminar = async (documento) => {
    if (!documento || !documento.id) {
      console.error("Error: documento.id is not defined");
      return;
    }
  
    try {
      const db = getFirestore(appFirebase);
      const docRef = doc(collection(db, "Material"), documento.id);
  
      await deleteDoc(docRef);
  
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Documento eliminado con éxito.",
      }).then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      });
  
      // Puedes realizar alguna lógica adicional después de eliminar
      // por ejemplo, actualizar el estado o recargar datos si es necesario.
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al eliminar el documento.",
      });
      console.error("Error al eliminar el documento:", error);
    }
  };
  

  const handleConfirm = async (e) => {
    e.preventDefault(); 
    try {
      const db = getFirestore(appFirebase);
      const docRef = doc(db, 'Material', selectedDocumento.id);
  
      const existingDoc = await getDoc(docRef);
  
      // Actualizar el documento
      if (existingDoc.exists()) {
        console.log('selectedDocumento:', selectedDocumento);
        console.log('existingDoc.data():', existingDoc.data());
  
        await updateDoc(docRef, {
          PlanId: selectedDocumento.PlanId,
          NivelId: selectedDocumento.NivelId,
          SectionId: selectedDocumento.SectionId,
          ArchivoId: selectedDocumento.ArchivoId,
          ArchivoName: selectedDocumento.ArchivoName,
        });
  
        // Mostrar el SweetAlert solo después de la actualización exitosa
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Documento actualizado con éxito.",
        }).then(() => {
          // eslint-disable-next-line no-restricted-globals
          location.reload();
        });
        
        console.log('Documento actualizado con éxito');
      } else {
        console.log('El documento no existe');
      }
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
    }
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
                <label>Selecciona una Sección</label>
                <select value={selectedSection} onChange={handleSectionChange}>
                  <option value="0">Selecciona una sección</option>
                  {section.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.Name}
                    </option>
                  ))}
                </select>
                <label>Selecciona un Archivo</label>
                <input type="file" onChange={handleFileChange} />
              </>
            )}
            {formType === "Editar" && documentos.length > 0 && (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Nivel</th>
                      <th>Sección</th>
                      <th>Archivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((documento) => (
                      <tr key={documento.id}>
                        <td>{documento.PlanName}</td>
                        <td>{documento.NivelName}</td>
                        <td>{documento.SeccionName}</td>
                        <td>{documento.ArchivoName}</td>
                        <td>
                          <button onClick={() => handleEditar(documento)}>
                            Editar
                          </button>
                          <button onClick={() => handleEliminar(documento)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button type="submit">Guardar</button>
          </form>
        </div>
      )}
      {formType === "Editar" && selectedDocumento && (
        <div className="formulario">
          <h2>Editar Documento</h2>
          <form onSubmit={handleConfirm}>
            <label>Selecciona un Plan</label>
            <select
              value={selectedDocumento.PlanId}
              onChange={(e) => {
                const planId = e.target.value;
                setSelectedDocumento((prev) => ({
                  ...prev,
                  PlanId: planId,
                }));
                setSelectedPlanId(planId); // Establecer el plan seleccionado
              }}
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

            <label>Selecciona un Nivel</label>
            <select
              value={selectedDocumento.NivelId}
              onChange={(e) => {
                const nivelId = e.target.value;
                setSelectedDocumento((prev) => ({
                  ...prev,
                  NivelId: nivelId,
                }));
                setSelectedNivelId(nivelId);
              }}
              required
            >
              <option value="" disabled>
                Selecciona un Nivel
              </option>
              {niveles
                .filter((nivel) => nivel.PlanId === selectedDocumento.PlanId)
                .map((nivel) => (
                  <option key={nivel.id} value={nivel.id}>
                    {nivel.Name}
                  </option>
                ))}
            </select>

            <label>Selecciona una Sección</label>
            <select
              value={selectedDocumento.SectionId}
              onChange={(e) => {
                const sectionId = e.target.value;
                setSelectedDocumento((prev) => ({
                  ...prev,
                  SectionId: sectionId,
                }));
              }}
              required
            >
              <option value="">Selecciona una Sección</option>
              {section.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.Name}
                </option>
              ))}
            </select>

            <label>Nombre del Archivo</label>
            <input
              type="text"
              value={selectedDocumento.ArchivoName}
              onChange={(e) =>
                setSelectedDocumento((prev) => ({
                  ...prev,
                  ArchivoName: e.target.value,
                }))
              }
              required
              disabled
            />
            <button type="submit">Guardar Cambios</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
