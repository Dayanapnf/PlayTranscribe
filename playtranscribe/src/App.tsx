import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login/Login';
import EsqueceuSenha from './pages/Login/EsqueceuSenha';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import NavBar from './components/NavBar/NavBar';
import DashboardPage from './pages/Dashboard/Dashboard';
import Logout from './pages/Login/Logout';
import TranscriptionView from './pages/TranscriptionView/TranscriptionView';
import './App.css';

const App: React.FC = () => {
  return (
    <div className='App'>
      
      <AuthProvider>
       <ToastContainer />
          <Router>
            <NavBar />
            <div className="container">
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
                <Route path="/criar-conta" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                {/* Rotas protegidas */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transcription/:id" element={<TranscriptionView/>} />
              </Routes>
            </div>
          </Router>
      
      </AuthProvider>
    </div>
  );
};

export default App;
