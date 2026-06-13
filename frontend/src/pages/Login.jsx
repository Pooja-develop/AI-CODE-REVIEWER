// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    
const handleLogin = async () => {
    if (!username || !password) {
        setError('Please fill all fields!');
        return;
    }

    setLoading(true);
    setError('');

    try {
        const response = await fetch('http://localhost:8000/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('username', username);
            navigate('/dashboard');
        } else {
            setError(data.message);
        }
    } catch (err) {
        setError('Cannot connect to server!');
    }

    setLoading(false);
};
    return (
        <div className="auth-wrapper">
            <div className="auth-card">

                
                <div className="auth-logo">🤖</div>
                <h1 className="auth-title">AI Code Reviewer</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                <hr className="auth-divider" />

                
                <div className="form-group">
                    <label>👤 Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                <div className="form-group">
                    <label>🔒 Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                {/* Error */}
                {error && <div className="error-msg"> {error}</div>}

                {/* Login Button */}
                <button
                    className="btn-primary"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                </button>

                <hr className="auth-divider" />

                <p className="switch-text">Don't have an account?</p>
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/signup')}
                >
                    ✨ Create New Account
                </button>

                <p style={{
                    textAlign: 'center',
                    color: '#484f58',
                    fontSize: '12px',
                    marginTop: '20px'
                }}>
                    🔒 Your data is safe and secure
                </p>

            </div>
        </div>
    );
}

export default Login;