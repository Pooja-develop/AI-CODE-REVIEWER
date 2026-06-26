// Progress.jsx 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer,
    LineChart, Line, CartesianGrid
} from 'recharts';

const COLORS = ['#1f6feb', '#3fb950', '#e3b341', '#f85149', '#58a6ff', '#79c0ff'];

function Progress() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }
        fetchProgress();
    }, [username, navigate]);

    // pulls all stats from backend - total reviews, bugs, topics, daily activity
    const fetchProgress = async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/user/progress/${username}`
            );
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch {
            console.error('Failed to fetch progress');
        }
        setLoading(false);
    };

    const styles = {
        wrapper: {
            minHeight: '100vh',
            background: '#0a0a0f',
            color: '#e6edf3',
            fontFamily: 'Segoe UI, sans-serif',
            padding: '0'
        },
        topbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: '#0d1117',
            borderBottom: '1px solid #21262d',
            height: '48px'
        },
        backBtn: {
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '13px'
        },
        title: {
            fontSize: '1rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        badge: {
            background: '#1f6feb22',
            border: '1px solid #1f6feb44',
            borderRadius: '50px',
            padding: '4px 12px',
            color: '#58a6ff',
            fontSize: '12px'
        },
        content: {
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        pageTitle: {
            fontSize: '1.8rem',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px'
        },
        pageSubtitle: {
            color: '#8b949e',
            fontSize: '14px',
            marginBottom: '24px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        },
        statCard: {
            background: 'linear-gradient(135deg, #0d1117, #161b27)',
            border: '1px solid #21262d',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '2.5rem',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #1f6feb, #58a6ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        statLabel: {
            color: '#8b949e',
            fontSize: '13px',
            marginTop: '6px'
        },
        statIcon: {
            fontSize: '1.8rem',
            marginBottom: '8px'
        },
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
        },
        chartCard: {
            background: '#0d1117',
            border: '1px solid #21262d',
            borderRadius: '12px',
            padding: '20px'
        },
        chartTitle: {
            color: '#58a6ff',
            fontSize: '14px',
            fontWeight: 700,
            marginBottom: '16px'
        },
        recentCard: {
            background: '#0d1117',
            border: '1px solid #21262d',
            borderRadius: '12px',
            padding: '20px'
        },
        recentItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #21262d'
        },
        modeBadge: {
            background: '#1f6feb22',
            border: '1px solid #1f6feb44',
            borderRadius: '50px',
            padding: '4px 12px',
            color: '#58a6ff',
            fontSize: '12px'
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#8b949e',
            gap: '10px'
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.wrapper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#58a6ff' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚙️</div>
                    <p>Loading your progress...</p>
                </div>
            </div>
        );
    }

    const modeEmojis = {
        'Bug Finder': '🐛',
        'Interview Evaluator': '🎯',
        'Hint System': '💡',
        'Complexity Analyzer': '📊',
        'Auto Documentation': '📖'
    };

    return (
        <div style={styles.wrapper}>

            {/* Topbar */}
            <div style={styles.topbar}>
                <button
                    style={styles.backBtn}
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back
                </button>
                <span style={styles.title}>📈 Progress Dashboard</span>
                <span style={styles.badge}>👋 {username}</span>
            </div>

        
            <div style={styles.content}>

                <p style={styles.pageTitle}>Your Learning Journey</p>
                <p style={styles.pageSubtitle}>
                    Track your growth as a developer — every review makes you better!
                </p>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <div style={{ ...styles.statCard, borderColor: '#1f6feb44' }}>
                        <div style={styles.statIcon}>📊</div>
                        <div style={styles.statNumber}>{data?.total_reviews || 0}</div>
                        <div style={styles.statLabel}>Total Reviews</div>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#f8514944' }}>
                        <div style={styles.statIcon}>🐛</div>
                        <div style={{ ...styles.statNumber, background: 'linear-gradient(90deg, #f85149, #ff7b72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {data?.bugs_fixed || 0}
                        </div>
                        <div style={styles.statLabel}>Bugs Analyzed</div>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#3fb95044' }}>
                        <div style={styles.statIcon}>📚</div>
                        <div style={{ ...styles.statNumber, background: 'linear-gradient(90deg, #3fb950, #56d364)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {data?.topics_learned || 0}
                        </div>
                        <div style={styles.statLabel}>Topics Learned</div>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#e3b34144' }}>
                        <div style={styles.statIcon}>🎯</div>
                        <div style={{ ...styles.statNumber, background: 'linear-gradient(90deg, #e3b341, #f0c060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {data?.interviews_done || 0}
                        </div>
                        <div style={styles.statLabel}>Interviews Done</div>
                    </div>
                </div>

                
                <div style={styles.chartsGrid}>

                    {/* Daily Activity Chart */}
                    <div style={styles.chartCard}>
                        <p style={styles.chartTitle}>📅 Last 7 Days Activity</p>
                        {data?.daily_activity?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.daily_activity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#8b949e', fontSize: 11 }}
                                        tickFormatter={(v) => v?.slice(5)}
                                    />
                                    <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#161b27',
                                            border: '1px solid #30363d',
                                            borderRadius: '8px',
                                            color: '#e6edf3'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#1f6feb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>
                                <p style={{ fontSize: '2rem' }}>📅</p>
                                <p>No activity in last 7 days</p>
                                <p style={{ fontSize: '12px' }}>Start reviewing code to see your progress!</p>
                            </div>
                        )}
                    </div>

                    {/* feature usage pie chart */}
                    <div style={styles.chartCard}>
                        <p style={styles.chartTitle}>🎯 Feature Usage Breakdown</p>
                        {data?.mode_breakdown?.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={data.mode_breakdown}
                                            dataKey="count"
                                            nameKey="mode"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                        >
                                            {data.mode_breakdown.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#161b27',
                                                border: '1px solid #30363d',
                                                borderRadius: '8px',
                                                color: '#e6edf3'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {data.mode_breakdown.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            <span style={{ color: '#8b949e', fontSize: '11px' }}>
                                                {modeEmojis[item.mode] || '📌'} {item.mode} ({item.count})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={styles.emptyState}>
                                <p style={{ fontSize: '2rem' }}>🎯</p>
                                <p>No feature usage yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div style={styles.recentCard}>
                    <p style={{ ...styles.chartTitle, marginBottom: '16px' }}>
                        🕒 Recent Reviews
                    </p>
                    {data?.recent_reviews?.length > 0 ? (
                        data.recent_reviews.map((review, i) => (
                            <div key={i} style={{
                                ...styles.recentItem,
                                borderBottom: i === data.recent_reviews.length - 1 ? 'none' : '1px solid #21262d'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {modeEmojis[review.mode] || '📌'}
                                    </span>
                                    <div>
                                        <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: 600 }}>
                                            {review.mode}
                                        </p>
                                        <p style={{ color: '#8b949e', fontSize: '12px' }}>
                                            {review.language?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <span style={{ color: '#484f58', fontSize: '12px' }}>
                                    {new Date(review.reviewed_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <p>No reviews yet — start coding! 🚀</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Progress;