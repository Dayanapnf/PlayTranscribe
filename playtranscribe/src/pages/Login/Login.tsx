import React, { useState, FormEvent } from 'react';
import { auth } from '../../firebase/config'; // Importa o auth do arquivo de configuração
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa a função para login
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirecionar após login
import styles from './Login.module.css'; // Certifique-se de que o caminho está correto
import { useAuth } from '../../context/AuthContext'; // Importa o hook do contexto
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Hook para redirecionar
  const { setUser } = useAuth(); // Função para atualizar o estado do usuário

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      // Faz o login com email e senha no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user?.getIdToken(); // Obtém o ID Token do Firebase
      
      if (!idToken) throw new Error('Token não obtido.');
  
      console.log('ID Token:', idToken); // Log do ID Token
      
      // Envia o ID Token para o backend para validação e geração do JWT
      const response = await axios.post('http://localhost:5000/api/auth/login', { idToken });
  
      console.log('Resposta do backend:', response.data); // Log da resposta do backend
  
      if (response.data.success) {
        // Armazena o JWT no localStorage
        const token = response.data.token;
        localStorage.setItem('token', token); // Salva o JWT
    
        // Atualiza o estado global
        setUser(response.data.user);

        setSuccess('Login realizado com sucesso!');
        
        navigate('/'); // Redireciona para o home
      } else {
        setError('Falha no login.');
      }
    } catch (err: any) {
      console.error('Erro ao realizar login:', err);
      if (err.response) {
        console.error('Resposta do servidor:', err.response.data);
        console.error('Status do erro:', err.response.status);
      } else if (err.request) {
        console.error('Nenhuma resposta recebida:', err.request);
      } else {
        console.error('Erro ao configurar a solicitação:', err.message);
      }
      setError('Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
      <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
      <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.login} onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label className={styles.inputBox}>
          <span>E-mail:</span>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </label>
        <label className={styles.inputBox}>
          <span>Senha:</span>
          <input
            type="password"
            name="password"
            placeholder="Senha"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </label>
        <label className={styles.inputBox}>
          <input
            type="submit"
            value={loading ? 'Carregando...' : 'Entrar'}
            disabled={loading}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.links}>
          <a href="/esqueceu-senha">Esqueceu a senha?</a>
          <a href="/criar-conta">Criar Conta</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
