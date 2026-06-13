// AutoDocs.jsx
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

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'sql'];

function AutoDocs() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [code, setCode] = useState('# Paste your code here...');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const handleGenerateDocs = async () => {
        if (!code.trim()) {
            alert('Please paste your code first!');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            const response = await fetch('http://localhost:8000/review/docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    mode: 'docs',
                    language,
                    code,
                    problem: ''
                })
            });

            const data = await response.json();
            setResult(data.result);

        } catch (err) {
            setResult('❌ Cannot connect to backend!');
        }

        setLoading(false);
    };

    const handleDownload = () => {
        const blob = new Blob([result], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documentation.md';
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
                        className={`sidebar-btn ${item.id === 'docs' ? 'active' : ''}`}
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
                        <p className="panel-title">📖 Auto Documentation</p>

                        <select className="lang-select" value={language}
                            onChange={(e) => setLanguage(e.target.value)}>
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l.toUpperCase()}</option>
                            ))}
                        </select>

                        <div className="monaco-wrapper" style={{ height: '380px' }}>
                            <Editor
                                height="380px"
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
                                onClick={handleGenerateDocs} disabled={loading}>
                                {loading ? '⏳ Generating...' : '📖 Generate Documentation'}
                            </button>
                            <button className="secondary-btn"
                                onClick={() => { setCode(''); setResult(''); }}>
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        <p className="panel-title">📄 Generated Documentation</p>

                        {loading ? (
                            <div className="loading-state">
                                <span className="loading-spinner">⚙️</span>
                                <p>Generating documentation...</p>
                            </div>
                        ) : result ? (
                            <>
                                <div className="result-box">
                                    <div className="result-text">{result}</div>
                                </div>
                                <button className="download-btn" onClick={handleDownload}>
                                    ⬇️ Download as Markdown
                                </button>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📖</div>
                                <p className="empty-title">
                                    Generate docs in seconds!
                                </p>
                                <p className="empty-desc">
                                    Paste your code and AI will
                                    generate complete professional
                                    documentation with examples
                                    and README section!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AutoDocs;