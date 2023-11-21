import React from "react";
import "./about.css";

const about = () => {
  return (
    <div className="about" id="about">
      <p className="about__title">Acerca del proyecto</p>
      <br />
      <div className="about__card">
        <div className="about__card-content">
          <p>
            Bienvenido a nuestro portal educativo dedicado al aprendizaje del
            idioma chino. Nuestra página web ofrece una experiencia completa y
            enriquecedora para aquellos que buscan sumergirse en la fascinante
            lengua y cultura china. Aquí encontrarás una amplia gama de recursos
            y material de alta calidad para aprender mandarín de manera efectiva
            y disfrutar del proceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default about;
