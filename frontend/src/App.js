// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BugFinder from './pages/BugFinder';
import InterviewEvaluator from './pages/InterviewEvaluator';
import HintSystem from './pages/HintSystem';
import ComplexityAnalyzer from './pages/ComplexityAnalyzer';
import AutoDocs from './pages/AutoDocs';
import Progress from './pages/Progress';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bugfinder" element={<BugFinder />} />
                <Route path="/interview-evaluator" element={<InterviewEvaluator />} />
                <Route path="/hint-system" element={<HintSystem />} />
                <Route path="/complexity-analyzer" element={<ComplexityAnalyzer />} />
                <Route path="/AutoDocs" element={<AutoDocs />} />
                <Route path="/progress" element={<Progress />} />
            </Routes>
        </Router>
    );
}

export default App;