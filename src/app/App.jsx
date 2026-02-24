import React from 'react';
import Sidebar from '../components/shell/Sidebar';
import Topbar from '../components/shell/Topbar';
import AppRouter from '../router';
import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Topbar />
        <main className="app-shell__content">
          <AppRouter />
        </main>
      </div>
    </div>
  );
}
