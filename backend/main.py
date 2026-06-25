import os
import httpx
import json
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv


load_dotenv()

from database import (
    signup_user,
    signin_user,
    get_user_info,
    update_review_count,
    save_review_history,
    save_bug_history,
    get_user_progress,
)
from reviewer import (
    find_bugs,
    evaluate_interview,
    generate_documentation,
    get_hints,
    analyze_complexity,
    detect_language,
    call_llm,
    explain_topic
)


app = FastAPI(
    title="AI Code Reviewer API",
    description="Backend API for AI Code Reviewer & Learning Platform",
    version="1.0.0"
)

# cors setup so frontend can call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class SigninRequest(BaseModel):
    username: str
    password: str

class ReviewRequest(BaseModel):
    username: str
    mode: str
    language: str
    code: str
    problem: Optional[str] = ""

class BugWithDiagramRequest(BaseModel):
    username: str
    language: str
    code: str

class TopicRequest(BaseModel):
    topic_name: str

class RunCodeRequest(BaseModel):
    username: str
    code: str
    language: str
    stdin: Optional[str] = ""


# basic health check routes
@app.get("/")
def home():
    return {
        "message": "AI Code Reviewer API is running!",
        "status": "success",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

# auth routes - signup and signin
@app.post("/auth/signup")
async def signup(request: SignupRequest):
    try:
        success, message = signup_user(
            request.username,
            request.email,
            request.password
        )
        return {"success": success, "message": message}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}

@app.post("/auth/signin")
def signin(request: SigninRequest):
    success, message = signin_user(
        request.username,
        request.password
    )
    return {
        "success": success,
        "message": message,
        "username": request.username if success else None
    }

@app.get("/user/info/{username}")
def user_info(username: str):
    user = get_user_info(username)
    if user:
        return {
            "success": True,
            "username": user["username"],
            "email": user["email"],
            "reviews_count": user["reviews_count"],
            "created_at": str(user["created_at"])
        }
    return {"success": False, "message": "User not found"}

#  bug finder with mermaid diagram
@app.post("/review/bug-with-diagram")
def bug_finder_with_diagram(request: BugWithDiagramRequest):
    try:
        language = request.language
        if language == "Auto Detect":
            language = detect_language(request.code)

        
        bug_result = find_bugs(request.code, language)

        diagram_prompt = f"""
Create a detailed Mermaid flowchart that explains how this {language} code works step by step.

Code:
{request.code}

Rules:
- Start exactly with: graph TD
- Show complete code flow from start to end
- Minimum 6 nodes maximum 10 nodes
- Show where the bug or error occurs
- Use arrows to show flow direction
- Labels must be clear simple English
- No special characters inside labels

Return ONLY the graph TD code. Nothing else.
"""
        diagram = call_llm(diagram_prompt, temperature=0.1)
        diagram = diagram.replace('```mermaid', '').replace('```', '').strip()
        if not diagram.startswith('graph'):
            diagram = "graph TD\n    A[Code Start] --> B[Process]\n    B --> C[Bug Found]\n    C --> D[Fix Required]"

        
        topic_prompt = f"""
Look at this code error and list exactly 3 programming topics to learn.
Return ONLY a JSON array like: ["Topic1", "Topic2", "Topic3"]
Error: {bug_result[:300]}
"""

        topics_raw = call_llm(topic_prompt, temperature=0.1)
        try:
            clean = topics_raw.replace('```json', '').replace('```', '').strip()
            topics = json.loads(clean)
        except Exception:
            topics = ["Data Structures", "Time Complexity", "Error Handling"]
        save_review_history(
            request.username, "Bug Finder",
            language, request.code, bug_result
        )
        update_review_count(request.username)

        return {
            "success": True,
            "bug_explanation": bug_result,
            "mermaid_diagram": diagram,
            "topics_to_learn": topics,
            "language": language
        }

    except Exception as e:
        return {
            "success": False,
            "bug_explanation": f"Error: {str(e)}",
            "mermaid_diagram": "graph TD\n    A[Error] --> B[Check Code]",
            "topics_to_learn": ["Functions", "Variables", "Loops"]
        }

# interview evaluate for faang companies
@app.post("/review/interview")
def interview_evaluator(request: ReviewRequest):
    try:
        language = request.language
        if language == "Auto Detect":
            language = detect_language(request.code)

        result = evaluate_interview(request.code, language)
        save_review_history(
            request.username, "Interview Evaluator",
            language, request.code, result
        )
        update_review_count(request.username)

        return {"success": True, "result": result, "language": language}
    except Exception as e:
        return {"success": False, "result": f"Error: {str(e)}"}

#Auto documentation of a codes
@app.post("/review/docs")
def auto_documentation(request: ReviewRequest):
    try:
        language = request.language
        if language == "Auto Detect":
            language = detect_language(request.code)

        result = generate_documentation(request.code, language)
        save_review_history(
            request.username, "Auto Documentation",
            language, request.code, result
        )
        update_review_count(request.username)

        return {"success": True, "result": result, "language": language}
    except Exception as e:
        return {"success": False, "result": f"Error: {str(e)}"}

# hint system 
@app.post("/review/hint")
def hint_system(request: ReviewRequest):
    try:
        language = request.language
        if language == "Auto Detect":
            language = detect_language(request.code)

        result = get_hints(request.code, request.problem, language)
        save_review_history(
            request.username, "Hint System",
            language, request.code, result
        )
        update_review_count(request.username)

        return {"success": True, "result": result, "language": language}
    except Exception as e:
        return {"success": False, "result": f"Error: {str(e)}"}

# Complexity analyzer
@app.post("/review/complexity")
def complexity_analyzer(request: ReviewRequest):
    try:
        language = request.language
        if language == "Auto Detect":
            language = detect_language(request.code)

        result = analyze_complexity(request.code, language)
        save_review_history(
            request.username, "Complexity Analyzer",
            language, request.code, result
        )
        update_review_count(request.username)

        return {"success": True, "result": result, "language": language}
    except Exception as e:
        return {"success": False, "result": f"Error: {str(e)}"}

# TOPIC EXPLANATION
@app.post("/topic/explain")
def explain_topic_route(request: TopicRequest):
    try:
        explanation = explain_topic(request.topic_name)
        return {
            "success": True,
            "topic": request.topic_name,
            "explanation": explanation
        }
    except Exception as e:
        return {"success": False, "explanation": f"Error: {str(e)}"}


# run code in glot.io for all languages
GLOT_LANGUAGE_MAP = {
    "python": "python",
    "javascript": "javascript",
    "java": "java",
    "cpp": "cpp",
    "c": "c",
    "typescript": "typescript",
    "go": "go",
    "sql": None,
}

FILENAME_MAP = {
    "python": "main.py",
    "javascript": "main.js",
    "java": "Main.java",
    "cpp": "main.cpp",
    "c": "main.c",
    "typescript": "main.ts",
    "go": "main.go"
}

@app.post("/code/run")
async def run_code(request: RunCodeRequest):
    
    try:
        language = request.language.lower()
        glot_lang = GLOT_LANGUAGE_MAP.get(language)

        if not glot_lang:
            return {
                "success": False,
                "output": "",
                "error": f"Language {language} not supported",
                "has_error": True,
                "ai_explanation": "",
                "language": request.language
            }

        glot_token = os.getenv("GLOT_API_TOKEN", "")
        filename = FILENAME_MAP.get(language, "main.py")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://glot.io/api/run/{glot_lang}/latest",
                json={
                    "files": [
                        {
                            "name": filename,
                            "content": request.code
                        }
                    ],
                    "stdin": request.stdin or "",
                    "command": ""
                },
                headers={
                    "Authorization": f"Token {glot_token}",
                    "Content-Type": "application/json"
                }
            )

        result = response.json()

        stdout = result.get("stdout", "")
        stderr = result.get("stderr", "")
        error = result.get("error", "")

        has_error = bool(stderr or error)
        output = stdout.strip()
        error_text = (stderr or error or "").strip()

        ai_explanation = ""
        if has_error and error_text:
            explain_prompt =  """
A student ran this """ + request.language + """ code and got an error.

Code:
""" + request.code + """

Error Output:
""" + error_text + """

Explain clearly for a beginner student:
## 🔴 What This Error Means
## 📍 Which Line Caused It
## 🤔 Why It Happened
## ✅ How To Fix It
"""
            ai_explanation = call_llm(explain_prompt, temperature=0.2)

        return {
            "success": True,
            "output": output,
            "error": error_text,
            "has_error": has_error,
            "ai_explanation": ai_explanation,
            "language": request.language
        }

    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": f"Error: {str(e)}",
            "has_error": True,
            "ai_explanation": "",
            "language": request.language
        }
    
# PROGRESS DASHBOARD
@app.get("/user/progress/{username}")
def get_progress(username: str):
    """Get user progress stats for dashboard"""
    try:
        progress = get_user_progress(username)
        if progress:
            return {"success": True, "data": progress}
        return {"success": False, "message": "No data found"}
    except Exception as e:
        return {"success": False, "message": str(e)}