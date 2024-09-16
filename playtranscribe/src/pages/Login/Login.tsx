import React from 'react';
import styles from './Login.module.css';

const Login: React.FC = () => {
  return (
    <div className={styles.container}>
      <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
    <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
    <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.login}>
        <h2>Login</h2>
        <label className={styles.inputBox}>
          <input type="text" placeholder="E-mail" required />
        </label>
        <label className={styles.inputBox}>
          <input type="password" placeholder="Senha" required />
        </label>
        <label className={styles.inputBox}>
          <input type="submit" value="Entrar" />
        </label>
        <div className={styles.links}>
          <a href="esqueceu-senha">Esqueceu a senha?</a>
          <a href="#">Criar Conta</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
