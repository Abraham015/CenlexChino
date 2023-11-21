import React from 'react';
import './material.css';

const material = () => {
  return (
    <div className='material' id='material'>
      <p className='material__title'>Material</p>
      <div className="selects-derecha">
        <select>
          <option value="0" selected>Selecciona un plan</option>
          <option>Plan 2023</option>
        </select>
        <select>
        <option value="0" selected>Selecciona un nivel</option>
          <option>Basico 1</option>
        </select>
      </div>
    </div>
  )
}

export default material