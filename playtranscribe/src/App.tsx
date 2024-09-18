import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import EsqueceuSenha from './pages/Login/EsqueceuSenha';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import NavBar from './components/NavBar/NavBar';
import DashboardPage from './pages/Dashboard/Dashboard';
import './App.css'
import { AuthProvider } from './context/AuthContext';



const App: React.FC = () => {
  return (
    <div className='App'>
      <AuthProvider>
        <Router>
          <NavBar/>
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
                <Route path="/criar-conta" element={<Register />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </div>
        </Router>
      </AuthProvider>  
    </div>
  );
};

export default App;
