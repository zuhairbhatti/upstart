import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../api/endpoints';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [loginScreen, setLoginScreen] = useState(true);

    // Get the redirect path from location state or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    console.log(from, 'from');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(username, password);
            onLogin(); // Call the onLogin callback
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await register(username, password);
            onLogin();
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div>
            {loginScreen ? (
                <>
                    <h2>Login</h2>
                    {error && <div>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Sign in</button>
                    </form>
                        <div>
                            <p>Don't have an account?</p>
                            <a onClick={() => setLoginScreen(false)}>Register</a>
                        </div>
                </>
            ) : (
                <>
                    <h2>Register</h2>
                    {error && <div>{error}</div>}
                    <form onSubmit={handleRegister}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Sign up</button>
                    </form>
                    <div>
                        <p>Have an account?</p>
                        <a onClick={() => setLoginScreen(true)}>Login</a>
                    </div>
                </>
            )}
        </div>
    );
};

export default Login;