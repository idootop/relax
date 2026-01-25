import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import './App.css';

import { initAPP } from './core/init';
import { HomePage } from './pages/HomePage';
import { OverlayPage } from './pages/OverlayPage';

function App() {
  useEffect(() => {
    initAPP();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<div />} key="background" path="/background" />
        <Route element={<OverlayPage />} key="overlay" path="/overlay" />
      </Routes>
    </HashRouter>
  );
}

export default App;
