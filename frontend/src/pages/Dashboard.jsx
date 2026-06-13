// Dashboard.jsx 
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import '../styles/dashboard.css';

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

const SIDEBAR_FEATURES = [
    { id: 'bug', icon: '🐛', label: 'Bug Finder' },
    { id: 'interview', icon: '🎯', label: 'Interview Evaluator' },
    { id: 'hint', icon: '💡', label: 'Hint System' },
    { id: 'complexity', icon: '📊', label: 'Complexity Analyzer' },
    { id: 'docs', icon: '📖', label: 'Auto Documentation' },
];

const LANGUAGES = [
    'python', 'javascript', 'java',
    'cpp', 'c', 'typescript', 'sql', 'go'
];

const COMPANIES = ['Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Microsoft'];

function MermaidDiagram({ chart }) {
    const ref = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!ref.current || !chart) return;
        setError(false);

        const cleanChart = chart
            .replace(/```mermaid/g, '')
            .replace(/```/g, '')
            .replace(/^mermaid/i, '')
            .trim();

        if (!cleanChart.startsWith('graph')) {
            setError(true);
            return;
        }

        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        ref.current.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.id = uniqueId;
        div.textContent = cleanChart;
        ref.current.appendChild(div);

        setTimeout(() => {
            mermaid.run({ nodes: [div] })
                .catch(() => setError(true));
        }, 100);

    }, [chart]);

    if (error) {
        return (
            <div style={{
                background: '#161b27',
                border: '1px solid #1f6feb44',
                borderRadius: '10px',
                padding: '20px',
                color: '#8b949e',
                fontSize: '14px',
                lineHeight: 1.8
            }}>
                <p style={{ color: '#58a6ff', fontWeight: 700, marginBottom: '10px' }}>
                    📊 Code Flow:
                </p>
                <p>Start → Initialize Variables → Loop Through Data → Check Condition → Bug Found → Fix Required → Return Result</p>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            style={{
                textAlign: 'center',
                padding: '10px',
                minHeight: '100px'
            }}
        />
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [activeFeature, setActiveFeature] = useState('bug');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(
        '# ⚡ Drop your code here...\n\ndef find_duplicates(arr):\n    seen = []\n    for item in arr:\n        if item in seen:\n            return True\n        seen.append(item)\n    return False'
    );

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('result');

    const [bugResult, setBugResult] = useState('');
    const [mermaidDiagram, setMermaidDiagram] = useState('');
    const [topics, setTopics] = useState([]);

    const [company, setCompany] = useState('Google');
    const [interviewResult, setInterviewResult] = useState('');
    const [score, setScore] = useState(null);

    const [problem, setProblem] = useState('');
    const [hints, setHints] = useState([]);
    const [unlockedHints, setUnlockedHints] = useState(0);

    const [complexityResult, setComplexityResult] = useState('');
    const [timeComplexity, setTimeComplexity] = useState('');
    const [spaceComplexity, setSpaceComplexity] = useState('');

    const [docsResult, setDocsResult] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [codeError, setCodeError] = useState('');
    const [codeAiExplanation, setCodeAiExplanation] = useState('');
    const [codeRunning, setCodeRunning] = useState(false);
    const [hasCodeError, setHasCodeError] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topicContent, setTopicContent] = useState('');
    const [topicLoading, setTopicLoading] = useState(false);

    useEffect(() => {
        if (!username) navigate('/');
    }, [username, navigate]);

    const handleFeatureChange = (featureId) => {
        setActiveFeature(featureId);
        setActiveTab('result');
        setDrawerOpen(false);
    };

    const handleRunBug = async () => {
        if (!code.trim()) return alert('Please paste code first!');
        setLoading(true);
        setBugResult('');
        setMermaidDiagram('');
        setTopics([]);
        setActiveTab('result');

        try {
            const res = await fetch('http://localhost:8000/review/bug-with-diagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    language: language === 'cpp' ? 'C++' : language,
                    code
                })
            });
            const data = await res.json();
            setBugResult(data.bug_explanation || '');
            setMermaidDiagram(data.mermaid_diagram || '');
            setTopics(data.topics_to_learn || []);
        } catch {
            setBugResult(' Cannot connect to backend!');
        }
        setLoading(false);
    };

    const handleRunInterview = async () => {
        if (!code.trim()) return alert('Please paste code first!');
        setLoading(true);
        setInterviewResult('');
        setScore(null);

        try {
            const res = await fetch('http://localhost:8000/review/interview', {
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
            const data = await res.json();
            setInterviewResult(data.result || '');
            const m = (data.result || '').match(/(\d+)\/10/);
            if (m) setScore(parseInt(m[1]));
        } catch {
            setInterviewResult(' Cannot connect to backend!');
        }
        setLoading(false);
    };

    const handleRunHint = async () => {
        if (!problem.trim()) return alert('Please describe your problem!');
        setLoading(true);
        setHints([]);
        setUnlockedHints(0);

        try {
            const res = await fetch('http://localhost:8000/review/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    mode: 'hint',
                    language,
                    code: code || 'No code provided',
                    problem
                })
            });
            const data = await res.json();
            const text = data.result || '';

            const parsed = [];
            const regex = /##\s*💡\s*Hint\s*(\d+)([\s\S]*?)(?=##\s*💡\s*Hint|$)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                parsed.push({
                    number: parseInt(match[1]),
                    text: match[2].trim()
                });
            }
            if (parsed.length === 0) {
                text.split('\n\n').slice(0, 3).forEach((s, i) => {
                    if (s.trim()) parsed.push({ number: i + 1, text: s.trim() });
                });
            }
            setHints(parsed);
            setUnlockedHints(1);
        } catch {
            setHints([{ number: 1, text: ' Cannot connect to backend!' }]);
            setUnlockedHints(1);
        }
        setLoading(false);
    };

    const handleRunComplexity = async () => {
        if (!code.trim()) return alert('Please paste code first!');
        setLoading(true);
        setComplexityResult('');
        setTimeComplexity('');
        setSpaceComplexity('');

        try {
            const res = await fetch('http://localhost:8000/review/complexity', {
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
            const data = await res.json();
            setComplexityResult(data.result || '');
            const tm = (data.result || '').match(/Time Complexity[:\s]+O\([^)]+\)/i);
            const sm = (data.result || '').match(/Space Complexity[:\s]+O\([^)]+\)/i);
            if (tm) { const o = tm[0].match(/O\([^)]+\)/); if (o) setTimeComplexity(o[0]); }
            if (sm) { const o = sm[0].match(/O\([^)]+\)/); if (o) setSpaceComplexity(o[0]); }
        } catch {
            setComplexityResult('Cannot connect to backend!');
        }
        setLoading(false);
    };

    const handleRunDocs = async () => {
        if (!code.trim()) return alert('Please paste code first!');
        setLoading(true);
        setDocsResult('');

        try {
            const res = await fetch('http://localhost:8000/review/docs', {
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
            const data = await res.json();
            setDocsResult(data.result || '');
        } catch {
            setDocsResult(' Cannot connect to backend!');
        }
        setLoading(false);
    };
    const handleRunCode = async () => {
    if (!code.trim()) return alert('Please paste some code first!');
    setCodeRunning(true);
    setCodeOutput('');
    setCodeError('');
    setCodeAiExplanation('');
    setHasCodeError(false);
    setActiveTab('output');

    try {
        const res = await fetch('http://localhost:8000/code/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                code,
                language,
                stdin: ''
            })
        });
        const data = await res.json();
        setCodeOutput(data.output || '');
        setCodeError(data.error || '');
        setCodeAiExplanation(data.ai_explanation || '');
        setHasCodeError(data.has_error || false);
    } catch {
        setCodeError(' Cannot connect to backend!');
        setHasCodeError(true);
    }
    setCodeRunning(false);
};

    const handleRun = () => {
        if (activeFeature === 'bug') handleRunBug();
        else if (activeFeature === 'interview') handleRunInterview();
        else if (activeFeature === 'hint') handleRunHint();
        else if (activeFeature === 'complexity') handleRunComplexity();
        else if (activeFeature === 'docs') handleRunDocs();
    };

    const handleTopicClick = async (topic) => {
        setSelectedTopic(topic);
        setDrawerOpen(true);
        setTopicLoading(true);
        setTopicContent('');
        try {
            const res = await fetch('http://localhost:8000/topic/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic_name: topic })
            });
            const data = await res.json();
            setTopicContent(data.explanation || 'No explanation available');
        } catch {
            setTopicContent(' Cannot load topic.');
        }
        setTopicLoading(false);
    };

    const getRunLabel = () => {
        const labels = {
            bug: '🐛 Find Bugs',
            interview: `🎯 Evaluate for ${company}`,
            hint: '💡 Get Hints',
            complexity: '📊 Analyze',
            docs: '📖 Generate Docs'
        };
        return labels[activeFeature] || 'Run';
    };

    const getComplexityClass = (c) => {
        if (!c) return 'okay';
        if (c.includes('(1)') || c.includes('log')) return 'good';
        if (c.includes('n²') || c.includes('n^2') || c.includes('n³')) return 'bad';
        return 'okay';
    };

    const getComplexityWidth = (c) => {
        if (!c) return 30;
        if (c.includes('(1)')) return 10;
        if (c.includes('log')) return 25;
        if (c.includes('n)')) return 40;
        if (c.includes('n log')) return 55;
        if (c.includes('n²') || c.includes('n^2')) return 75;
        return 50;
    };

    const handleDownload = (content, filename) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    const getResultTabs = () => {
    if (activeFeature === 'bug') {
        return [
            { id: 'result', label: '🐛 Analysis' },
            { id: 'diagram', label: '📊 Diagram' },
            { id: 'topics', label: '📚 Learn' },
        ];
    }
    return [
        { id: 'result', label: '📄 Result' },
        { id: 'output', label: '▶️ Output' },
    ];
};
    const renderResult = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <span className="loading-spinner">⚙️</span>
                    <p style={{ fontSize: '13px' }}>AI is analyzing...</p>
                </div>
            );
        }

        if (activeFeature === 'bug') {
            if (!bugResult) return renderEmpty('🐛', 'Drop code and find bugs!', 'AI will find bugs, show diagrams and teach you the concepts!');

            if (activeTab === 'result') {
                return (
                    <>
                        <div className="result-text">
                            <ReactMarkdown>{bugResult}</ReactMarkdown>
                        </div>
                        <button className="download-btn"
                            onClick={() => handleDownload(bugResult, 'bug_report.md')}>
                            ⬇️ Download Report
                        </button>
                    </>
                );
            }

            if (activeTab === 'diagram') {
                return (
                    <div className="diagram-box">
                        <p style={{
                            color: '#58a6ff',
                            fontSize: '15px',
                            fontWeight: 800,
                            marginBottom: '16px',
                            borderBottom: '1px solid #1f6feb44',
                            paddingBottom: '8px'
                        }}>
                            📊 Code Flow Diagram
                        </p>
                        <p style={{
                            color: '#8b949e',
                            fontSize: '13px',
                            marginBottom: '16px'
                        }}>
                            Visual representation of how your code flows and where the bug occurs.
                        </p>
                        {mermaidDiagram && mermaidDiagram.trim() !== ''
                            ? <MermaidDiagram chart={mermaidDiagram} />
                            : (
                                <div style={{
                                    background: '#161b27',
                                    border: '1px solid #21262d',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    color: '#8b949e',
                                    fontSize: '14px'
                                }}>
                                    Run Bug Finder first to generate diagram!
                                </div>
                            )
                        }
                    </div>
                );
            }

            if (activeTab === 'topics') {
                return (
                    <>
                        <p style={{ color: '#58a6ff', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                            📚 Topics to Learn
                        </p>
                        <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '12px' }}>
                            Click any topic for visual explanation!
                        </p>
                        <div className="topics-grid">
                            {topics.map((t, i) => (
                                <button key={i} className="topic-card"
                                    onClick={() => handleTopicClick(t)}>
                                    📖 {t}
                                </button>
                            ))}
                        </div>
                    </>
                );
            }
        }

        if (activeFeature === 'interview') {
            if (!interviewResult) return renderEmpty('🎯', 'Evaluate your solution!', 'Get FAANG-style scoring and interview feedback!');
            return (
                <>
                    {score && (
                        <div className="score-card">
                            <div className="score-number">{score}/10</div>
                            <div style={{ color: '#8b949e', fontSize: '12px' }}>
                                {company} Interview Score
                            </div>
                            <div className="score-bar">
                                <div className="score-fill" style={{ width: `${score * 10}%` }} />
                            </div>
                        </div>
                    )}
                    <div className="result-text">
                        <ReactMarkdown>{interviewResult}</ReactMarkdown>
                    </div>
                    <button className="download-btn"
                        onClick={() => handleDownload(interviewResult, 'interview_eval.md')}>
                        ⬇️ Download Evaluation
                    </button>
                </>
            );
        }

        if (activeFeature === 'hint') {
            if (hints.length === 0) return renderEmpty('💡', 'Get progressive hints!', 'Describe your problem and unlock hints one by one!');
            return (
                <>
                    {hints.map((hint, i) => (
                        <div
                            key={i}
                            className={`hint-card ${i < unlockedHints ? 'unlocked' : 'locked'}`}
                            onClick={() => {
                                if (i === unlockedHints - 1 && unlockedHints < hints.length) {
                                    setUnlockedHints(p => p + 1);
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                <span className="hint-number">{hint.number}</span>
                                <span style={{ color: '#58a6ff', fontSize: '13px', fontWeight: 600 }}>
                                    Hint {hint.number} {i >= unlockedHints ? '🔒' : ''}
                                </span>
                            </div>
                            {i < unlockedHints
                                ? (
                                    <div style={{ fontSize: '15px', color: '#e6edf3', lineHeight: 1.8 }}>
                                        <ReactMarkdown>{hint.text}</ReactMarkdown>
                                    </div>
                                )
                                : <p style={{ fontSize: '12px', color: '#484f58' }}>
                                    Click previous hint to unlock...
                                  </p>
                            }
                        </div>
                    ))}
                    {unlockedHints === hints.length && hints.length > 0 && (
                        <div className="hint-card unlocked" style={{ borderColor: '#3fb950' }}>
                            <p style={{ color: '#3fb950', fontSize: '14px' }}>
                                ✅ All hints unlocked! Now try solving it yourself!
                            </p>
                        </div>
                    )}
                </>
            );
        }

        if (activeFeature === 'complexity') {
            if (!complexityResult) return renderEmpty('📊', 'Analyze complexity!', 'Get Big O time and space analysis with visual indicators!');
            return (
                <>
                    {timeComplexity && (
                        <div className="complexity-card">
                            <p style={{ color: '#8b949e', fontSize: '12px' }}>⏱️ Time Complexity</p>
                            <p className="complexity-value">{timeComplexity}</p>
                            <div className="complexity-bar">
                                <div className={`complexity-fill ${getComplexityClass(timeComplexity)}`}
                                    style={{ width: `${getComplexityWidth(timeComplexity)}%` }} />
                            </div>
                        </div>
                    )}
                    {spaceComplexity && (
                        <div className="complexity-card">
                            <p style={{ color: '#8b949e', fontSize: '12px' }}>💾 Space Complexity</p>
                            <p className="complexity-value">{spaceComplexity}</p>
                            <div className="complexity-bar">
                                <div className={`complexity-fill ${getComplexityClass(spaceComplexity)}`}
                                    style={{ width: `${getComplexityWidth(spaceComplexity)}%` }} />
                            </div>
                        </div>
                    )}
                    <div className="result-text" style={{ marginTop: '12px' }}>
                        <ReactMarkdown>{complexityResult}</ReactMarkdown>
                    </div>
                </>
            );
        }

        if (activeFeature === 'docs') {
            if (!docsResult) return renderEmpty('📖', 'Generate documentation!', 'Paste your code and get complete professional docs!');
            return (
                <>
                    <div className="result-text">
                        <ReactMarkdown>{docsResult}</ReactMarkdown>
                    </div>
                    <button className="download-btn"
                        onClick={() => handleDownload(docsResult, 'documentation.md')}>
                        ⬇️ Download Docs
                    </button>
                </>
            );
        }
        // OUTPUT TAB 
        if (activeTab === 'output') {
            return (
                <div>
                    <p style={{
                        color: '#58a6ff',
                        fontSize: '14px',
                        fontWeight: 700,
                        marginBottom: '12px',
                        borderBottom: '1px solid #1f6feb44',
                        paddingBottom: '8px'
                    }}>
                        ▶️ Code Output
                    </p>

                    {codeRunning ? (
                        <div className="loading-state">
                            <span className="loading-spinner">⚙️</span>
                            <p style={{ fontSize: '13px' }}>Running your code...</p>
                        </div>
                    ) : codeOutput || codeError ? (
                        <>
                            {codeOutput && (
                                <div style={{
                                    background: '#0d1117',
                                    border: '1px solid #3fb950',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '12px'
                                }}>
                                    <p style={{
                                        color: '#3fb950',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        marginBottom: '8px'
                                    }}>
                                        ✅ Output:
                                    </p>
                                    <pre style={{
                                        color: '#e6edf3',
                                        fontSize: '15px',
                                        fontFamily: 'Courier New, monospace',
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap',
                                        margin: 0
                                    }}>
                                        {codeOutput}
                                    </pre>
                                </div>
                            )}

                            {codeError && (
                                <div style={{
                                    background: '#0d1117',
                                    border: '1px solid #f85149',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '12px'
                                }}>
                                    <p style={{
                                        color: '#f85149',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        marginBottom: '8px'
                                    }}>
                                         Error:
                                    </p>
                                    <pre style={{
                                        color: '#ffa198',
                                        fontSize: '14px',
                                        fontFamily: 'Courier New, monospace',
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap',
                                        margin: 0
                                    }}>
                                        {codeError}
                                    </pre>
                                </div>
                            )}

                            {codeAiExplanation && (
                                <div style={{
                                    background: '#0d1117',
                                    border: '1px solid #1f6feb44',
                                    borderRadius: '10px',
                                    padding: '16px'
                                }}>
                                    <p style={{
                                        color: '#58a6ff',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        marginBottom: '10px'
                                    }}>
                                        🤖 AI Explains the Error:
                                    </p>
                                    <div className="result-text">
                                        <ReactMarkdown>{codeAiExplanation}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">▶️</div>
                            <p className="empty-title">Run your code!</p>
                            <p className="empty-desc">
                                Click the green ▶️ Run button to execute
                                your code and see the output here.
                                If there are errors, AI will explain them!
                            </p>
                        </div>
                    )}
                </div>
            );
        }
    };

    const renderEmpty = (icon, title, desc) => (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <p className="empty-title">{title}</p>
            <p className="empty-desc">{desc}</p>
        </div>
    );

    return (
        <div className="dashboard-wrapper">

            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">🤖</div>
                {SIDEBAR_FEATURES.map(f => (
                    <button
                        key={f.id}
                        className={`sidebar-btn ${activeFeature === f.id ? 'active' : ''}`}
                        onClick={() => handleFeatureChange(f.id)}
                    >
                        {f.icon}
                        <span className="sidebar-tooltip">{f.label}</span>
                    </button>
                ))}
                <div className="sidebar-bottom">
                     <button
                        className="sidebar-btn"
                             onClick={() => navigate('/progress')}
                       >
        📈
                <span className="sidebar-tooltip">Progress</span>
                </button>
                                          <button
                className="sidebar-btn"
                 onClick={() => { localStorage.removeItem('username'); navigate('/'); }}
                      >
        🚪
                      <span className="sidebar-tooltip">Logout</span>
                           </button>
                   </div>
        </div>

            {/* Main Area */}
            <div className="main-area">

                {/* Topbar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <span className="active-mode-tag">
                            {SIDEBAR_FEATURES.find(f => f.id === activeFeature)?.icon}{' '}
                            {SIDEBAR_FEATURES.find(f => f.id === activeFeature)?.label}
                        </span>
                    </div>
                    <div className="topbar-right">
                        <span className="user-badge">👋 {username}</span>
                        <button className="logout-btn"
                            onClick={() => { localStorage.removeItem('username'); navigate('/'); }}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Company Tabs - Interview only */}
                {activeFeature === 'interview' && (
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
                )}

                {/* Content Area */}
                <div className="content-area">

                    
                    <div className="editor-section">

                        {/* Editor Topbar */}
                        {activeFeature !== 'hint' && (
    <div className="editor-topbar">
        <div className="editor-left">
            <span className="editor-label">⚡ Code Editor</span>
            <select
                className="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
            </select>
        </div>
        <div className="editor-right">
            <button
                onClick={handleRunCode}
                disabled={codeRunning}
                style={{
                    padding: '6px 14px',
                    background: codeRunning ? '#21262d' : 'linear-gradient(90deg, #3fb950, #56d364)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: codeRunning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {codeRunning ? '⏳ Running...' : '▶️ Run'}
            </button>
            <button className="run-btn" onClick={handleRun} disabled={loading}>
                {loading ? '⏳ Running...' : getRunLabel()}
            </button>
            <button className="clear-btn" onClick={() => {
                setCode('');
                setBugResult(''); setMermaidDiagram(''); setTopics([]);
                setInterviewResult(''); setScore(null);
                setComplexityResult(''); setTimeComplexity(''); setSpaceComplexity('');
                setDocsResult('');
                setCodeOutput(''); setCodeError('');
                setCodeAiExplanation(''); setHasCodeError(false);
            }}>
                🗑️
            </button>
        </div>
    </div>
)}

                        {/* Hint Topbar */}
                        {activeFeature === 'hint' && (
                            <div className="editor-topbar">
                                <div className="editor-left">
                                    <span className="editor-label">💡 Hint System</span>
                                </div>
                                <div className="editor-right">
                                    <button className="run-btn" onClick={handleRun} disabled={loading}>
                                        {loading ? '⏳ Getting Hints...' : '💡 Get Hints'}
                                    </button>
                                    <button className="clear-btn" onClick={() => {
                                        setProblem(''); setCode('');
                                        setHints([]); setUnlockedHints(0);
                                    }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Monaco Editor  */}
                        {activeFeature !== 'hint' && (
                            <div className="monaco-container">
                                <Editor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={(v) => setCode(v || '')}
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
                        )}

                        {/* Hint Mode */}
                        {activeFeature === 'hint' && (
                            <div style={{
                                flex: 1,
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                background: '#0a0a0f',
                                overflowY: 'auto'
                            }}>
                                <div style={{
                                    background: '#0d1117',
                                    border: '1px solid #1f6feb44',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}>
                                    <p style={{ color: '#58a6ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                                        💡 Describe Your Problem
                                    </p>
                                    <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '14px', lineHeight: 1.6 }}>
                                        Tell AI what problem you are trying to solve and where you are stuck.
                                        AI will give you 3 progressive hints without revealing the full solution!
                                    </p>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            background: '#161b27',
                                            border: '1px solid #30363d',
                                            borderRadius: '10px',
                                            color: '#e6edf3',
                                            fontSize: '15px',
                                            padding: '14px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'Segoe UI, sans-serif',
                                            lineHeight: 1.7
                                        }}
                                        placeholder="e.g., I need to find two numbers in an array that add up to a target sum. I tried nested loops but it is too slow..."
                                        value={problem}
                                        onChange={(e) => setProblem(e.target.value)}
                                    />
                                </div>

                                <div style={{
                                    background: '#0d1117',
                                    border: '1px solid #21262d',
                                    borderRadius: '12px',
                                    padding: '16px'
                                }}>
                                    <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '10px', fontWeight: 600 }}>
                                        💻 Your Current Code (Optional)
                                    </p>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            height: '140px',
                                            background: '#161b27',
                                            border: '1px solid #30363d',
                                            borderRadius: '10px',
                                            color: '#e6edf3',
                                            fontSize: '13px',
                                            padding: '12px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'Courier New, monospace',
                                            lineHeight: 1.6
                                        }}
                                        placeholder="Paste your current attempt here (optional)..."
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Result Section */}
                    <div className="result-section">
                        <div className="result-tabs">
                            {getResultTabs().map(tab => (
                                <button
                                    key={tab.id}
                                    className={`result-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="result-body">
                            {renderResult()}
                        </div>
                    </div>

                </div>
            </div>

            {/* Topic  */}
            <div className={`topic-drawer ${drawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">📖 {selectedTopic}</span>
                    <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>
                {topicLoading ? (
                    <div className="loading-state">
                        <span className="loading-spinner">⚙️</span>
                        <p style={{ fontSize: '13px' }}>Loading explanation...</p>
                    </div>
                ) : (
                    <div className="drawer-content">
                        <ReactMarkdown>{topicContent}</ReactMarkdown>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Dashboard;