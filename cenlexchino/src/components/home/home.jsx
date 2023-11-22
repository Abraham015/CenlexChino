import React from "react";
import "./home.css";
import "../about/about.css";
import "../material/material.css";

const home = () => {
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
          <select>
            <option value="0" selected>
              Selecciona un plan
            </option>
            <option>Plan 2023</option>
          </select>
          <select>
            <option value="0" selected>
              Selecciona un nivel
            </option>
            <option>Basico 1</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default home;
