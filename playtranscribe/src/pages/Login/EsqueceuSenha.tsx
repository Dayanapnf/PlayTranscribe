import styles from "./EsqueceuSenha.module.css"

const EsqueceuSenha = () =>{
  return(
    <div className={styles.container}>
    <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
    <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
    <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
      <form className={styles.recuperarSenha}>
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
              placeholder="Digite seu e-mail" />
        </label>
        <label className={styles.inputBox}>
          <input type="submit" value="Recuperar Senha" />
        </label>
      </form>
    </div>
  )
}

export default EsqueceuSenha;