import React, { createContext, useContext, useState } from 'react';

const GastosContext = createContext(null);

export function useGastos() {
  const ctx = useContext(GastosContext);
  if (!ctx) throw new Error('useGastos must be used within <GastosProvider>');
  return ctx;
}

export function GastosProvider({ children }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);

  const value = { gastos, setGastos, loading, setLoading };

  return (
    <GastosContext.Provider value={value}>
      {children}
    </GastosContext.Provider>
  );
}
