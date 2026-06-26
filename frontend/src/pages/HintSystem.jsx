// HintSystem.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/features.css';

const SIDEBAR_ITEMS = [
    { id: 'bug', icon: '🐛', label: 'Bug Finder', path: '/bugfinder' },
    { id: 'interview', icon: '🎯', label: 'Interview Evaluator', path: '/interview-evaluator' }, 
    { id: 'hint', icon: '💡', label: 'Hint System', path: '/hint-system' },
    { id: 'complexity', icon: '📊', label: 'Complexity Analyzer', path: '/complexity-analyzer' },
    { id: 'docs', icon: '📖', label: 'Auto Documentation', path: '/docs' },
];

function HintSystem() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [problem, setProblem] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [hints, setHints] = useState([]);
    const [unlockedHints, setUnlockedHints] = useState(0);
    const [rawResult, setRawResult] = useState('');

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const parseHints = (text) => {
        const hintRegex = /##\s*💡\s*Hint\s*(\d+)[^#]*([\s\S]*?)(?=##\s*💡\s*Hint|\s*##|$)/g;
        const parsed = [];
        let match;
        while ((match = hintRegex.exec(text)) !== null) {
            parsed.push({
                number: parseInt(match[1]),
                text: match[2].trim()
            });
        }
        if (parsed.length === 0) {
            const sections = text.split('\n\n').filter(s => s.trim());
            sections.slice(0, 3).forEach((s, i) => {
                parsed.push({ number: i + 1, text: s.trim() });
            });
        }
        return parsed;
    };

    const handleGetHints = async () => {
        if (!problem.trim()) {
            alert('Please describe your problem!');
            return;
        }

        setLoading(true);
        setHints([]);
        setUnlockedHints(0);
        setRawResult('');

        try {
            const response = await fetch('http://localhost:8000/review/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    mode: 'hint',
                    language: 'Auto Detect',
                    code: code || 'No code provided',
                    problem
                })
            });

            const data = await response.json();
            setRawResult(data.result);
            const parsed = parseHints(data.result);
            setHints(parsed);
            setUnlockedHints(1);

        } catch (err) {
            setRawResult('Cannot connect to backend!');
        }

        setLoading(false);
    };

    return (
        <div className="feature-wrapper">

            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">🤖</div>
                {SIDEBAR_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-btn ${item.id === 'hint' ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        {item.icon}
                        <span className="sidebar-tooltip">{item.label}</span>
                    </button>
                ))}
                <div className="sidebar-bottom">
                    <button className="sidebar-btn"
                        onClick={() => { localStorage.removeItem('username'); navigate('/'); }}>
                        🚪
                        <span className="sidebar-tooltip">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="feature-main">
                <div className="topbar">
                    <span className="topbar-title">🤖 CodeSense AI</span>
                    <div className="topbar-right">
                        <span className="topbar-badge">👋 {username}</span>
                        <button className="topbar-logout"
                            onClick={() => { localStorage.removeItem('username'); navigate('/'); }}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="feature-content">

                    {/* Left Panel */}
                    <div className="left-panel">
                        <p className="panel-title">💡 Hint System</p>

                        <span className="code-input-label">
                            📝 Describe Your Problem:
                        </span>
                        <textarea
                            className="text-input"
                            rows={5}
                            placeholder="e.g., I need to find two numbers in an array that add up to a target sum. I tried nested loops but it's too slow..."
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                        />

                        <span className="code-input-label" style={{ marginTop: '16px' }}>
                            💻 Your Current Code (optional):
                        </span>
                        <textarea
                            className="text-input"
                            rows={8}
                            placeholder="Paste your current attempt here..."
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{ fontFamily: 'Courier New, monospace' }}
                        />

                        <div className="action-row">
                            <button
                                className="primary-btn"
                                onClick={handleGetHints}
                                disabled={loading}
                            >
                                {loading ? '⏳ Getting Hints...' : '💡 Get Hints'}
                            </button>
                            <button className="secondary-btn"
                                onClick={() => {
                                    setProblem('');
                                    setCode('');
                                    setHints([]);
                                    setUnlockedHints(0);
                                }}>
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        <p className="panel-title">💡 Progressive Hints</p>
                        <p style={{
                            color: '#8b949e',
                            fontSize: '12px',
                            marginBottom: '16px'
                        }}>
                            Hints unlock one by one — think before
                            clicking next hint!
                        </p>

                        {loading ? (
                            <div className="loading-state">
                                <span className="loading-spinner">⚙️</span>
                                <p>AI is preparing your hints...</p>
                            </div>
                        ) : hints.length > 0 ? (
                            <>
                                {hints.map((hint, i) => (
                                    <div
                                        key={i}
                                        className={`hint-card ${i < unlockedHints ? 'unlocked' : 'locked'}`}
                                        onClick={() => {
                                            if (i === unlockedHints - 1 &&
                                                unlockedHints < hints.length) {
                                                setUnlockedHints(prev => prev + 1);
                                            }
                                        }}
                                    >
                                        <div className="hint-header">
                                            <div className="hint-number">
                                                {hint.number}
                                            </div>
                                            <span className="hint-title">
                                                Hint {hint.number}
                                                {i >= unlockedHints && ' 🔒'}
                                            </span>
                                        </div>
                                        {i < unlockedHints ? (
                                            <p className="hint-text">{hint.text}</p>
                                        ) : (
                                            <p className="hint-locked-text">
                                                Click previous hint to unlock...
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {unlockedHints === hints.length && (
                                    <div className="hint-card unlocked"
                                        style={{ borderColor: '#3fb950' }}>
                                        <div className="hint-header">
                                            <span style={{ fontSize: '1.2rem' }}>✅
                                                
                                            </span>
                                            <span className="hint-title"
                                                style={{ color: '#3fb950' }}>
                                                All hints unlocked!
                                            </span>
                                        </div>
                                        <p className="hint-text">
                                            You've seen all hints.
                                            Now try solving it yourself!
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">💡</div>
                                <p className="empty-title">
                                    Stuck on a problem?
                                </p>
                                <p className="empty-desc">
                                    Describe your problem and get
                                    progressive hints that guide
                                    you without spoiling the answer!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HintSystem;