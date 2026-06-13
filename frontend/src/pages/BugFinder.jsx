// BugFinder.jsx 
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import '../styles/bugfinder.css';


import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        background: '#0d1117',
        primaryColor: '#1f6feb',
        primaryTextColor: '#e6edf3',
        lineColor: '#58a6ff',
    }
});

const LANGUAGES = [
    'python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'sql', 'go'
];

const SIDEBAR_ITEMS = [
    { id: 'bug', icon: '🐛', label: 'Bug Finder' },
    { id: 'interview', icon: '🎯', label: 'Interview Evaluator' },
    { id: 'hint', icon: '💡', label: 'Hint System' },
    { id: 'complexity', icon: '📊', label: 'Complexity Analyzer' },
    { id: 'docs', icon: '📖', label: 'Auto Documentation' },
];

function MermaidDiagram({ chart }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && chart) {
            ref.current.innerHTML = chart;
            mermaid.run({ nodes: [ref.current] }).catch(() => {
                if (ref.current) {
                    ref.current.innerHTML =
                        '<p style="color:#8b949e">Diagram unavailable</p>';
                }
            });
        }
    }, [chart]);

    return (
        <div
            ref={ref}
            className="mermaid"
            style={{ textAlign: 'center' }}
        />
    );
}

function BugFinder() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [code, setCode] = useState(
        '# ⚡ Drop your code here...\n\ndef find_duplicates(arr):\n    seen = []\n    for item in arr:\n        if item in seen:\n            return True\n        seen.append(item)\n    return False'
    );
    const [language, setLanguage] = useState('python');
    const [activeTab, setActiveTab] = useState('explanation');
    const [loading, setLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState('bug');

    // Results
    const [bugExplanation, setBugExplanation] = useState('');
    const [mermaidDiagram, setMermaidDiagram] = useState('');
    const [topics, setTopics] = useState([]);

    // Topic Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topicContent, setTopicContent] = useState('');
    const [topicLoading, setTopicLoading] = useState(false);

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const handleRunBugFinder = async () => {
        if (!code.trim()) {
            alert('Please paste some code first!');
            return;
        }

        setLoading(true);
        setBugExplanation('');
        setMermaidDiagram('');
        setTopics([]);
        setActiveTab('explanation');

        try {
            const response = await fetch(
                'http://localhost:8000/review/bug-with-diagram',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        language: language === 'cpp' ? 'C++' : language,
                        code
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                setBugExplanation(data.bug_explanation);
                setMermaidDiagram(data.mermaid_diagram);
                setTopics(data.topics_to_learn || []);
            } else {
                setBugExplanation('Something went wrong. Try again!');
            }

        } catch (err) {
            setBugExplanation(
                ' Cannot connect to backend!\nMake sure FastAPI is running on port 8000.'
            );
        }

        setLoading(false);
    };

    const handleTopicClick = async (topic) => {
        setSelectedTopic(topic);
        setDrawerOpen(true);
        setTopicLoading(true);
        setTopicContent('');

        try {
            const response = await fetch(
                'http://localhost:8000/topic/explain',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic_name: topic })
                }
            );

            const data = await response.json();
            setTopicContent(data.explanation || 'No explanation available');

        } catch (err) {
            setTopicContent('Cannot load topic explanation.');
        }

        setTopicLoading(false);
    };

    const handleFeatureChange = (featureId) => {
        setActiveFeature(featureId);
        if (featureId !== 'bug') {
            navigate('/dashboard');
        }
    };

    return (
        <div className="bugfinder-wrapper">

            {/* ── Sidebar ── */}
            <div className="sidebar">
                <div className="sidebar-logo">🤖</div>

                {SIDEBAR_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-btn ${activeFeature === item.id ? 'active' : ''}`}
                        onClick={() => handleFeatureChange(item.id)}
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
                        title="Logout"
                    >
                        🚪
                        <span className="sidebar-tooltip">Logout</span>
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="main-content">

                {/* ── Top Bar ── */}
                <div className="topbar">
                    <span className="topbar-title">
                        🤖 CodeSense AI
                    </span>
                    <div className="topbar-right">
                        <span className="topbar-badge">
                            👋 {username}
                        </span>
                        <button
                            className="topbar-logout"
                            onClick={() => {
                                localStorage.removeItem('username');
                                navigate('/');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* ── Editor + Result Panel ── */}
                <div className="editor-panel">

                    {/* ── Left: Monaco Editor ── */}
                    <div className="editor-section">
                        <div className="editor-header">
                            <div className="editor-header-left">
                                <span className="editor-title">
                                    ⚡ Code Editor
                                </span>
                                <select
                                    className="language-select"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>
                                            {lang.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="editor-actions">
                                <button
                                    className="run-btn"
                                    onClick={handleRunBugFinder}
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Analyzing...' : '🐛 Find Bugs'}
                                </button>
                                <button
                                    className="clear-btn"
                                    onClick={() => {
                                        setCode('');
                                        setBugExplanation('');
                                        setMermaidDiagram('');
                                        setTopics([]);
                                    }}
                                >
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>

                        {/* Monaco Editor */}
                        <div className="monaco-container">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    fontFamily: 'Courier New, monospace',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    lineNumbers: 'on',
                                    renderLineHighlight: 'all',
                                    cursorBlinking: 'smooth',
                                    smoothScrolling: true,
                                    padding: { top: 16, bottom: 16 },
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Right: AI Result Panel ── */}
                    <div className="result-panel">

                        {/* Tabs */}
                        <div className="result-tabs">
                            <button
                                className={`result-tab ${activeTab === 'explanation' ? 'active' : ''}`}
                                onClick={() => setActiveTab('explanation')}
                            >
                                🐛 Bug Analysis
                            </button>
                            <button
                                className={`result-tab ${activeTab === 'diagram' ? 'active' : ''}`}
                                onClick={() => setActiveTab('diagram')}
                            >
                                📊 Diagram
                            </button>
                            <button
                                className={`result-tab ${activeTab === 'topics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('topics')}
                            >
                                📚 Learn Topics
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="result-content">

                            {loading ? (
                                <div className="loading-state">
                                    <span className="loading-spinner">⚙️</span>
                                    <p>AI is analyzing your code...</p>
                                    <p style={{ fontSize: '12px', color: '#484f58' }}>
                                        Finding bugs + generating diagram...
                                    </p>
                                </div>

                            ) : !bugExplanation ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🐛</div>
                                    <p className="empty-slogan">
                                        Your code deserves better
                                        than just working.
                                    </p>
                                    <p className="empty-desc">
                                        Paste your code in the editor
                                        and click "Find Bugs" to get
                                        AI-powered analysis with
                                        visual diagrams.
                                    </p>
                                </div>

                            ) : (
                                <>
                                    {/* Bug Explanation Tab */}
                                    {activeTab === 'explanation' && (
                                        <div className="bug-explanation">
                                            {bugExplanation}
                                        </div>
                                    )}

                                    {/* Diagram Tab */}
                                    {activeTab === 'diagram' && (
                                        <div className="diagram-box">
                                            <p className="diagram-title">
                                                📊 Code Flow Diagram
                                            </p>
                                            {mermaidDiagram ? (
                                                <MermaidDiagram
                                                    chart={mermaidDiagram}
                                                />
                                            ) : (
                                                <p style={{ color: '#8b949e' }}>
                                                    No diagram available
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Topics Tab */}
                                    {activeTab === 'topics' && (
                                        <div className="topics-section">
                                            <p className="topics-title">
                                                📚 Topics to Learn
                                            </p>
                                            <p style={{
                                                color: '#8b949e',
                                                fontSize: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                Click any topic to learn
                                                it with visual explanation!
                                            </p>
                                            <div className="topics-grid">
                                                {topics.map((topic, i) => (
                                                    <button
                                                        key={i}
                                                        className="topic-card"
                                                        onClick={() => handleTopicClick(topic)}
                                                    >
                                                        📖 {topic}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Topic Drawer ── */}
            <div className={`topic-drawer ${drawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">
                        📖 {selectedTopic}
                    </span>
                    <button
                        className="drawer-close"
                        onClick={() => setDrawerOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {topicLoading ? (
                    <div className="loading-state">
                        <span className="loading-spinner">⚙️</span>
                        <p>Loading explanation...</p>
                    </div>
                ) : (
                    <div className="drawer-content">
                        {topicContent}
                    </div>
                )}
            </div>

        </div>
    );
}

export default BugFinder;