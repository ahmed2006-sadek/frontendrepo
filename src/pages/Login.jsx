import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';

export default function Login({ setIsLoggedIn, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    setMsg('Logging In as Demo Admin...');
    const demoUser = {
      id: 'demo-user-01',
      name: 'Demo Admin',
      email: 'demo@rocketcrm.com',
      role: 'admin',
    };
    setIsLoggedIn(true);
    setCurrentUser(demoUser);
    const expirationTime = new Date().getTime() + (25 * 24 * 60 * 60 * 1000);
    const userDataWithExpiration = { ...demoUser, expirationTime };
    localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
    localStorage.setItem('token', 'demo-access-token');
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    if (email === 'demo@rocketcrm.com' && password === 'demo123') {
      handleDemoLogin();
      return;
    }

    try {
      const response = await authAPI.login({ email, password });
      if (response.ok) {
        const data = await response.json();
        setMsg('Logging In');
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        const expirationTime = new Date().getTime() + (25 * 24 * 60 * 60 * 1000);
        const userDataWithExpiration = { ...data.user, expirationTime };
        localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
        if (data.tokens?.access_token) {
          localStorage.setItem('token', data.tokens.access_token);
        }
        navigate("/dashboard");
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        setMsg(errorData.message || 'Email or Password Error');
      }
    } catch (error) {
      setMsg('Network Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div style={{marginBottom: 16, color: "#bfc6d1", fontSize: 15}}>
        <strong>Admin Demo</strong>: demo@rocketcrm.com / demo123
      </div>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField name="email" label="Email" variant="standard" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
        <TextField name="password" type="password" label="Password" variant="standard" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
        <button type="submit" className="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <span className={`login-msg ${msg.includes('Logging In') ? 'success' : msg ? 'error' : ''}`}>{msg}</span>
      </Box>
    </div>
  );
}
