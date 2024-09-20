import React, { useState, FormEvent } from 'react';
import { auth } from '../../firebase/config'; // Importa o auth do arquivo de configuração
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importa a função para criar usuário
import axios from 'axios';
import styles from './Register.module.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Define tipos para os estados
interface RegisterState {
  email: string;
  password: string;
  name: string;
  error: string;
  success: string;
  loading: boolean;
}

const Register: React.FC = () => {
  // Inicializa o estado com os tipos apropriados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita o comportamento padrão do formulário
  
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      // Cria o usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user?.getIdToken();
  
      console.log('ID Token:', idToken); // Log do ID Token
  
      // Envia o ID Token e o nome para o backend para criar o documento do usuário
      const response = await axios.post('http://localhost:5000/api/auth/register', { idToken, name, email });
  
      console.log('Resposta do backend:', response.data); // Log da resposta do backend
  
      setSuccess('Usuário registrado com sucesso!');
      toast.success("Conta cadastrada")
      navigate("/login")
    } catch (err: any) { // Tipar o erro como any
      // Adiciona logs detalhados do erro
      console.error('Erro ao registrar:', err);
      if (err.response) {
        // Erro do lado do servidor
        console.error('Resposta do servidor:', err.response.data);
        console.error('Status do erro:', err.response.status);
      } else if (err.request) {
        // Nenhuma resposta recebida
        console.error('Nenhuma resposta recebida:', err.request);
      } else {
        // Erro ao configurar a solicitação
        console.error('Erro ao configurar a solicitação:', err.message);
      }
      setError('Erro ao registrar usuário.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
      <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
      <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.register} onSubmit={handleRegister}>
        <h2>Criar conta</h2>

        <label className={styles.inputBox}>
          <span>Nome:</span>
          <input
            type="text"
            name="displayName"
            required
            placeholder="Nome do usuário"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </label>

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
            value={loading ? 'Criando...' : 'Criar Conta'}
            disabled={loading}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <div className={styles.links}>
          <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
