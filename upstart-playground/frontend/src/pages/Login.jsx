import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/endpoints';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loginScreen, setLoginScreen] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login(username, password);
            if (response.access_token) {
                onLogin?.();
                navigate('/create-board', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await register(username, password);
            if (response.access_token) {
                onLogin?.();
                navigate('/create-board', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={loginScreen ? handleSubmit : handleRegister}>
                <h1>{loginScreen ? 'Login' : 'Register'}</h1>
                {error && <div className="login-error">{error}</div>}
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{loginScreen ? 'Sign in' : 'Sign up'}</button>
                <div className="register-link">
                    {loginScreen ? "Don't have an account?" : 'Have an account?'}
                </div>
                {loginScreen ? (
                    <button
                        type="button"
                        className="register-btn"
                        onClick={() => setLoginScreen(false)}
                    >
                        Register
                    </button>
                ) : (
                    <button
                        type="button"
                        className="register-btn"
                        onClick={() => setLoginScreen(true)}
                    >
                        Login
                    </button>
                )}
            </form>
        </div>
    );
};

export default Login;