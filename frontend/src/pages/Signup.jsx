// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill all fields!');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Account created! Redirecting to login...');
                setTimeout(() => navigate('/'), 2000);
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
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join AI Code Reviewer today</p>

                <hr className="auth-divider" />

                <div className="form-group">
                    <label>👤 Username</label>
                    <input
                        type="text"
                        placeholder="Choose a username (min 3 chars)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>📧 Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>🔒 Password</label>
                    <input
                        type="password"
                        placeholder="Choose a password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>🔒 Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <button
                    className="btn-primary"
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading ? '⏳ Creating...' : '✨ Create Account'}
                </button>

                <hr className="auth-divider" />

                <p className="switch-text">Already have an account?</p>
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                >
                    🚀 Sign In Instead
                </button>

            </div>
        </div>
    );
}

export default Signup;