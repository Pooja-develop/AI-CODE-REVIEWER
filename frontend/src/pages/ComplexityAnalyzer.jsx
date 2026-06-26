// ComplexityAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import '../styles/features.css';

const SIDEBAR_ITEMS = [
    { id: 'bug', icon: '🐛', label: 'Bug Finder', path: '/bugfinder' },
    { id: 'interview', icon: '🎯', label: 'Interview Evaluator', path: '/interview-evaluator' },
    { id: 'hint', icon: '💡', label: 'Hint System', path: '/hint-system' },
    { id: 'complexity', icon: '📊', label: 'Complexity Analyzer', path: '/complexity-analyzer' },
    { id: 'docs', icon: '📖', label: 'Auto Documentation', path: '/docs' },
];

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'sql'];

function ComplexityAnalyzer() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [code, setCode] = useState('# Paste your code here...');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [timeComplexity, setTimeComplexity] = useState('');
    const [spaceComplexity, setSpaceComplexity] = useState('');

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);
     // maps Big O notation to a bar width percentage for visual display
    const getComplexityWidth = (complexity) => {
        if (!complexity) return 30;
        if (complexity.includes('1')) return 10;
        if (complexity.includes('log')) return 25;
        if (complexity.includes('n)')) return 40;
        if (complexity.includes('n log')) return 55;
        if (complexity.includes('n²') || complexity.includes('n^2')) return 75;
        if (complexity.includes('n³') || complexity.includes('n^3')) return 90;
        return 50;
    };
   // good = green, okay = yellow, bad = red on the complexity bar
    const getComplexityClass = (complexity) => {
        if (!complexity) return 'okay';
        if (complexity.includes('1') || complexity.includes('log')) return 'good';
        if (complexity.includes('n)') || complexity.includes('n log')) return 'okay';
        return 'bad';
    };

    const handleAnalyze = async () => {
        if (!code.trim()) {
            alert('Please paste your code first!');
            return;
        }

        setLoading(true);
        setResult('');
        setTimeComplexity('');
        setSpaceComplexity('');

        try {
            const response = await fetch('http://localhost:8000/review/complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    mode: 'complexity',
                    language,
                    code,
                    problem: ''
                })
            });

            const data = await response.json();
            setResult(data.result);
            const timeMatch = data.result.match(/Time Complexity[:\s]+O\([^)]+\)/i);
            const spaceMatch = data.result.match(/Space Complexity[:\s]+O\([^)]+\)/i);

            if (timeMatch) {
                const oMatch = timeMatch[0].match(/O\([^)]+\)/);
                if (oMatch) setTimeComplexity(oMatch[0]);
            }
            if (spaceMatch) {
                const oMatch = spaceMatch[0].match(/O\([^)]+\)/);
                if (oMatch) setSpaceComplexity(oMatch[0]);
            }

        } catch (err) {
            setResult('Cannot connect to backend!');
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
                        className={`sidebar-btn ${item.id === 'complexity' ? 'active' : ''}`}
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
                        <p className="panel-title">📊 Complexity Analyzer</p>

                        <select className="lang-select" value={language}
                            onChange={(e) => setLanguage(e.target.value)}>
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l.toUpperCase()}</option>
                            ))}
                        </select>

                        <div className="monaco-wrapper" style={{ height: '360px' }}>
                            <Editor
                                height="360px"
                                language={language}
                                value={code}
                                onChange={(v) => setCode(v || '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    lineNumbers: 'on',
                                    padding: { top: 12 }
                                }}
                            />
                        </div>

                        <div className="action-row">
                            <button className="primary-btn"
                                onClick={handleAnalyze} disabled={loading}>
                                {loading ? '⏳ Analyzing...' : '📊 Analyze Complexity'}
                            </button>
                            <button className="secondary-btn"
                                onClick={() => { setCode(''); setResult(''); }}>
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        <p className="panel-title">⏱️ Complexity Results</p>

                        {loading ? (
                            <div className="loading-state">
                                <span className="loading-spinner">⚙️</span>
                                <p>Analyzing complexity...</p>
                            </div>
                        ) : result ? (
                            <>
                                {/* Visual Complexity Cards */}
                                {timeComplexity && (
                                    <div className="complexity-card">
                                        <p className="complexity-label">
                                            ⏱️ Time Complexity
                                        </p>
                                        <p className="complexity-value">
                                            {timeComplexity}
                                        </p>
                                        <div className="complexity-bar">
                                            <div
                                                className={`complexity-fill ${getComplexityClass(timeComplexity)}`}
                                                style={{
                                                    width: `${getComplexityWidth(timeComplexity)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {spaceComplexity && (
                                    <div className="complexity-card">
                                        <p className="complexity-label">
                                            💾 Space Complexity
                                        </p>
                                        <p className="complexity-value">
                                            {spaceComplexity}
                                        </p>
                                        <div className="complexity-bar">
                                            <div
                                                className={`complexity-fill ${getComplexityClass(spaceComplexity)}`}
                                                style={{
                                                    width: `${getComplexityWidth(spaceComplexity)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="result-box" style={{ marginTop: '12px' }}>
                                    <div className="result-text">{result}</div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <p className="empty-title">
                                    Understand your code's efficiency
                                </p>
                                <p className="empty-desc">
                                    Paste your code and get detailed
                                    Big O analysis with visual
                                    complexity indicators!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComplexityAnalyzer;