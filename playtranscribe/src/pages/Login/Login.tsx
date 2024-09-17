import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Login.module.css';
import { useAuthentication } from '../../hooks/useAuthentication';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate= useNavigate();

  const { login, error: authError, loading } = useAuthentication();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');

    const user = {
      email,
      password,
    };

    const res = await login(user);
    if(res){
      navigate('/');
    }

    console.log(res);
  };
  useEffect(() => {
    if (authError) {
      toast.error(authError); 
    }
  }, [authError]);

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
            disabled={!!loading}
          />
        </label>
        <div className={styles.links}>
          <a href="esqueceu-senha">Esqueceu a senha?</a>
          <a href="criar-conta">Criar Conta</a>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
