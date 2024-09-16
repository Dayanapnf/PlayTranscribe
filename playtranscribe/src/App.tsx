import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import EsqueceuSenha from './pages/Login/EsqueceuSenha';



const App: React.FC = () => {
  return (
    <div className='App'>
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;
