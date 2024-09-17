import React, { useEffect, useState } from 'react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Register.module.css';

const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { createUser, error: authError } = useAuthentication();
  const navigate = useNavigate(); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    const user = {
      displayName,
      email,
      password,
    };

    try {
      const res = await createUser(user);
      if (res) {
        toast.success('Conta criada com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          navigate('/login'); 
        }, 2000);
      }
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    }
  };

  useEffect(() => {
    if (authError) {
      setError(authError);
      toast.error(authError); 
    }
  }, [authError]);

  return (
    <div className={styles.container}>
      <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
      <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
      <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.register} onSubmit={handleSubmit}>
        <h2>Criar conta</h2>
        <label className={styles.inputBox}>
          <span>Nome:</span>
          <input
            type="text"
            name="displayName"
            required
            placeholder="Nome do usuário"
            onChange={(e) => setDisplayName(e.target.value)}
            value={displayName}
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
          <input type="submit" value="Criar Conta" />
        </label>
        <div className={styles.links}>
          <a href="login">Login</a>
        </div>
      </form>
      <ToastContainer /> 
    </div>
  );
};

export default Register;
