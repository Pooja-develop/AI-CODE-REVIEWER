# CodeSense AI

An AI-powered code review tool built for students prepping for placements — upload code, get feedback like a real interviewer would give, not just a linter dump.

## Why I built this

Most AI code review tools either just find syntax bugs or are way too generic. As someone preparing for placements myself, I wanted something that reviews code the way an actual interviewer evaluates it in a coding round — checking time complexity, edge cases, and code quality, not just "this line has an error.

## What it does

- Reviews submitted code and scores it on correctness, time complexity, and code quality
- Explains bugs with reasoning, not just pointing at the line
- Progressive hint system — gives hints in stages instead of the full answer, so you actually learn
- Visual Big O complexity analysis
- Auto-generates documentation for submitted code
- Runs code directly and explains any errors using AI
- Tracks your progress over time on a dashboard

## Tech stack

- Frontend: React, Monaco Editor (for the code editor), Mermaid.js (flowcharts), Recharts (progress charts)
- Backend: FastAPI, Python
- Database: PostgreSQL (hosted on Supabase)
- AI: Groq API with LLaMA3 
- Code execution: Glot API

## Why these choices

- **FastAPI over Flask** — wanted async support for handling code execution calls without blocking
- **Supabase/Postgres** — needed proper relational storage for user accounts and progress tracking, unlike GSTMitra AI which didn't need concurrent multi-user writes
- **Monaco Editor** — same editor VS Code uses, so the coding experience feels familiar

## Running it locally

### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
npm start
## What I'd improve next

- Add support for more languages beyond what's currently tested
- Improve the hint system to adapt based on how many hints a user typically needs
- Deploy a live demo