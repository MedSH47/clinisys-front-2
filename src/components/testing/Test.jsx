import React, { useEffect, useState } from 'react'
import authService from '../../services/authService';
import decodeToken from '../../services/decodeToken';

export default function Test() {
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [error, setError] = useState('');
    useEffect(() => {
        localStorage.clear(); 
      }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          // 1. Log in and store token
          const token =await authService.login(credentials);
          localStorage.setItem('token',token);
          const msg = decodeToken(token);
          console.log(token)
        } catch (err) {
          const errorMessage =
            err?.message?.message ||
            err?.message ||
            (typeof err === 'string' ? err : 'Erreur de connexion');
          setError(errorMessage);
        }
      };
  return (
    <div className="login-container" style={styles.container}>
      <div className="login-box" style={styles.box}>
        <div className="system-header" style={styles.header}>
          <h1 style={styles.title}>CLINISYS</h1>
          <p style={styles.subtitle}>SOCIETY INFORMATION SYSTEM</p>
        </div>
        

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group" style={styles.formGroup}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              style={styles.input}
              value={credentials.login}
              onChange={(e) =>
                setCredentials({ ...credentials, login: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group" style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              className="form-control"
              style={styles.input}
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={styles.button}>
            Connexion
          </button>
        </form>
      </div>
    </div>
  );
}
// Custom styles to match the design
const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    box: {
      width: '350px',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      color: '#2c3e50',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '14px',
    },
    form: {
      marginTop: '20px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#2c3e50',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#3498db',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
    }
  };