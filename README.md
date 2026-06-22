## CodeSense AI 

AI-powered code review and learning platform for students preparing for placements.

## What it does
- Finds bugs and explains why they happened with visual flowcharts
- Evaluates code like a FAANG interviewer with score and Big O analysis
- Progressive hint system that teaches without spoiling the answer
- Complexity analyzer with visual Big O bars
- Auto documentation generator
- Run code directly with AI explanation of errors
- Progress dashboard to track learning over time

## Tech Stack
- **Frontend:** React.js, Monaco Editor, Mermaid.js, Recharts
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL on Supabase
- **AI:** Groq API with LLaMA3 70B
- **Code Execution:** Glot.io API

## Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm start
```

