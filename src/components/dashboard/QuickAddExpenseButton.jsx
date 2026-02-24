import React from 'react';
import './QuickAddExpenseButton.css';

/**
 * @param {{ onClick?: () => void }} props
 */
export default function QuickAddExpenseButton({ onClick }) {
  return (
    <div className="quick-add-wrap">
      <button className="quick-add-btn" type="button" onClick={onClick}>
        <span className="quick-add-btn__icon">+</span>
        Agregar Gasto Rápido
      </button>
    </div>
  );
}
