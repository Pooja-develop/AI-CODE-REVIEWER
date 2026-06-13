// InterviewEvaluator.jsx
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import '../styles/features.css';

const SIDEBAR_ITEMS = [
    { id: 'bug', icon: '🐛', label: 'Bug Finder', path: '/bugfinder' },
    { id: 'interview', icon: '🎯', label: 'Interview Evaluator', path: '/interview' },
    { id: 'hint', icon: '💡', label: 'Hint System', path: '/hints' },
    { id: 'complexity', icon: '📊', label: 'Complexity Analyzer', path: '/complexity' },
    { id: 'docs', icon: '📖', label: 'Auto Documentation', path: '/docs' },
];

const COMPANIES = ['Google', 'Amazon', 'Meta', 'Apple', 'Netflix'];
const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'sql'];

function InterviewEvaluator() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [code, setCode] = useState('# Paste your solution here...');
    const [language, setLanguage] = useState('python');
    const [company, setCompany] = useState('Google');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const handleEvaluate = async () => {
        if (!code.trim()) {
            alert('Please paste your code first!');
            return;
        }

        setLoading(true);
        setResult('');
        setScore(null);

        try {
            const response = await fetch('http://localhost:8000/review/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    mode: 'interview',
                    language,
                    code: `Company: ${company}\n\n${code}`,
                    problem: ''
                })
            });

            const data = await response.json();
            setResult(data.result);

            // Extract score from result
            const scoreMatch = data.result.match(/(\d+)\/10/);
            if (scoreMatch) {
                setScore(parseInt(scoreMatch[1]));
            }

        } catch (err) {
            setResult('Cannot connect to backend!');
        }

        setLoading(false);
    };

    const handleDownload = () => {
        const blob = new Blob([result], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview_evaluation.md';
        a.click();
    };

    return (
        <div className="feature-wrapper">

            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">🤖</div>
                {SIDEBAR_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-btn ${item.id === 'interview' ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        {item.icon}
                        <span className="sidebar-tooltip">{item.label}</span>
                    </button>
                ))}
                <div className="sidebar-bottom">
                    <button
                        className="sidebar-btn"
                        onClick={() => {
                            localStorage.removeItem('username');
                            navigate('/');
                        }}
                    >
                        🚪
                        <span className="sidebar-tooltip">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="feature-main">

                {/* Topbar */}
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
                        <p className="panel-title">🎯 Interview Evaluator</p>

                        {/* Company Tabs */}
                        <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '8px' }}>
                            Select Company:
                        </p>
                        <div className="company-tabs">
                            {COMPANIES.map(c => (
                                <button
                                    key={c}
                                    className={`company-tab ${company === c ? 'active' : ''}`}
                                    onClick={() => setCompany(c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* Language */}
                        <select
                            className="lang-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l.toUpperCase()}</option>
                            ))}
                        </select>

                        {/* Monaco Editor */}
                        <div className="monaco-wrapper" style={{ height: '320px' }}>
                            <Editor
                                height="320px"
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
                            <button
                                className="primary-btn"
                                onClick={handleEvaluate}
                                disabled={loading}
                            >
                                {loading ? '⏳ Evaluating...' : `🎯 Evaluate for ${company}`}
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={() => { setCode(''); setResult(''); setScore(null); }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        <p className="panel-title">📊 Evaluation Result</p>

                        {loading ? (
                            <div className="loading-state">
                                <span className="loading-spinner">⚙️</span>
                                <p>AI is evaluating your solution...</p>
                            </div>
                        ) : result ? (
                            <>
                                {/* Score Card */}
                                {score && (
                                    <div className="score-card">
                                        <div className="score-number">{score}/10</div>
                                        <div className="score-label">
                                            {company} Interview Score
                                        </div>
                                        <div className="score-bar">
                                            <div
                                                className="score-fill"
                                                style={{ width: `${score * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="result-box">
                                    <div className="result-text">{result}</div>
                                </div>

                                <button
                                    className="download-btn"
                                    onClick={handleDownload}
                                >
                                    ⬇️ Download Evaluation
                                </button>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🎯</div>
                                <p className="empty-title">
                                    Ready to evaluate your solution?
                                </p>
                                <p className="empty-desc">
                                    Paste your code, select a company,
                                    and get FAANG-style interview feedback!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewEvaluator;