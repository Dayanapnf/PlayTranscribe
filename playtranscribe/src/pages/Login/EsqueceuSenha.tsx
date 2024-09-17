import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './EsqueceuSenha.module.css';

const EsqueceuSenha: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Caso o e-mail esteja registrado, você receberá um link para redefinir sua senha.');
      setEmail('');
      setError(null);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Erro ao enviar e-mail. Verifique se o endereço está correto.');
      setError('Erro ao enviar e-mail. Verifique se o endereço está correto.');
    }
  };

  return (
    <div className={styles.container}>
      <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
      <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
      <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.recuperarSenha} onSubmit={handleResetPassword}>
        <h2>Redefinir Senha</h2>
        <p>
          Insira o e-mail associado à sua conta.
          <br />Você receberá um link para redefinir sua senha.
        </p>
        <label className={styles.inputBox}>
          <span>E-mail:</span>
          <input
            type="email"
            required
            placeholder="Digite seu e-mail"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </label>
        <label className={styles.inputBox}>
          <input type="submit" value="Enviar" />
        </label>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EsqueceuSenha;
