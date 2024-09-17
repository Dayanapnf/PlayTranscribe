import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import EsqueceuSenha from './pages/Login/EsqueceuSenha';
import Register from './pages/Register/Register';
import Home from './pages/Home/home';



const App: React.FC = () => {
  return (
    <div className='App'>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/criar-conta" element={<Register />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;
