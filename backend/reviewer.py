import os
from groq import Groq
from dotenv import load_dotenv
from prompts import (
    BUG_FINDER_PROMPT,
    INTERVIEW_EVALUATOR_PROMPT,
    DOCUMENTATION_PROMPT,
    HINT_SYSTEM_PROMPT,
    COMPLEXITY_ANALYZER_PROMPT,
    MERMAID_DIAGRAM_PROMPT,
    TOPIC_EXTRACTION_PROMPT
)

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(prompt, temperature=0.3):
    """Call Groq LLaMA API"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code reviewer and developer assistant. Always provide detailed, accurate, educational feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=2048
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"


def find_bugs(code, language):
    prompt = BUG_FINDER_PROMPT.format(code=code, language=language)
    return call_llm(prompt, temperature=0.2)


def evaluate_interview(code, language):
    prompt = INTERVIEW_EVALUATOR_PROMPT.format(code=code, language=language)
    return call_llm(prompt, temperature=0.3)


def generate_documentation(code, language):
    prompt = DOCUMENTATION_PROMPT.format(code=code, language=language)
    return call_llm(prompt, temperature=0.4)


def get_hints(code, problem, language):
    prompt = HINT_SYSTEM_PROMPT.format(
        code=code,
        problem=problem,
        language=language
    )
    return call_llm(prompt, temperature=0.5)


def analyze_complexity(code, language):
    prompt = COMPLEXITY_ANALYZER_PROMPT.format(code=code, language=language)
    return call_llm(prompt, temperature=0.2)


def detect_language(code):
    code_lower = code.lower()
    if "def " in code_lower or "import " in code_lower:
        return "Python"
    elif "public class" in code_lower or "system.out" in code_lower:
        return "Java"
    elif "console.log" in code_lower or "const " in code_lower:
        return "JavaScript"
    elif "#include" in code_lower or "cout" in code_lower:
        return "C++"
    elif "select " in code_lower and "from " in code_lower:
        return "SQL"
    else:
        return "Unknown"


# not currently called from main.py - was using this before i moved the
# diagram prompt inline into the bug finder route. keeping it here for now
def generate_mermaid_diagram(error_explanation, language):
    prompt = f"""
Create a detailed Mermaid flowchart that explains the code flow and where the bug occurs.

Language: {language}
Error found: {error_explanation[:400]}

Rules:
- Start exactly with: graph TD
- Minimum 6 nodes maximum 10 nodes
- Show complete flow from start to end
- Mark where bug occurs clearly
- Use only simple English words in labels
- No quotes or special characters inside labels

Return ONLY the graph TD code. Nothing else.
"""
    result = call_llm(prompt, temperature=0.1)
    result = result.replace('```mermaid', '').replace('```', '').strip()
    if not result.startswith('graph'):
        result = "graph TD\n    A[Code Start] --> B[Process Data]\n    B --> C[Bug Found Here]\n    C --> D[Fix Required]"
    return result


def explain_topic(topic_name):
    prompt = f"""
    Explain the programming concept: {topic_name}

    ## 📖 What is {topic_name}?
    Simple 2-3 sentence explanation.

    ## 🔑 Key Points
    3-4 bullet points.

    ## 💡 Simple Example
    Show a simple code example.

    ## 🔄 How It Causes Errors
    How misunderstanding this causes common bugs.

    ## 📊 Mermaid Diagram
    Generate a simple Mermaid diagram:
    graph TD
    """
    return call_llm(prompt, temperature=0.4)